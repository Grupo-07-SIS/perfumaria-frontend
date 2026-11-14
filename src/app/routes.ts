import { createBrowserRouter, type RouteObject } from "react-router";
import { ProtectedRoute, LoginRoute, RecoveryRoute, AdminRoute } from "../core/guard/AuthGuards";
import { Layout } from "./components/Layout";
import { Inicio } from "./pages/Inicio";
import { Decants } from "./pages/Decants";
import { BodySplash } from "./pages/BodySplash";
import { VendasPDV } from "./pages/VendasPDV";
import { VendasHistorico } from "./pages/VendasHistorico";
import { PedidosOnline } from "./pages/PedidosOnline";
import { Clientes } from "./pages/Clientes";
export const appRoutes: RouteObject[] = [
  { Component: LoginRoute, children: [{ path: "/login", lazy: async () => {
    const { LoginPage } = await import("../features/login/LoginPage");
    return { Component: LoginPage };
  } }] },
  { Component: RecoveryRoute, children: [{ path: "/recuperar-senha", lazy: async () => {
    const { PasswordRecoveryPage } = await import("../features/password-recovery/PasswordRecoveryPage");
    return { Component: PasswordRecoveryPage };
  } }] },
  { Component: ProtectedRoute, children: [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Inicio },
      { Component: AdminRoute, children: [
      {
        path: "estoque/produtos",
        lazy: async () => {
          const { ProductsPage } = await import("../features/products/ProductsPage");
          return { Component: ProductsPage };
        },
      },
      {
        path: "estoque/categorias",
        lazy: async () => {
          const { CategoriesPage } = await import("../features/categories/CategoriesPage");
          return { Component: CategoriesPage };
        },
      },
      { path: "clientes", Component: Clientes },
      ] },
      { path: "decants",            Component: Decants },
      { path: "bodysplash",         Component: BodySplash },
      { path: "vendas/registrar",   Component: VendasPDV },
      { path: "vendas/historico",   Component: VendasHistorico },
      { path: "vendas/pedidos",     Component: PedidosOnline },
      { path: "configuracoes", lazy: async () => {
        const { SettingsPage } = await import("../features/settings/SettingsPage");
        return { Component: SettingsPage };
      } },
    ],
  },
  ] },
];
export const router = createBrowserRouter(appRoutes);