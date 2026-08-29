import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Inicio } from "./pages/Inicio";
import { Decants } from "./pages/Decants";
import { BodySplash } from "./pages/BodySplash";
import { VendasPDV } from "./pages/VendasPDV";
import { VendasHistorico } from "./pages/VendasHistorico";
import { PedidosOnline } from "./pages/PedidosOnline";
import { Clientes } from "./pages/Clientes";
import { Configuracoes } from "./pages/Configuracoes";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Inicio },
      {
        path: "estoque/produtos",
        lazy: async () => {
          const { ProductsPage } = await import("../features/products/pages/ProductsPage");
          return { Component: ProductsPage };
        },
      },
      {
        path: "estoque/categorias",
        lazy: async () => {
          const { CategoriesPage } = await import("../features/categories/pages/CategoriesPage");
          return { Component: CategoriesPage };
        },
      },
      { path: "decants",            Component: Decants },
      { path: "bodysplash",         Component: BodySplash },
      { path: "vendas/registrar",   Component: VendasPDV },
      { path: "vendas/historico",   Component: VendasHistorico },
      { path: "vendas/pedidos",     Component: PedidosOnline },
      { path: "clientes",           Component: Clientes },
      { path: "configuracoes",      Component: Configuracoes },
    ],
  },
]);