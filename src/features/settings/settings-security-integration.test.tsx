import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { useAppMock, flags, get } = vi.hoisted(() => ({ useAppMock: vi.fn(), flags: { securityQuestionsEnabled: true }, get: vi.fn() }));
vi.mock("../../core/store/AppContext", () => ({ useApp: useAppMock }));
vi.mock("../../environment", () => ({ environment: { features: flags } }));
vi.mock("../../core/services/http-client", () => ({ apiClient: { get, patch: vi.fn() } }));
vi.mock("./components/SecurityQuestionsForm", () => ({ SecurityQuestionsForm: () => <div>Formulário pessoal de perguntas</div> }));
import { SettingsPage } from "./SettingsPage";

beforeEach(() => {
  flags.securityQuestionsEnabled = true;
  get.mockReset().mockResolvedValue({ data: { limite: 5 } });
  useAppMock.mockReturnValue({ stockThresholds: { critico: 5 }, setStockThresholds: vi.fn(), currentUser: { id: "a", idOrganizacao: 7, cargo: "Funcionário", email: "pessoal@example.com" } });
});
describe("Configurações pessoais versus administrativas", () => {
  it("funcionário não acessa estoque nem mesmo com secao=estoque", () => {
    render(<MemoryRouter initialEntries={["/configuracoes?secao=estoque"]}><SettingsPage /></MemoryRouter>);
    expect(screen.getByText("Formulário pessoal de perguntas")).toBeInTheDocument();
    expect(screen.queryByText("Configurações de estoque")).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Alterar senha" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Alterar e-mail" })).toBeEnabled();
  });
  it("CTA secao=seguranca abre formulário inclusive para admin", () => {
    useAppMock.mockReturnValue({ stockThresholds: { critico: 5 }, setStockThresholds: vi.fn(), currentUser: { id: "a", cargo: "Administrador" } });
    render(<MemoryRouter initialEntries={["/configuracoes?secao=seguranca"]}><SettingsPage /></MemoryRouter>);
    expect(screen.getByText("Formulário pessoal de perguntas")).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });
  it("flag desligada oculta perguntas sem desativar integrações reais", () => {
    flags.securityQuestionsEnabled = false;
    render(<MemoryRouter initialEntries={["/configuracoes?secao=seguranca"]}><SettingsPage /></MemoryRouter>);
    expect(screen.queryByText("Formulário pessoal de perguntas")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alterar senha" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Alterar e-mail" })).toBeEnabled();
  });
});