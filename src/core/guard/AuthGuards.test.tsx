import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
const { useAppMock, flags } = vi.hoisted(() => ({ useAppMock: vi.fn(), flags: { securityQuestionsEnabled: true } }));
vi.mock("../../app/context/AppContext", () => ({ useApp: useAppMock }));
vi.mock("../../environment", () => ({ environment: { features: flags } }));
import { AdminRoute, LoginRoute, ProtectedRoute, RecoveryRoute } from "./AuthGuards";

function renderRoutes(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<LoginRoute />}><Route path="/login" element={<div>Login público</div>} /></Route>
    <Route element={<RecoveryRoute />}><Route path="/recuperar-senha" element={<div>Recuperação pública</div>} /></Route>
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<div>Início protegido</div>} />
      <Route path="/configuracoes" element={<div>Segurança pessoal</div>} />
      <Route element={<AdminRoute />}><Route path="/estoque/produtos" element={<div>Estoque administrativo</div>} /></Route>
    </Route>
  </Routes></MemoryRouter>);
}
describe("Rotas públicas e permissões", () => {
  it("deep link recuperação funciona deslogado", () => {
    flags.securityQuestionsEnabled = true; useAppMock.mockReturnValue({ isLoggedIn: false });
    renderRoutes("/recuperar-senha"); expect(screen.getByText("Recuperação pública")).toBeInTheDocument();
  });
  it("flag desligada nega deep link", () => {
    flags.securityQuestionsEnabled = false; useAppMock.mockReturnValue({ isLoggedIn: false });
    renderRoutes("/recuperar-senha"); expect(screen.getByText("Login público")).toBeInTheDocument();
    flags.securityQuestionsEnabled = true;
  });
  it("rota protegida deslogada redireciona para login", () => {
    useAppMock.mockReturnValue({ isLoggedIn: false }); renderRoutes("/"); expect(screen.getByText("Login público")).toBeInTheDocument();
  });
  it("funcionário acessa segurança pessoal", () => {
    useAppMock.mockReturnValue({ isLoggedIn: true, currentUser: { cargo: "Funcionário" } });
    renderRoutes("/configuracoes?secao=seguranca"); expect(screen.getByText("Segurança pessoal")).toBeInTheDocument();
  });
  it("funcionário não acessa estoque por URL", () => {
    useAppMock.mockReturnValue({ isLoggedIn: true, currentUser: { cargo: "Funcionário" } });
    renderRoutes("/estoque/produtos"); expect(screen.getByText("Início protegido")).toBeInTheDocument();
  });
  it("login com sessão válida redireciona para início", () => {
    useAppMock.mockReturnValue({ isLoggedIn: true }); renderRoutes("/login"); expect(screen.getByText("Início protegido")).toBeInTheDocument();
  });
});