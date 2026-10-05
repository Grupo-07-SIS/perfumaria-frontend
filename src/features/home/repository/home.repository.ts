import type { Period } from "../models/home.models";
import { useApp } from "../../../core/store/AppContext";
export function useHomeRepository() {
  const {
    products,
    clientes,
    vendas,
    currentUser
  } = useApp();
  return {
    products,
    clientes,
    vendas,
    currentUser
  };
}
export const CHART_DATA: Record<Period, Array<{
  label: string;
  faturamento: number;
  vendas: number;
}>> = {
  diario: [{
    label: "08h",
    faturamento: 120,
    vendas: 1
  }, {
    label: "10h",
    faturamento: 340,
    vendas: 3
  }, {
    label: "12h",
    faturamento: 180,
    vendas: 2
  }, {
    label: "14h",
    faturamento: 560,
    vendas: 5
  }, {
    label: "16h",
    faturamento: 240,
    vendas: 2
  }, {
    label: "18h",
    faturamento: 420,
    vendas: 4
  }, {
    label: "20h",
    faturamento: 310,
    vendas: 3
  }],
  "7dias": [{
    label: "26/03",
    faturamento: 420,
    vendas: 4
  }, {
    label: "27/03",
    faturamento: 760,
    vendas: 7
  }, {
    label: "28/03",
    faturamento: 530,
    vendas: 5
  }, {
    label: "29/03",
    faturamento: 990,
    vendas: 9
  }, {
    label: "30/03",
    faturamento: 640,
    vendas: 6
  }, {
    label: "31/03",
    faturamento: 1180,
    vendas: 11
  }, {
    label: "01/04",
    faturamento: 850,
    vendas: 8
  }],
  "30dias": [{
    label: "Sem 1",
    faturamento: 2100,
    vendas: 22
  }, {
    label: "Sem 2",
    faturamento: 3200,
    vendas: 31
  }, {
    label: "Sem 3",
    faturamento: 2800,
    vendas: 28
  }, {
    label: "Sem 4",
    faturamento: 3900,
    vendas: 38
  }],
  semestre: [{
    label: "Out",
    faturamento: 4100,
    vendas: 38
  }, {
    label: "Nov",
    faturamento: 4850,
    vendas: 45
  }, {
    label: "Dez",
    faturamento: 6700,
    vendas: 62
  }, {
    label: "Jan",
    faturamento: 4400,
    vendas: 41
  }, {
    label: "Fev",
    faturamento: 5350,
    vendas: 50
  }, {
    label: "Mar",
    faturamento: 5900,
    vendas: 55
  }]
};
export const KPI_DATA: Record<Period, {
  vendas: number;
  faturamento: number;
  variacao: number;
  margem: number;
}> = {
  diario: {
    vendas: 20,
    faturamento: 2170,
    variacao: 12,
    margem: 38.4
  },
  "7dias": {
    vendas: 50,
    faturamento: 5370,
    variacao: 8,
    margem: 39.1
  },
  "30dias": {
    vendas: 119,
    faturamento: 12000,
    variacao: -3,
    margem: 37.8
  },
  semestre: {
    vendas: 291,
    faturamento: 31300,
    variacao: 15,
    margem: 40.5
  }
};
export const CATEGORIA_DATA: Record<Period, Array<{
  categoria: string;
  receita: number;
}>> = {
  diario: [{
    categoria: "Perfumes",
    receita: 980
  }, {
    categoria: "Body Splash",
    receita: 420
  }, {
    categoria: "Colônias",
    receita: 210
  }, {
    categoria: "Kits",
    receita: 560
  }],
  "7dias": [{
    categoria: "Perfumes",
    receita: 2800
  }, {
    categoria: "Body Splash",
    receita: 1200
  }, {
    categoria: "Colônias",
    receita: 650
  }, {
    categoria: "Kits",
    receita: 720
  }],
  "30dias": [{
    categoria: "Perfumes",
    receita: 6500
  }, {
    categoria: "Body Splash",
    receita: 2900
  }, {
    categoria: "Colônias",
    receita: 1400
  }, {
    categoria: "Kits",
    receita: 1200
  }],
  semestre: [{
    categoria: "Perfumes",
    receita: 18500
  }, {
    categoria: "Body Splash",
    receita: 7200
  }, {
    categoria: "Colônias",
    receita: 3800
  }, {
    categoria: "Kits",
    receita: 1800
  }]
};
export const TOP_PRODUTOS = [{
  nome: "Dior Sauvage 5ml",
  marca: "Dior",
  vendas: 48
}, {
  nome: "Chanel N°5 2ml",
  marca: "Chanel",
  vendas: 42
}, {
  nome: "Creed Aventus 5ml",
  marca: "Creed",
  vendas: 35
}, {
  nome: "YSL Libre 2ml",
  marca: "YSL",
  vendas: 28
}, {
  nome: "Tom Ford 5ml",
  marca: "Tom Ford",
  vendas: 22
}];
