import { createBrowserRouter, type RouteObject } from "react-router";
import { ProtectedRoute, LoginRoute, RecoveryRoute, AdminRoute } from "../core/guard/AuthGuards";
import { Layout } from "./components/Layout";

export const appRoutes: RouteObject[] = [
  { Component: LoginRoute, children: [{ path: "/login", lazy: async () => ({ Component: (await import("../features/login/LoginPage")).LoginPage }) }] },
  { Component: RecoveryRoute, children: [{ path: "/recuperar-senha", lazy: async () => ({ Component: (await import("../features/password-recovery/PasswordRecoveryPage")).PasswordRecoveryPage }) }] },
  { Component: ProtectedRoute, children: [{ path: "/", Component: Layout, children: [
    { index: true, lazy: async () => ({ Component: (await import("../features/home/HomePage")).HomePage }) },
    { Component: AdminRoute, children: [
      { path: "estoque/produtos", lazy: async () => ({ Component: (await import("../features/products/ProductsPage")).ProductsPage }) },
      { path: "estoque/categorias", lazy: async () => ({ Component: (await import("../features/categories/CategoriesPage")).CategoriesPage }) },
      { path: "clientes", lazy: async () => ({ Component: (await import("../features/people/PeoplePage")).PeoplePage }) },
      { path: "vendas/historico", lazy: async () => ({ Component: (await import("../features/sales-history/SalesHistoryPage")).SalesHistoryPage }) },
    ] },
    { path: "decants", lazy: async () => ({ Component: (await import("../features/decants/DecantsPage")).DecantsPage }) },
    { path: "bodysplash", lazy: async () => ({ Component: (await import("../features/body-splash/BodySplashPage")).BodySplashPage }) },
    { path: "vendas/registrar", lazy: async () => ({ Component: (await import("../features/sales/SalesPage")).SalesPage }) },
    { path: "vendas/pedidos", lazy: async () => ({ Component: (await import("../features/online-orders/OnlineOrdersPage")).OnlineOrdersPage }) },
    { path: "configuracoes", lazy: async () => ({ Component: (await import("../features/settings/SettingsPage")).SettingsPage }) },
  ] }] },
];
export const router = createBrowserRouter(appRoutes);