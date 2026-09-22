import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

const { useAppMock } = vi.hoisted(() => ({
  useAppMock: vi.fn(),
}));

vi.mock("../store/AppContext", () => ({
  useApp: useAppMock,
}));

import { AppLayout } from "./AppLayout";

function renderLayout(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />} path="/">
          <Route element={<div>Inicio</div>} index />
          <Route element={<div>Produtos</div>} path="estoque/produtos" />
          <Route element={<div>Categorias</div>} path="estoque/categorias" />
          <Route element={<div>Decants</div>} path="decants" />
          <Route element={<div>Body Splash</div>} path="bodysplash" />
          <Route element={<div>Registrar Venda</div>} path="vendas/registrar" />
          <Route element={<div>Histórico</div>} path="vendas/historico" />
          <Route element={<div>Pedidos</div>} path="vendas/pedidos" />
          <Route element={<div>Clientes</div>} path="clientes" />
          <Route element={<div>Configurações</div>} path="configuracoes" />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
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