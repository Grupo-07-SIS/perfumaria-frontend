import { beforeEach, describe, expect, it, vi } from "vitest";
import { salesRepository } from "../repository/sales.repository";
import { calculateSaleTotals, fetchSalesData, registerSale, createSaleCustomer, validateNovoCliente } from "./sales.service";

vi.mock("../repository/sales.repository", () => ({ salesRepository: { listProducts: vi.fn(), listCustomers: vi.fn(), createSale: vi.fn(), createCustomer: vi.fn() } }));

const product = { id: 42, nome: "Perfume", preco: 45, estoqueAtual: 4, tipo: "produto" as const };
const customer = { id: 81, nome: "Ana", telefone: "11999998888", email: "ana@example.test" };
const form = { pagamento: "Pix", isOnline: false, canalOnline: null, frete: "", tipoDesconto: "percentual" as const, desconto: "10" };
const cart = [{ catalogItem: product, quantidade: 2 }];

describe("sales service", () => {
  beforeEach(() => vi.resetAllMocks());

  it("maps real products and customers, excluding inactive entries", async () => {
    vi.mocked(salesRepository.listProducts).mockResolvedValue([
      { id: 42, nome: "Perfume", precoVenda: 45, estoqueAtual: 4, status: 1 },
      { id: 43, nome: "Inativo", precoVenda: 20, estoqueAtual: 8, status: 0 },
    ]);
    vi.mocked(salesRepository.listCustomers).mockResolvedValue([
      { ...customer, status: 1 }, { ...customer, id: 82, email: null, telefone: null, status: 1 }, { ...customer, id: 83, status: 0 },
    ]);
    expect(await fetchSalesData()).toEqual({ products: [product], customers: [customer, { ...customer, id: 82, email: "", telefone: "" }] });
  });

  it("posts only supported fields with backend IDs and percentage discount", async () => {
    await registerSale(cart, customer, form);
    expect(salesRepository.createSale).toHaveBeenCalledWith({ clienteId: 81, forma: "Pix", tipoVenda: "PRESENCIAL", tipoDesconto: "PERCENTUAL", desconto: 10, itens: [{ produtoId: 42, quantidade: 2 }] });
  });

  it.each(["whatsapp", "site"] as const)("posts online sales with %s and fixed discount", async (canalOnline) => {
    await registerSale(cart, customer, { ...form, isOnline: true, canalOnline, frete: "15,50", tipoDesconto: "valor", desconto: "12,50" });
    expect(salesRepository.createSale).toHaveBeenCalledWith(expect.objectContaining({ tipoVenda: "ONLINE", canalVendaOnline: canalOnline.toUpperCase(), tipoDesconto: "VALOR", desconto: 12.5, frete: 15.5 }));
  });

  it("caps fixed discounts at the subtotal consistently with the preview", async () => {
    await registerSale(cart, customer, { ...form, tipoDesconto: "valor", desconto: "200" });
    expect(salesRepository.createSale).toHaveBeenCalledWith(expect.objectContaining({ desconto: 90 }));
    expect(calculateSaleTotals({ cart, ...form, tipoDesconto: "valor", desconto: "200" }).total).toBe(0);
  });

  it.each(["", "0"])("accepts free online shipping: %s", async (frete) => {
    await registerSale(cart, customer, { ...form, isOnline: true, canalOnline: "site", frete });
    expect(salesRepository.createSale).toHaveBeenCalledWith(expect.objectContaining({ frete: 0 }));
  });

  it.each(["-1", "abc", "Infinity", "NaN"])("rejects invalid online shipping: %s", async (frete) => {
    await expect(registerSale(cart, customer, { ...form, isOnline: true, canalOnline: "site", frete })).rejects.toThrow("frete");
    expect(salesRepository.createSale).not.toHaveBeenCalled();
  });

  it("adds freight after discount and ignores it for in-person sales", async () => {
    expect(calculateSaleTotals({ cart, ...form, isOnline: true, frete: "12,50" }).total).toBe(93.5);
    expect(calculateSaleTotals({ cart, ...form, isOnline: true, frete: "12,50", tipoDesconto: "valor", desconto: "200" }).total).toBe(12.5);
    expect(calculateSaleTotals({ cart, ...form, frete: "12,50" }).total).toBe(81);
    await registerSale(cart, customer, { ...form, frete: "12,50" });
    expect(salesRepository.createSale).toHaveBeenCalledWith(expect.not.objectContaining({ frete: expect.anything() }));
  });

  it.each([0, -1, 1.5, NaN, Infinity, 5])("rejects invalid or unavailable quantity %s", async (quantidade) => {
    await expect(registerSale([{ catalogItem: product, quantidade }], customer, form)).rejects.toThrow();
    expect(salesRepository.createSale).not.toHaveBeenCalled();
  });

  it.each(["-1", "101", "abc", "Infinity"])("rejects invalid percentage %s", async (desconto) => {
    await expect(registerSale(cart, customer, { ...form, desconto })).rejects.toThrow("desconto");
    expect(salesRepository.createSale).not.toHaveBeenCalled();
  });

  it("rejects empty cart, missing customer/payment/channel and synthetic IDs", async () => {
    await expect(registerSale([], customer, form)).rejects.toThrow("item");
    await expect(registerSale(cart, null, form)).rejects.toThrow("cliente");
    await expect(registerSale(cart, customer, { ...form, pagamento: "" })).rejects.toThrow("pagamento");
    await expect(registerSale(cart, customer, { ...form, isOnline: true })).rejects.toThrow("canal");
    await expect(registerSale([{ catalogItem: { ...product, id: -1 }, quantidade: 1 }], customer, form)).rejects.toThrow("produto");
    expect(salesRepository.createSale).not.toHaveBeenCalled();
  });

  it("validates and creates customers without inventing IDs", async () => {
    vi.mocked(salesRepository.createCustomer).mockResolvedValue({ ...customer, status: 1 });
    expect(await createSaleCustomer({ nome: " Ana ", telefone: "(11) 99999-8888", email: " ana@example.test " })).toEqual(customer);
    expect(salesRepository.createCustomer).toHaveBeenCalledWith({ nome: "Ana", telefone: "11999998888", email: "ana@example.test" });
    await expect(createSaleCustomer({ nome: "", telefone: "1", email: "" })).rejects.toThrow();
    expect(salesRepository.createCustomer).toHaveBeenCalledTimes(1);
  });

  it("validates required fields and backend length limits", () => {
    expect(validateNovoCliente({ nome: "", telefone: "", email: "" })).toEqual(expect.objectContaining({ nome: expect.any(String), telefone: expect.any(String), email: expect.any(String) }));
    expect(validateNovoCliente({ nome: "A".repeat(46), telefone: "123", email: "errado" })).toEqual(expect.objectContaining({ nome: expect.any(String), telefone: expect.any(String), email: expect.any(String) }));
  });

  it("propagates sale failures", async () => {
    vi.mocked(salesRepository.createSale).mockRejectedValue(new Error("offline"));
    await expect(registerSale(cart, customer, form)).rejects.toThrow("offline");
  });
});