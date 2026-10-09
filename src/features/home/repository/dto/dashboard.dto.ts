export interface TopProductsResponseDto {
  produtos: Array<{
    produtoId: number;
    nomeProduto: string;
    categoria: string;
    quantidadeVendas: number;
  }>;
}

export interface CriticalStockResponseDto {
  produtos: Array<{
    produtoId: number;
    nome: string;
    quantidadeDisponivel: number;
  }>;
}

export interface CategoryDistributionResponseDto {
  categorias: Array<{
    categoriaId: number;
    categoria: string;
    valor: number;
  }>;
  totalPeriodo: number;
}

export interface DashboardPeriodData {
  dataInicio: string;
  dataFim: string;
}

export interface DashboardKpisResponseDto {
  vendasPeriodo: { vendas: number; comparacaoPeriodoAnterior: number };
  faturamentoPeriodo: { valor: number; comparacaoAnterior: number };
  margemLucro: { valor: number; comparacaoAnterior: number };
  ticketMedio: { valor: number; comparacaoAnterior: number };
  clientesCadastrados: number;
  produtosCriticos: number;
}

export interface DashboardRecentSalesResponseDto {
  vendas: Array<{
    vendaId: number;
    cliente: string;
    valor: number;
    dataVenda: string;
    formaPagamento: string;
    status: "PENDENTE" | "FINALIZADA" | "CANCELADA";
  }>;
}

export interface DashboardTimeSeriesResponseDto {
  periodos: Array<{
    inicio: string;
    rotulo: string;
    vendas: number;
    faturamento: number;
  }>;
}

export interface DashboardData {
  topProducts: Array<{
    id: number;
    nome: string;
    categoria: string;
    vendas: number;
  }>;
  criticalProducts: Array<{
    id: number;
    name: string;
    currentStock: number;
    status: "esgotado" | "critico";
  }>;
  categoryData: Array<{
    categoria: string;
    receita: number;
  }>;
}

