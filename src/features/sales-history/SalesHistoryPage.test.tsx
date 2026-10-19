import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import { SalesHistoryPage } from "./SalesHistoryPage";

const { getSaleDetailsMock, listSalesMock, updateSaleMock } = vi.hoisted(() => ({
  getSaleDetailsMock: vi.fn(),
  listSalesMock: vi.fn(),
  updateSaleMock: vi.fn(),
}));

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn(), subscribeToClear: vi.fn(() => () => {}) },
}));

vi.mock("./repository/sales-history.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./repository/sales-history.repository")>();
  return {
    ...actual,
    salesHistoryRepository: {
      ...actual.salesHistoryRepository,
      getSaleDetails: getSaleDetailsMock,
      listSales: listSalesMock,
      updateSale: updateSaleMock,
    },
  };
});

const sales = [
  { id: "V-1042", data: "24/03/2026 14:32", cliente: "Ana Lima", pagamento: "Pix", total: 104, tipoVenda: "online" as const, frete: 15, enviado: false, itens: [] },
  { id: "V-1041", data: "24/03/2026 11:15", cliente: "Carlos Mendes", pagamento: "Cartão de crédito", total: 156, tipoVenda: "presencial" as const, desconto: 0, itens: [] },
  { id: "V-1040", data: "23/03/2026 16:45", cliente: "Mariana Costa", pagamento: "Pix", total: 232, tipoVenda: "online" as const, canalOnline: "whatsapp" as const, codigoRastreio: "BR123456789XX", frete: 20, enviado: true, itens: [] },
  { id: "V-1039", data: "23/03/2026 10:20", cliente: "Pedro Alves", pagamento: "Dinheiro", total: 67.5, tipoVenda: "presencial" as const, itens: [] },
  { id: "V-1038", data: "22/03/2026 15:00", cliente: "Juliana Santos", pagamento: "Cartão de débito", total: 345, tipoVenda: "presencial" as const, itens: [] },
];

function saleRow(id: string) {
  return within(screen.getByRole("table")).getByRole("row", { name: new RegExp(id) });
}

describe("SalesHistory: caracterizacao do historico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listSalesMock.mockResolvedValue(sales);
    getSaleDetailsMock.mockImplementation(async (id: string) => ({
      ...sales.find((sale) => sale.id === id),
      ...(updateSaleMock.mock.calls.length > 0 && id === "V-1041" ? { cancelada: true, pagamento: "Pix" } : {}),
      itens: [{ nome: "Decant Creed Aventus 3ml", categoria: "Perfume", volume: "3ml", quantidade: 3, valorUnitario: 28, tipoItem: "DECANT" as const }],
    }));
    updateSaleMock.mockImplementation(async (sale: (typeof sales)[number]) => sale);
    vi.mocked(sessionService.restore).mockReturnValue({
      accessToken: "test-only", expiresAt: "2099-01-01T00:00:00Z",
      user: { id: "qa-admin", nome: "Admin teste", email: "admin@example.test", cargo: "Administrador" },
    });
  });

  it("carrega do endpoint, omite pendentes e combina canal, pagamento e busca", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1040")).toBeInTheDocument());
    expect(listSalesMock).toHaveBeenCalledOnce();
    expect(screen.queryByRole("cell", { name: "V-1042" })).not.toBeInTheDocument();
    expect(saleRow("V-1040")).toHaveTextContent("Finalizado");
    expect(within(saleRow("V-1040")).getByText("WhatsApp")).toHaveClass("bg-green-100", "text-green-700");
    expect(saleRow("V-1040")).not.toHaveTextContent("BR123456789XX");
    expect(screen.queryByText("Rastreio: BR123456789XX")).not.toBeInTheDocument();
    await user.click(within(saleRow("V-1040")).getByRole("button", { name: "Ver recibo" }));
    expect(await screen.findByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("BR123456789XX");
    expect(screen.getByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("23/03/2026 16:45");
    expect(within(screen.getByRole("dialog", { name: "Recibo da Venda" })).getByText("Perfume", { exact: true })).toBeInTheDocument();
    await user.click(within(screen.getByRole("dialog", { name: "Recibo da Venda" })).getAllByRole("button", { name: "Fechar" }).at(-1)!);
    await user.click(screen.getByRole("button", { name: "Presencial", exact: true }));
    await user.selectOptions(screen.getByRole("combobox"), "Dinheiro");
    expect(saleRow("V-1039")).toHaveTextContent("Pedro Alves");
    expect(screen.queryByRole("cell", { name: "V-1041" })).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Buscar venda ou cliente..."), "inexistente");
    expect(within(screen.getByRole("table")).getByText("Nenhuma venda encontrada.")).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText("Buscar venda ou cliente..."));
    expect(saleRow("V-1039")).toBeInTheDocument();
  });

  it("funcionario consulta vendas sem editar nem visualizar faturamento", async () => {
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, cargo: "Funcionário" } });
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1041")).toBeInTheDocument());
    expect(saleRow("V-1041")).toHaveTextContent("Carlos Mendes");
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByText("Faturamento")).not.toBeInTheDocument();
  });

  it("admin pode descartar edicao ou salvar pagamento e cancelamento preservando o recibo", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1041")).toBeInTheDocument());
    const initialRevenue = screen.getByText("Faturamento").parentElement?.textContent;
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Editar" }));
    let dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    expect(dialog.queryByText("Código de rastreio")).not.toBeInTheDocument();
    expect(dialog.queryByText("0", { exact: true })).not.toBeInTheDocument();
    expect(dialog.queryByRole("button", { name: "Pendente", exact: true })).not.toBeInTheDocument();
    await user.selectOptions(dialog.getByRole("combobox"), "Pix");
    await user.click(dialog.getAllByRole("button", { name: "Fechar", exact: true })[0]);
    expect(saleRow("V-1041")).toHaveTextContent("Cartão de crédito");
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Editar" }));
    dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    await user.selectOptions(dialog.getByRole("combobox"), "Pix");
    await user.click(dialog.getByRole("button", { name: "Cancelado", exact: true }));
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(saleRow("V-1041")).toHaveTextContent("Cancelado"));
    expect(updateSaleMock).toHaveBeenCalledWith(expect.objectContaining({ id: "V-1041", pagamento: "Pix", cancelada: true }));
    expect(saleRow("V-1041")).toHaveTextContent("Cancelado");
    expect(saleRow("V-1041")).toHaveTextContent("Pix");
    expect(saleRow("V-1041")).toHaveTextContent("R$ 156,00");
    expect(screen.getByText("Faturamento").parentElement?.textContent).not.toBe(initialRevenue);
    expect(screen.getByText("Faturamento").parentElement).toHaveTextContent("R$ 645");
    await user.click(screen.getByRole("button", { name: "Cancelado", exact: true }));
    expect(screen.queryByRole("cell", { name: "V-1040" })).not.toBeInTheDocument();
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Ver recibo" }));
    await waitFor(() => expect(getSaleDetailsMock).toHaveBeenCalledWith("V-1041"));
    expect(screen.getByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("Carlos Mendes");
    expect(screen.getByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("Decant Creed Aventus 3ml");
    expect(screen.getByRole("dialog", { name: "Recibo da Venda" })).toHaveTextContent("Cancelado");
  });

  it("exibe rastreio somente para WhatsApp com codigo e usa canal neutro na edicao", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1040")).toBeInTheDocument());
    await user.click(within(saleRow("V-1040")).getByRole("button", { name: "Editar" }));
    const dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));

    expect(dialog.getByText("Código de rastreio")).toBeInTheDocument();
    expect(dialog.getByText("BR123456789XX")).toHaveClass("break-all");
    expect(dialog.getByText("WhatsApp")).toHaveClass("peract-font-color-default", "peract-bg-card");
    expect(dialog.getByText("WhatsApp")).not.toHaveClass("bg-green-100", "text-green-700");
    expect(dialog.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("preserva o azul do Site na lista do historico", async () => {
    listSalesMock.mockResolvedValue([{ ...sales[2], canalOnline: "site" }]);
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1040")).toBeInTheDocument());
    expect(within(saleRow("V-1040")).getByText("Site")).toHaveClass("bg-blue-100", "text-blue-600");
  });

  it("omite rastreio de WhatsApp quando a venda nao tem codigo", async () => {
    listSalesMock.mockResolvedValue([{ ...sales[2], codigoRastreio: undefined }]);
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1040")).toBeInTheDocument());
    await user.click(within(saleRow("V-1040")).getByRole("button", { name: "Editar" }));
    expect(within(screen.getByRole("dialog", { name: "Editar Venda" })).queryByText("Código de rastreio")).not.toBeInTheDocument();
  });

  it("avisa sobre estoque insuficiente ao reativar e mantem a venda cancelada", async () => {
    listSalesMock.mockResolvedValue([{ ...sales[1], cancelada: true }]);
    updateSaleMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 400, data: { message: "Estoque insuficiente para o produto 42" } } });
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1041")).toBeInTheDocument());
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Editar" }));
    const dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    await user.click(dialog.getByRole("button", { name: "Finalizado", exact: true }));
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));

    expect(await dialog.findByRole("alert")).toHaveTextContent("um ou mais produtos estão sem estoque ou com quantidade insuficiente");
    expect(dialog.getByRole("alert")).toHaveTextContent("A venda permanece cancelada.");
    expect(screen.getByRole("dialog", { name: "Editar Venda" })).toBeInTheDocument();
    await user.click(dialog.getAllByRole("button", { name: "Fechar", exact: true })[0]);
    expect(saleRow("V-1041")).toHaveTextContent("Cancelado");
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Editar" }));
    expect(within(screen.getByRole("dialog", { name: "Editar Venda" })).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("permite repetir a reativacao depois de uma falha de estoque", async () => {
    listSalesMock.mockResolvedValue([{ ...sales[1], cancelada: true }]);
    updateSaleMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 400, data: { message: "Estoque insuficiente para o produto 42" } } });
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1041")).toBeInTheDocument());
    await user.click(within(saleRow("V-1041")).getByRole("button", { name: "Editar" }));
    const dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    await user.click(dialog.getByRole("button", { name: "Finalizado", exact: true }));
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    await dialog.findByRole("alert");
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Editar Venda" })).not.toBeInTheDocument());
    expect(saleRow("V-1041")).toHaveTextContent("Finalizado");
    expect(updateSaleMock).toHaveBeenCalledTimes(2);
  });

  it("retirar a finalizacao de venda online remove a venda do historico", async () => {
    const user = userEvent.setup();
    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-1040")).toBeInTheDocument());
    await user.click(within(saleRow("V-1040")).getByRole("button", { name: "Editar" }));
    const dialog = within(screen.getByRole("dialog", { name: "Editar Venda" }));
    await user.click(dialog.getByRole("button", { name: "Pendente", exact: true }));
    await user.click(dialog.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(screen.queryByRole("cell", { name: "V-1040" })).not.toBeInTheDocument());
  });

  it("paginates the filtered sales and reports the visible range", async () => {
    const user = userEvent.setup();
    const pagedSales = Array.from({ length: 25 }, (_, index) => ({
      ...sales[1],
      id: `V-${2000 + index}`,
      cliente: `Cliente ${index + 1}`,
      itens: [],
    }));
    listSalesMock.mockResolvedValue(pagedSales);

    render(<AppProvider><SalesHistoryPage /></AppProvider>);
    await waitFor(() => expect(saleRow("V-2000")).toBeInTheDocument());
    expect(screen.getAllByText("Exibindo 1 a 10 de 25 venda(s)")).toHaveLength(2);
    const secondPageButtons = screen.getAllByRole("button", { name: "2", exact: true });
    expect(secondPageButtons).toHaveLength(2);

    await user.click(secondPageButtons[0]);

    expect(saleRow("V-2010")).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "V-2000" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Exibindo 11 a 20 de 25 venda(s)")).toHaveLength(2);
  });
});