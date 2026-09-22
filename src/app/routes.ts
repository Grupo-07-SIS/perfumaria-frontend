import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("../features/home/HomePage")).HomePage }) },
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
      { path: "decants", lazy: async () => ({ Component: (await import("../features/decants/DecantsPage")).DecantsPage }) },
      { path: "bodysplash", lazy: async () => ({ Component: (await import("../features/body-splash/BodySplashPage")).BodySplashPage }) },
      { path: "vendas/registrar", lazy: async () => ({ Component: (await import("../features/sales/SalesPage")).SalesPage }) },
      { path: "vendas/historico", lazy: async () => ({ Component: (await import("../features/sales-history/SalesHistoryPage")).SalesHistoryPage }) },
      { path: "vendas/pedidos", lazy: async () => ({ Component: (await import("../features/online-orders/OnlineOrdersPage")).OnlineOrdersPage }) },
      { path: "clientes", lazy: async () => ({ Component: (await import("../features/people/PeoplePage")).PeoplePage }) },
      { path: "configuracoes", lazy: async () => ({ Component: (await import("../features/settings/SettingsPage")).SettingsPage }) },
    ],
  },
]);