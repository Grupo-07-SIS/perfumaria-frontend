import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../core/store/AppContext";
import { sessionService } from "../../core/auth/session.service";
import type { Cliente, Fornecedor, Funcionario } from "./models/people.models";
import { createCliente, fetchClientes, removeCliente, updateCliente } from "./services/clientes.service";
import { createFuncionario, fetchFuncionarios, removeFuncionario, updateFuncionario } from "./services/funcionarios.service";
import { PeoplePage } from "./PeoplePage";

const {
  createFornecedorMock,
  fetchFornecedoresMock,
  removeFornecedorMock,
  updateFornecedorMock,
} = vi.hoisted(() => ({
  createFornecedorMock: vi.fn(),
  fetchFornecedoresMock: vi.fn(),
  removeFornecedorMock: vi.fn(),
  updateFornecedorMock: vi.fn(),
}));

vi.mock("../../core/auth/session.service", () => ({
  sessionService: { restore: vi.fn() },
}));
vi.mock("../../core/services/botpress", () => ({
  triggerBotpressPresencialFlow: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./services/clientes.service", () => ({
  fetchClientes: vi.fn(),
  createCliente: vi.fn(),
  updateCliente: vi.fn(),
  removeCliente: vi.fn(),
}));
vi.mock("./services/funcionarios.service", () => ({
  fetchFuncionarios: vi.fn(),
  createFuncionario: vi.fn(),
  updateFuncionario: vi.fn(),
  removeFuncionario: vi.fn(),
}));
vi.mock("./services/fornecedores.service", () => ({
  fetchFornecedores: fetchFornecedoresMock,
  createFornecedor: createFornecedorMock,
  updateFornecedor: updateFornecedorMock,
  removeFornecedor: removeFornecedorMock,
}));

const clientesRemotos: Cliente[] = [
  {
    id: 1,
    nome: "Ana Lima",
    email: "ana@email.com",
    telefone: "(11) 99999-1111",
    endereco: { cep: "01310-100", logradouro: "Rua das Flores", numero: "100", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" },
    totalPedidos: 12,
  },
  {
    id: 2,
    nome: "Carlos Mendes",
    email: "carlos@email.com",
    telefone: "(21) 98888-2222",
    endereco: { cep: "22070-010", logradouro: "Av. Atlântica", numero: "200", bairro: "Copacabana", cidade: "Rio de Janeiro", uf: "RJ" },
    totalPedidos: 8,
  },
  {
    id: 3,
    nome: "Mariana Costa",
    email: "mariana@email.com",
    telefone: "(31) 97777-3333",
    endereco: { cep: "30130-170", logradouro: "Rua Ouro Preto", numero: "50", bairro: "Funcionários", cidade: "Belo Horizonte", uf: "MG" },
    totalPedidos: 20,
  },
  {
    id: 4,
    nome: "Pedro Alves",
    email: "pedro@email.com",
    telefone: "(85) 96666-6666",
    endereco: { cep: "60165-121", logradouro: "Av. Beira Mar", numero: "80", bairro: "Meireles", cidade: "Fortaleza", uf: "CE" },
    totalPedidos: 5,
  },
  {
    id: 5,
    nome: "Juliana Santos",
    email: "juliana@email.com",
    telefone: "(47) 95555-8888",
    endereco: { cep: "89010-002", logradouro: "Rua XV de Novembro", numero: "300", bairro: "Centro", cidade: "Blumenau", uf: "SC" },
    totalPedidos: 15,
  },
  {
    id: 6,
    nome: "Roberta Nunes",
    email: "roberta@email.com",
    telefone: "(11) 94444-7777",
    endereco: { cep: "04001-000", logradouro: "Rua Vergueiro", numero: "25", bairro: "Paraíso", cidade: "São Paulo", uf: "SP" },
    totalPedidos: 3,
    ativo: false,
  },
];

const funcionariosRemotos: Funcionario[] = [
  { id: "1", nome: "Administrador", cargo: "Administrador", email: "admin@canalperfumado.com.br", senha: "admin123" },
  { id: "2", nome: "Beatriz Oliveira", cargo: "Funcionário", email: "beatriz@canalperfumado.com.br", senha: "func123" },
];

const fornecedoresRemotos: Fornecedor[] = [{
  id: 4,
  razaoSocial: "FrascosBR Ltda",
  cnpj: "12.345.678/0001-90",
  email: "vendas@frascosbr.com.br",
  telefone: "(11) 3333-4444",
  endereco: { cep: "01001-000", logradouro: "Rua dos Frascos", numero: "50", bairro: "Centro", cidade: "São Paulo", uf: "SP" },
  totalCompras: 8,
}];

async function renderPeople() {
  render(<AppProvider><PeoplePage /></AppProvider>);
  await screen.findByText("Ana Lima");
  await waitFor(() => expect(screen.queryByText("Carregando pessoas...")).not.toBeInTheDocument());
}

function clienteCard(nome: string) {
  const card = screen.getByText(nome).closest(".bg-white");
  if (!card) throw new Error(`Card do cliente ${nome} não encontrado.`);
  return within(card);
}

describe("People: caracterizacao de filtros e permissoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sessionService.restore).mockReturnValue({
      accessToken: "test-only", expiresAt: "2099-01-01T00:00:00Z",
      user: { id: "qa-admin", nome: "Admin teste", email: "admin@example.test", cargo: "Administrador" },
    });
    vi.mocked(fetchClientes).mockResolvedValue(clientesRemotos.map(cliente => ({ ...cliente, endereco: { ...cliente.endereco } })));
    fetchFornecedoresMock.mockResolvedValue(fornecedoresRemotos.map(fornecedor => ({ ...fornecedor, endereco: { ...fornecedor.endereco } })));
    vi.mocked(fetchFuncionarios).mockResolvedValue(funcionariosRemotos.map(funcionario => ({ ...funcionario })));
    vi.mocked(createCliente).mockImplementation(async values => ({ id: 7, ...values, totalPedidos: 0, ativo: true }));
    vi.mocked(updateCliente).mockImplementation(async (cliente, values) => ({ ...cliente, ...values }));
    vi.mocked(removeCliente).mockImplementation(async cliente => cliente.id);
    createFornecedorMock.mockImplementation(async values => ({ id: 5, ...values, totalCompras: 0 }));
    updateFornecedorMock.mockImplementation(async (fornecedor, values) => ({ ...fornecedor, ...values }));
    removeFornecedorMock.mockImplementation(async fornecedor => fornecedor.id);
    vi.mocked(createFuncionario).mockImplementation(async values => ({ id: "3", ...values }));
    vi.mocked(updateFuncionario).mockImplementation(async (funcionario, values) => ({ ...funcionario, ...values }));
    vi.mocked(removeFuncionario).mockImplementation(async funcionario => funcionario.id);
  });

  it("preserva resultados ao digitar e consulta clientes somente ao submeter a busca", async () => {
    const user = userEvent.setup();
    await renderPeople();
    vi.mocked(fetchClientes).mockClear();
    const search = screen.getByPlaceholderText("Buscar cliente...");
    await user.type(search, "inexistente");
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("Carlos Mendes")).toBeInTheDocument();
    expect(fetchClientes).not.toHaveBeenCalled();

    vi.mocked(fetchClientes).mockResolvedValueOnce([]);
    await user.type(search, "{Enter}");

    await waitFor(() => expect(fetchClientes).toHaveBeenCalledWith({ busca: "inexistente", status: 1 }));
    expect(await screen.findByText("Nenhum cliente encontrado.")).toBeInTheDocument();
  });

  it("funcionario gerencia clientes sem acesso as abas administrativas", async () => {
    const user = userEvent.setup();
    const session = sessionService.restore()!;
    vi.mocked(sessionService.restore).mockReturnValue({ ...session, user: { ...session.user, cargo: "Funcionário" } });
    await renderPeople();
    expect(screen.queryByRole("button", { name: /^Fornecedores/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Funcionários/ })).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Novo cliente" })[0]);
    expect(screen.getByRole("dialog", { name: "Novo Cliente" })).toBeInTheDocument();
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
    expect(screen.getAllByText("Obrigatório.")).toHaveLength(2);
    await user.type(screen.getByPlaceholderText("Ex: Ana Lima"), "Cliente teste");
    await user.type(screen.getByPlaceholderText("(11) 99999-9999"), "11912345678");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("Cliente teste")).toBeInTheDocument();
    expect(createCliente).toHaveBeenCalledTimes(1);
  });

  it("admin submete busca somente para a aba ativa e limpa o texto ao trocar aba", async () => {
    const user = userEvent.setup();
    await renderPeople();
    await user.click(screen.getByRole("button", { name: /^Fornecedores/ }));
    expect(screen.getByPlaceholderText("Buscar fornecedor...")).toHaveValue("");
    vi.clearAllMocks();
    await user.type(screen.getByPlaceholderText("Buscar fornecedor..."), "vendas@fracsosbr.com.br");
    expect(screen.getByText("FrascosBR Ltda")).toBeInTheDocument();
    expect(fetchFornecedoresMock).not.toHaveBeenCalled();
    await user.type(screen.getByPlaceholderText("Buscar fornecedor..."), "{Enter}");
    await waitFor(() => expect(fetchFornecedoresMock).toHaveBeenCalledWith({ busca: "vendas@fracsosbr.com.br" }));
    expect(fetchClientes).not.toHaveBeenCalled();
    expect(fetchFuncionarios).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /^Funcionários/ }));
    expect(screen.getByPlaceholderText("Buscar funcionário...")).toHaveValue("");
    vi.clearAllMocks();
    await user.type(screen.getByPlaceholderText("Buscar funcionário..."), "ADMINISTRADOR");
    expect(screen.getAllByText("Beatriz Oliveira").length).toBeGreaterThan(0);
    expect(fetchFuncionarios).not.toHaveBeenCalled();
    await user.type(screen.getByPlaceholderText("Buscar funcionário..."), "{Enter}");
    await waitFor(() => expect(fetchFuncionarios).toHaveBeenCalledWith({ busca: "ADMINISTRADOR" }));
    expect(fetchClientes).not.toHaveBeenCalled();
    expect(fetchFornecedoresMock).not.toHaveBeenCalled();
  });

  it("bloqueia fornecedor com CNPJ incompleto ou e-mail invalido antes de chamar o backend", async () => {
    const user = userEvent.setup();
    await renderPeople();
    await user.click(screen.getByRole("button", { name: /^Fornecedores/ }));
    await user.click(screen.getAllByRole("button", { name: "Novo fornecedor" })[0]);
    const dialog = within(screen.getByRole("dialog", { name: "Novo Fornecedor" }));
    await user.type(dialog.getByPlaceholderText("Ex: Empresa Ltda"), "Teste");
    await user.type(dialog.getByPlaceholderText("00.000.000/0001-00"), "31873921378");
    await user.type(dialog.getByPlaceholderText("contato@empresa.com.br"), "teste@perfumaria,com");

    await user.click(dialog.getByRole("button", { name: "Salvar" }));

    expect(dialog.getByText("O CNPJ deve conter 14 dígitos.")).toBeInTheDocument();
    expect(dialog.getByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(createFornecedorMock).not.toHaveBeenCalled();
  });

  it("aplica mascara e limite de digitos nos campos do fornecedor", async () => {
    const user = userEvent.setup();
    await renderPeople();
    await user.click(screen.getByRole("button", { name: /^Fornecedores/ }));
    await user.click(screen.getAllByRole("button", { name: "Novo fornecedor" })[0]);
    const dialog = within(screen.getByRole("dialog", { name: "Novo Fornecedor" }));
    const cnpj = dialog.getByPlaceholderText("00.000.000/0001-00");
    const telefone = dialog.getByPlaceholderText("(11) 3333-4444");
    const cep = dialog.getByPlaceholderText("00000-000");
    const numero = dialog.getByPlaceholderText("Ex: 100");

    await user.type(cnpj, "12a345678000190999");
    await user.type(telefone, "11991643000123");
    await user.type(cep, "01001000999");
    await user.type(numero, "12b3");

    expect(cnpj).toHaveValue("12.345.678/0001-90");
    expect(telefone).toHaveValue("(11) 99164-3000");
    expect(cep).toHaveValue("01001-000");
    expect(numero).toHaveValue("123");
    expect(cnpj).toHaveAttribute("inputmode", "numeric");
    expect(telefone).toHaveAttribute("type", "tel");
    expect(cep).toHaveAttribute("inputmode", "numeric");
  });

  it("mostra no campo quando telefone ou CEP estao incompletos", async () => {
    const user = userEvent.setup();
    await renderPeople();
    await user.click(screen.getByRole("button", { name: /^Fornecedores/ }));
    await user.click(screen.getAllByRole("button", { name: "Novo fornecedor" })[0]);
    const dialog = within(screen.getByRole("dialog", { name: "Novo Fornecedor" }));
    await user.type(dialog.getByPlaceholderText("Ex: Empresa Ltda"), "Teste");
    await user.type(dialog.getByPlaceholderText("00.000.000/0001-00"), "12345678000190");
    await user.type(dialog.getByPlaceholderText("contato@empresa.com.br"), "teste@perfumaria.com");
    await user.type(dialog.getByPlaceholderText("(11) 3333-4444"), "119916");
    await user.type(dialog.getByPlaceholderText("00000-000"), "0100");

    await user.click(dialog.getByRole("button", { name: "Salvar" }));

    expect(dialog.getByText("Informe DDD + número (10 ou 11 dígitos).")).toBeInTheDocument();
    expect(dialog.getByText("O CEP deve conter 8 dígitos.")).toBeInTheDocument();
    expect(createFornecedorMock).not.toHaveBeenCalled();
  });

  it("admin cadastra fornecedor no backend e mantem o modal aberto quando a criacao falha", async () => {
    const user = userEvent.setup();
    await renderPeople();
    await user.click(screen.getByRole("button", { name: /^Fornecedores/ }));
    await user.click(screen.getAllByRole("button", { name: "Novo fornecedor" })[0]);
    const dialog = within(screen.getByRole("dialog", { name: "Novo Fornecedor" }));
    await user.type(dialog.getByPlaceholderText("Ex: Empresa Ltda"), "Essencias Ltda");
    await user.type(dialog.getByPlaceholderText("00.000.000/0001-00"), "12.345.678/0001-99");
    await user.type(dialog.getByPlaceholderText("contato@empresa.com.br"), "contato@essencias.test");

    createFornecedorMock.mockRejectedValueOnce(new Error("PEOPLE_SUPPLIERS_CREATE_FAILED:500"));
    await user.click(dialog.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("PEOPLE_SUPPLIERS_CREATE_FAILED:500")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Novo Fornecedor" })).toBeInTheDocument();
    expect(screen.queryByText("Essencias Ltda")).not.toBeInTheDocument();

    await user.click(dialog.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("Essencias Ltda")).toBeInTheDocument();
    expect(createFornecedorMock).toHaveBeenLastCalledWith(expect.objectContaining({
      razaoSocial: "Essencias Ltda",
      cnpj: "12.345.678/0001-99",
      email: "contato@essencias.test",
    }));
  });

  it("exibe a senha do funcionario sempre mascarada, pois o backend nao a retorna", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchFuncionarios).mockResolvedValue(funcionariosRemotos.map(({ senha: _senha, ...funcionario }) => funcionario));
    await renderPeople();
    await user.click(screen.getByRole("button", { name: /^Funcionários/ }));

    const table = within(screen.getByRole("table"));
    expect(table.getAllByLabelText("Senha protegida")).toHaveLength(funcionariosRemotos.length);
    expect(table.getAllByText("••••••")).toHaveLength(funcionariosRemotos.length);
    expect(screen.queryByText("Não definida")).not.toBeInTheDocument();
  });

  it("exige confirmacao para excluir cliente e permite cancelar", async () => {
    const user = userEvent.setup();
    await renderPeople();
    await user.click(clienteCard("Ana Lima").getByRole("button", { name: "Excluir cliente" }));
    await user.click(within(screen.getByRole("dialog", { name: "Confirmar exclusão" })).getByRole("button", { name: "Cancelar" }));
    expect(removeCliente).not.toHaveBeenCalled();
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();

    await user.click(clienteCard("Ana Lima").getByRole("button", { name: "Excluir cliente" }));
    await user.click(within(screen.getByRole("dialog", { name: "Confirmar exclusão" })).getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(screen.queryByText("Ana Lima")).not.toBeInTheDocument());
    expect(removeCliente).toHaveBeenCalledWith(expect.objectContaining({ id: 1, nome: "Ana Lima" }));
    expect(screen.queryByRole("dialog", { name: "Confirmar exclusão" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Ativos/ })).toHaveTextContent("4");
  });

  it("mantem cliente e modal de edicao abertos quando a atualizacao falha", async () => {
    const user = userEvent.setup();
    vi.mocked(updateCliente).mockRejectedValueOnce(new Error("PEOPLE_CLIENTS_UPDATE_FAILED:500"));
    await renderPeople();
    await user.click(clienteCard("Ana Lima").getByRole("button", { name: "Editar", exact: true }));
    const dialog = screen.getByRole("dialog", { name: "Editar Cliente" });
    await user.clear(within(dialog).getByPlaceholderText("Ex: Ana Lima"));
    await user.type(within(dialog).getByPlaceholderText("Ex: Ana Lima"), "Ana com falha");
    await user.click(within(dialog).getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("PEOPLE_CLIENTS_UPDATE_FAILED:500")).toBeInTheDocument();
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Editar Cliente" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex: Ana Lima")).toHaveValue("Ana com falha");
  });

  it("descarta edicao cancelada e restaura os dados do cliente ao reabrir", async () => {
    await renderPeople();
    fireEvent.click(clienteCard("Ana Lima").getByRole("button", { name: "Editar", exact: true }));
    fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Rascunho descartado" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }));
    fireEvent.click(clienteCard("Ana Lima").getByRole("button", { name: "Editar", exact: true }));
    expect(screen.getByPlaceholderText("Ex: Ana Lima")).toHaveValue("Ana Lima");
    fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Ana revisada" } });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("Ana revisada")).toBeInTheDocument();
    expect(updateCliente).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), expect.objectContaining({ nome: "Ana revisada" }));
  });

  it("mantem um novo cadastro aberto depois de salvar o anterior", async () => {
    await renderPeople();
    vi.useFakeTimers();
    try {
      fireEvent.click(screen.getAllByRole("button", { name: "Novo cliente" })[0]);
      fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Cliente salvo" } });
      fireEvent.change(screen.getByPlaceholderText("(11) 99999-9999"), { target: { value: "11912345678" } });
      fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Salvar" }));
      await act(async () => {});
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      fireEvent.click(screen.getAllByRole("button", { name: "Novo cliente" })[0]);
      fireEvent.change(screen.getByPlaceholderText("Ex: Ana Lima"), { target: { value: "Segundo cadastro" } });
      act(() => vi.advanceTimersByTime(1200));
      expect(screen.getByRole("dialog", { name: "Novo Cliente" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ex: Ana Lima")).toHaveValue("Segundo cadastro");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});