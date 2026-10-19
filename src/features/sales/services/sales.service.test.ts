import { beforeEach, describe, expect, it, vi } from "vitest";
import { salesRepository } from "../repository/sales.repository";
import { calculateSaleTotals, cartQuantityError, fetchSalesData, groupSaleItems, registerSale, createSaleCustomer, searchSaleItems, validateNovoCliente } from "./sales.service";

vi.mock("../repository/sales.repository", () => ({ salesRepository: { listProducts: vi.fn(), searchSaleItems: vi.fn(), listCustomers: vi.fn(), createSale: vi.fn(), createCustomer: vi.fn() } }));

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

  it("distinguishes full products and fractionated bottles with nullable metadata", async () => {
    vi.mocked(salesRepository.searchSaleItems).mockResolvedValue([
      { id: 1002, nome: "Decant Sauvage 2ml", precoVenda: 49.9, volume: null, estoqueAtual: null, status: null },
      { id: 4010, nome: "Body Splash Sauvage 10ml", precoVenda: 69.9, estoqueAtual: null, status: null },
      { id: 42, nome: "Sauvage", precoVenda: 599.9, categoriaNome: null, estoqueAtual: null, status: null },
      { id: 43, nome: "Body Splash Sauvage 200ml", precoVenda: 299.9, categoriaNome: null, estoqueAtual: null, status: null },
      { id: 44, nome: "Inativo", precoVenda: 10, estoqueAtual: 3, status: 0 },
    ]);
    const items = await searchSaleItems("Sauvage", [
      { ...product, categoriaNome: "Perfume" },
      { ...product, id: 43, categoriaNome: "Body Splash" },
    ]);

    expect(items.map(item => item.apresentacao)).toEqual(["Fracionado", "Fracionado", "Perfume completo", "Body Splash completo"]);
    expect(items.map(item => item.volumetria)).toEqual(["2ml", "10ml", undefined, "200ml"]);
    expect(items[0].estoqueAtual).toBeUndefined();
    expect(items[2].estoqueAtual).toBe(4);
    await registerSale([{ catalogItem: items[0], quantidade: 1 }], customer, form);
    expect(salesRepository.createSale).toHaveBeenCalledWith(expect.objectContaining({ itens: [{ produtoId: 1002, quantidade: 1 }] }));
  });

  it("groups volume bottles by a unique base name and category, keeping IDs and prices", () => {
    const perfume = { ...product, nome: "Sauvage", categoriaNome: "Perfume" };
    const bodySplash = { ...product, id: 43, nome: "Sauvage", categoriaNome: "Body Splash" };
    const decant = { ...product, id: 1002, nome: "Decant Sauvage 2ml", nomeExibicao: "Decant Sauvage", volumetria: "2ml", tipo: "decant" as const, preco: 49.9 };
    const bottle = { ...product, id: 4010, nome: "Body Splash Sauvage 10ml", nomeExibicao: "Body Splash Sauvage", volumetria: "10ml", tipo: "body-splash-fracionado" as const, preco: 69.9 };

    const groups = groupSaleItems([bottle, decant, perfume, bodySplash], [perfume, bodySplash]);

    expect(groups).toHaveLength(2);
    expect(groups.find(group => group.categoria === "Perfume")?.items).toEqual([perfume, decant]);
    expect(groups.find(group => group.categoria === "Body Splash")?.items).toEqual([bodySplash, bottle]);
  });

  it("does not link ambiguous same-category products or a different category", () => {
    const perfume = { ...product, nome: "Sauvage", categoriaNome: "Perfume" };
    const duplicate = { ...perfume, id: 43 };
    const decant = { ...product, id: 1002, nome: "Decant Sauvage 2ml", nomeExibicao: "Decant Sauvage", volumetria: "2ml", tipo: "decant" as const };
    expect(groupSaleItems([perfume, duplicate, decant], [perfume, duplicate])).toHaveLength(3);
    expect(groupSaleItems([decant], [{ ...perfume, categoriaNome: "Body Splash" }])[0].items).toEqual([decant]);
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

  it("limits full products but does not apply unit stock to fractions", () => {
    expect(cartQuantityError(product, 4)).toBeNull();
    expect(cartQuantityError(product, 5)).toContain("Estoque insuficiente");
    expect(cartQuantityError({ ...product, estoqueAtual: undefined }, 1)).toContain("verificar o estoque");
    expect(cartQuantityError({ ...product, tipo: "decant", estoqueAtual: 0 }, 20)).toBeNull();
    expect(cartQuantityError({ ...product, tipo: "body-splash-fracionado", estoqueAtual: 0 }, 20)).toBeNull();
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