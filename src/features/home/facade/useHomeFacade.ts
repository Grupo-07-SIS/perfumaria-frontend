import { selectHomeMetrics } from "../services/home.service";
import { useHomeRepository } from "../repository/home.repository";
import { useState } from "react";
import type { Period } from "../models/home.models";
import { CHART_DATA, CATEGORIA_DATA, KPI_DATA, TOP_PRODUTOS } from "../repository/home.repository";

export function useHomeFacade() {
const {
    products,
    clientes,
    vendas,
    currentUser
  } = useHomeRepository();
const isAdmin = currentUser?.cargo === "Administrador";
const [period, setPeriod] = useState<Period>("7dias");
const [emptyMode, setEmptyMode] = useState(false);
const { chartData, categoriaData, kpi, criticalProducts, produtosComMargem, margemPercReal, margemPerc, margemBRL, vendasRecentes, totalVendasKpi, faturamentoKpi, clientesKpi, topProdutos } = selectHomeMetrics({ products, clientes, vendas, period, emptyMode });
return { products, clientes, vendas, currentUser, isAdmin, period, setPeriod, emptyMode, setEmptyMode, chartData, categoriaData, kpi, criticalProducts, produtosComMargem, margemPercReal, margemPerc, margemBRL, vendasRecentes, totalVendasKpi, faturamentoKpi, clientesKpi, topProdutos };
}
