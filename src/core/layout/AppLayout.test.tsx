import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

const { useAppMock } = vi.hoisted(() => ({
  useAppMock: vi.fn(),
}));

vi.mock("../store/AppContext", () => ({
  useApp: useAppMock,
}));

import { AppLayout } from "./AppLayout";

const protectedPageRender = vi.fn();

function ProtectedPage({ label }: { label: string }) {
  protectedPageRender(label);
  return <div>{label}</div>;
}

function LayoutRoutes() {
  return <Routes>
        <Route element={<AppLayout />} path="/">
          <Route element={<div>Inicio</div>} index />
          <Route element={<ProtectedPage label="Produtos" />} path="estoque/produtos" />
          <Route element={<ProtectedPage label="Categorias" />} path="estoque/categorias" />
          <Route element={<div>Decants</div>} path="decants" />
          <Route element={<div>Body Splash</div>} path="bodysplash" />
          <Route element={<div>Registrar Venda</div>} path="vendas/registrar" />
          <Route element={<div>Histórico</div>} path="vendas/historico" />
          <Route element={<div>Pedidos</div>} path="vendas/pedidos" />
          <Route element={<ProtectedPage label="Clientes" />} path="clientes" />
          <Route element={<ProtectedPage label="Configurações" />} path="configuracoes" />
        </Route>
      </Routes>;
}

function renderLayout(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><LayoutRoutes /></MemoryRouter>);
}

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["/", "Início"],
    ["/estoque/produtos", "Estoque – Produtos"],
    ["/estoque/categorias", "Categorias"],
    ["/decants", "Decants"],
    ["/bodysplash", "Body Splash"],
    ["/vendas/registrar", "Registrar Venda"],
    ["/vendas/historico", "Histórico de Vendas"],
    ["/vendas/pedidos", "Pedidos Online"],
    ["/clientes", "Gestão de Pessoas"],
    ["/configuracoes", "Configurações"],
  ])("shows the correct page title for %s", (path, title) => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Administrador", email: "admin@canalperfumado.com.br", nome: "Admin", id: 1 },
      dismissNotification: vi.fn(),
      logout: vi.fn(),
      markAllRead: vi.fn(),
      notifications: [],
    });

    renderLayout(path);

    expect(within(screen.getByRole("banner")).getByText(title)).toBeInTheDocument();
  });

  it("hides admin-only navigation for employees and shows the access banner", () => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Funcionário", email: "func@canalperfumado.com.br", nome: "Beatriz", id: 2 },
      dismissNotification: vi.fn(),
      logout: vi.fn(),
      markAllRead: vi.fn(),
      notifications: [],
    });

    renderLayout("/vendas/registrar");

    expect(screen.queryByText("Gestão de Pessoas")).not.toBeInTheDocument();
    expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
    expect(screen.getByText(/Você está logado como/)).toBeInTheDocument();
  });

  it.each(["/clientes", "/clientes/", "/configuracoes", "/estoque/produtos", "/estoque/categorias"])("redirects employees away from %s without mounting the protected page", async path => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Funcionário", nome: "Funcionário", id: "employee" },
      notifications: [], logout: vi.fn(),
    });
    renderLayout(path);
    await waitFor(() => expect(within(screen.getByRole("banner")).getByText("Início")).toBeInTheDocument());
    expect(protectedPageRender).not.toHaveBeenCalled();
  });

  it.each(["/decants", "/bodysplash", "/vendas/registrar", "/vendas/historico", "/vendas/pedidos"])("keeps the permitted employee route %s available", path => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Funcionário", nome: "Funcionário", id: "employee" },
      notifications: [], logout: vi.fn(),
    });
    renderLayout(path);
    expect(within(screen.getByRole("banner")).queryByText("Início")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).not.toBeEmptyDOMElement();
  });

  it("rechecks permissions after an admin logs out and an employee logs in on the same route", async () => {
    useAppMock.mockReturnValue({ currentUser: { cargo: "Administrador", nome: "Admin", id: "admin" }, notifications: [], logout: vi.fn() });
    const view = renderLayout("/clientes");
    expect(screen.getByText("Clientes")).toBeInTheDocument();
    protectedPageRender.mockClear();
    useAppMock.mockReturnValue({ currentUser: null, notifications: [], logout: vi.fn() });
    view.rerender(<MemoryRouter initialEntries={["/clientes"]}><LayoutRoutes /></MemoryRouter>);
    expect(screen.queryByText("Clientes")).not.toBeInTheDocument();
    expect(protectedPageRender).not.toHaveBeenCalled();
    useAppMock.mockReturnValue({ currentUser: { cargo: "Funcionário", nome: "Funcionário", id: "employee" }, notifications: [], logout: vi.fn() });
    view.rerender(<MemoryRouter initialEntries={["/clientes"]}><LayoutRoutes /></MemoryRouter>);
    await waitFor(() => expect(within(screen.getByRole("banner")).getByText("Início")).toBeInTheDocument());
    expect(screen.queryByText("Clientes")).not.toBeInTheDocument();
    expect(protectedPageRender).not.toHaveBeenCalled();
  });

  it("does not render feature pages when the role is missing or unknown", () => {
    useAppMock.mockReturnValue({ currentUser: { nome: "Usuário", id: "unknown", cargo: "Unknown" }, notifications: [], logout: vi.fn() });
    renderLayout("/clientes");
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível verificar suas permissões");
    expect(protectedPageRender).not.toHaveBeenCalled();
  });

  it("shows admin navigation and handles notification actions and logout", () => {
    const dismissNotification = vi.fn();
    const logout = vi.fn();
    const markAllRead = vi.fn();

    useAppMock.mockReturnValue({
      currentUser: { cargo: "Administrador", email: "admin@canalperfumado.com.br", nome: "Admin", id: 1 },
      dismissNotification,
      logout,
      markAllRead,
      notifications: [
        {
          id: 1,
          message: "Produto em estoque baixo",
          productName: "Perfume X",
          read: false,
          timestamp: Date.now(),
          type: "low_stock",
        },
      ],
    });

    renderLayout("/estoque/produtos");

    expect(screen.getByRole("link", { name: "Gestão de Pessoas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configurações" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Produtos" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Notificações"));

    expect(screen.getByText("Notificações")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Marcar todas lidas"));
    fireEvent.click(screen.getByLabelText("Dispensar"));
    fireEvent.click(screen.getByTitle("Sair"));

    expect(markAllRead).toHaveBeenCalled();
    expect(dismissNotification).toHaveBeenCalledWith(1);
    expect(logout).toHaveBeenCalled();
  });
});