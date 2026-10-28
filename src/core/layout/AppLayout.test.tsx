import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

const { useAppMock, useIsMobileMock } = vi.hoisted(() => ({
  useAppMock: vi.fn(),
  useIsMobileMock: vi.fn(),
}));

vi.mock("../store/AppContext", () => ({
  useApp: useAppMock,
}));
vi.mock("../../shared/hooks/useIsMobile", () => ({ useIsMobile: useIsMobileMock }));

import { AppLayout } from "./AppLayout";

const protectedPageRender = vi.fn();

function ProtectedPage({ label }: { label: string }) {
  protectedPageRender(label);
  return <div>{label}</div>;
}

function LayoutRoutes() {
  return <Routes>
        <Route element={<AppLayout />} path="/">
          <Route element={<div data-tour="tour-home-heading">Inicio</div>} index />
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
    useIsMobileMock.mockReturnValue(false);
  });

  it.each([
    ["/", "Início"],
    ["/estoque/produtos", "Estoque – Perfumes"],
    ["/estoque/categorias", "Categorias"],
    ["/decants", "Decants"],
    ["/bodysplash", "Body Splash"],
    ["/vendas/registrar", "Registrar Venda"],
    ["/vendas/historico", "Histórico de Vendas"],
    ["/vendas/pedidos", "Pedidos Online"],
    ["/clientes", "Gerenciamento"],
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

  it("hides admin-only navigation for employees without showing the access banner", () => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Funcionário", email: "func@canalperfumado.com.br", nome: "Beatriz", id: 2 },
      dismissNotification: vi.fn(),
      logout: vi.fn(),
      markAllRead: vi.fn(),
      notifications: [],
    });

    renderLayout("/vendas/registrar");

    expect(screen.queryByText("Gerenciamento")).not.toBeInTheDocument();
    expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrar Venda" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Histórico de Vendas" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedidos Online" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrar Venda" }).querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedidos Online" }).querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByText(/Você está logado como/)).not.toBeInTheDocument();
  });

      it.each(["/clientes", "/clientes/", "/configuracoes", "/estoque/produtos", "/estoque/categorias", "/vendas/historico"]) ("redirects employees away from %s without mounting the protected page", async path => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Funcionário", nome: "Funcionário", id: "employee" },
      notifications: [], logout: vi.fn(),
    });
    renderLayout(path);
    await waitFor(() => expect(within(screen.getByRole("banner")).getByText("Início")).toBeInTheDocument());
    expect(protectedPageRender).not.toHaveBeenCalled();
  });

    it.each(["/decants", "/bodysplash", "/vendas/registrar", "/vendas/pedidos"])("keeps the permitted employee route %s available", path => {
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

  it("shows admin navigation without notifications and preserves logout", () => {
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

    expect(screen.getByRole("link", { name: "Gerenciamento" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configurações" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Perfumes" })).toBeInTheDocument();

    const inventoryLinks = within(screen.getByRole("navigation")).getAllByRole("link")
      .map(link => link.textContent?.trim());
    const inventoryOrder = ["Perfumes", "Body Splash", "Decants", "Categorias"];
    expect(inventoryLinks.filter(label => inventoryOrder.includes(label ?? ""))).toEqual(inventoryOrder);

    expect(screen.queryByRole("button", { name: "Notificações" })).not.toBeInTheDocument();
    expect(screen.queryByText("Produto em estoque baixo")).not.toBeInTheDocument();
    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("img", { name: "Perfil de Admin" })).toHaveTextContent("A");
    expect(header.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("title", "Abrir menu");
    expect(header.getByRole("button", { name: "Sair" })).toHaveAttribute("title", "Sair");
    fireEvent.click(screen.getByTitle("Sair"));

    expect(markAllRead).not.toHaveBeenCalled();
    expect(dismissNotification).not.toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
  });

  it("shows icons for the sales navigation options", () => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Administrador", nome: "Admin", id: "admin" },
      notifications: [],
      logout: vi.fn(),
    });

    renderLayout("/vendas/historico");

    for (const label of ["Registrar Venda", "Histórico de Vendas", "Pedidos Online"]) {
      expect(screen.getByRole("link", { name: label }).querySelector("svg")).toBeInTheDocument();
    }
  });

  it("keeps Body Splash and Decants available under inventory for employees", () => {
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Funcionário", nome: "Funcionário", id: "employee" },
      notifications: [],
      logout: vi.fn(),
    });

    renderLayout("/decants");

    const navigation = within(screen.getByRole("navigation"));
    expect(navigation.getByRole("link", { name: "Body Splash" })).toBeInTheDocument();
    expect(navigation.getByRole("link", { name: "Decants" })).toBeInTheDocument();
    expect(navigation.queryByRole("link", { name: "Perfumes" })).not.toBeInTheDocument();
    expect(navigation.queryByRole("link", { name: "Categorias" })).not.toBeInTheDocument();
  });

  it("keeps the mobile tour menu bounded and closes the sidebar when starting", async () => {
    useIsMobileMock.mockReturnValue(true);
    useAppMock.mockReturnValue({
      currentUser: { cargo: "Administrador", nome: "Admin", id: "admin" },
      logout: vi.fn(),
    });
    renderLayout("/vendas/registrar");
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(screen.getByRole("complementary")).toHaveClass("translate-x-0");
    fireEvent.click(screen.getByRole("button", { name: "Escolher tour do sistema" }));
    const menu = screen.getByRole("dialog", { name: "Seções do tour" });
    expect(menu).toHaveClass("w-[calc(100vw-2rem)]", "max-w-80", "overflow-y-auto", "overscroll-contain");
    expect(menu).toHaveClass("max-h-[min(70dvh,var(--radix-popover-content-available-height))]");
    fireEvent.click(within(menu).getByRole("button", { name: "Fechar menu do tour" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Seções do tour" })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Escolher tour do sistema" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Seções do tour" })).getByRole("button", { name: "Tour completo", exact: true }));
    expect(screen.getByRole("complementary")).toHaveClass("-translate-x-full");
    expect(await screen.findByText("Este é o ponto de partida. A navegação lateral permite acessar as áreas liberadas para seu perfil.", {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it.each(["Administrador", "Funcionário"] as const)("offers the guided tour to %s", async cargo => {
    useAppMock.mockReturnValue({
      currentUser: { cargo, email: "user@example.test", nome: "Usuário", id: cargo },
      dismissNotification: vi.fn(),
      logout: vi.fn(),
      markAllRead: vi.fn(),
      notifications: [],
    });
    renderLayout("/vendas/registrar");

    fireEvent.click(screen.getByRole("button", { name: "Escolher tour do sistema" }));
    const tourMenu = within(screen.getByRole("dialog"));
    if (cargo === "Funcionário") {
      expect(tourMenu.queryByRole("button", { name: /^Estoque/ })).not.toBeInTheDocument();
      expect(tourMenu.queryByRole("button", { name: /^Gerenciamento/ })).not.toBeInTheDocument();
      expect(tourMenu.queryByRole("button", { name: /^Configurações/ })).not.toBeInTheDocument();
    } else {
      expect(tourMenu.getByRole("button", { name: /^Estoque Tour completo/ })).toBeInTheDocument();
      expect(tourMenu.getByRole("button", { name: /^Produtos/ })).toBeInTheDocument();
      expect(tourMenu.getByRole("button", { name: /^Vendas Tour completo/ })).toBeInTheDocument();
      expect(tourMenu.getByRole("button", { name: /^Registrar/ })).toBeInTheDocument();
    }
    fireEvent.click(tourMenu.getByRole("button", { name: "Tour completo" }));

    expect(await screen.findByText("Este é o ponto de partida. A navegação lateral permite acessar as áreas liberadas para seu perfil.", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finalizar tour" })).toBeInTheDocument();
    await waitFor(() => expect(within(screen.getByRole("banner")).getByText("Início")).toBeInTheDocument());
  });
});