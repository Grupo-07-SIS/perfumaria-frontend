import type { Period } from "../models/dashboard.models";

export const chartData = [{
  dia: "18/03",
  vendas: 4,
  faturamento: 420
}, {
  dia: "19/03",
  vendas: 7,
  faturamento: 760
}, {
  dia: "20/03",
  vendas: 5,
  faturamento: 530
}, {
  dia: "21/03",
  vendas: 9,
  faturamento: 990
}, {
  dia: "22/03",
  vendas: 6,
  faturamento: 640
}, {
  dia: "23/03",
  vendas: 11,
  faturamento: 1180
}, {
  dia: "24/03",
  vendas: 8,
  faturamento: 850
}];
export const categoryData = [{
  name: "Perfumes",
  value: 42
}, {
  name: "Decants",
  value: 31
}, {
  name: "Body Splash",
  value: 16
}, {
  name: "Colônias",
  value: 7
}, {
  name: "Kits",
  value: 4
}];
export const recentActivities = [{
  id: 1,
  type: "venda",
  description: "Venda #V-1042 – Ana Lima",
  time: "Há 12 min",
  value: "R$ 89,00"
}, {
  id: 2,
  type: "estoque",
  description: "Ajuste de estoque – Chanel N°5",
  time: "Há 35 min",
  value: "-3 unid."
}, {
  id: 3,
  type: "venda",
  description: "Venda #V-1041 – Carlos Mendes",
  time: "Há 1h",
  value: "R$ 156,00"
}, {
  id: 4,
  type: "producao",
  description: "Ordem de produção #OP-034 concluída",
  time: "Há 2h",
  value: "20 decants"
}, {
  id: 5,
  type: "estoque",
  description: "Estoque crítico – Dior Sauvage",
  time: "Há 3h",
  value: "2 unid."
}, {
  id: 6,
  type: "venda",
  description: "Venda #V-1040 – Mariana Costa",
  time: "Há 4h",
  value: "R$ 212,00"
}];
export const criticalStock = [{
  name: "Dior Sauvage",
  current: 2,
  min: 10,
  status: "ruptura"
}, {
  name: "Chanel N°5",
  current: 4,
  min: 10,
  status: "critico"
}, {
  name: "YSL Libre",
  current: 6,
  min: 10,
  status: "critico"
}];
