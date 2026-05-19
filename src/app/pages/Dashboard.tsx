import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Package,
  TrendingUp,
  ArrowRight,
  Droplets,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router";

const chartData = [
  { dia: "18/03", vendas: 4, faturamento: 420 },
  { dia: "19/03", vendas: 7, faturamento: 760 },
  { dia: "20/03", vendas: 5, faturamento: 530 },
  { dia: "21/03", vendas: 9, faturamento: 990 },
  { dia: "22/03", vendas: 6, faturamento: 640 },
  { dia: "23/03", vendas: 11, faturamento: 1180 },
  { dia: "24/03", vendas: 8, faturamento: 850 },
];

const recentActivities = [
  { id: 1, type: "venda", description: "Venda #V-1042 – Ana Lima", time: "Há 12 min", value: "R$ 89,00" },
  { id: 2, type: "estoque", description: "Ajuste de estoque – Chanel N°5", time: "Há 35 min", value: "-3 unid." },
  { id: 3, type: "venda", description: "Venda #V-1041 – Carlos Mendes", time: "Há 1h", value: "R$ 156,00" },
  { id: 4, type: "producao", description: "Ordem de produção #OP-034 concluída", time: "Há 2h", value: "20 decants" },
  { id: 5, type: "estoque", description: "Estoque crítico – Dior Sauvage", time: "Há 3h", value: "2 unid." },
  { id: 6, type: "venda", description: "Venda #V-1040 – Mariana Costa", time: "Há 4h", value: "R$ 212,00" },
];

const criticalStock = [
  { name: "Dior Sauvage", current: 2, min: 10, status: "ruptura" },
  { name: "Chanel N°5", current: 4, min: 10, status: "critico" },
  { name: "YSL Libre", current: 6, min: 10, status: "critico" },
];

type Period = "hoje" | "7dias" | "30dias";
const periodLabels: Record<Period, string> = {
  hoje: "Hoje",
  "7dias": "Últimos 7 dias",
  "30dias": "Últimos 30 dias",
};

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("7dias");

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[#26221E]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral da sua perfumaria</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 self-start">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs transition-all ${
                period === p ? "text-white" : "text-gray-600 bg-white hover:bg-gray-50"
              }`}
              style={period === p ? { background: "#A67449" } : {}}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Alert – critical stock */}
      <div className="flex flex-col gap-2 mb-6">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm"
          style={{ background: "#FFF8F0", borderColor: "#A67449", color: "#401201" }}
          role="status"
          aria-live="polite"
        >
          <AlertTriangle size={16} className="shrink-0" style={{ color: "#A67449" }} />
          <span>
            <strong>3 produtos</strong> com estoque abaixo do mínimo.{" "}
            <Link to="/estoque/produtos" className="underline ml-1 font-medium hover:opacity-80" style={{ color: "#A67449" }}>
              Ver produtos críticos →
            </Link>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <KpiCard title="Vendas no período" value="50" icon={<ShoppingBag size={22} />} sub="+12% vs anterior" />
        <KpiCard title="Faturamento estimado" value="R$ 5.370" icon={<DollarSign size={22} />} sub="+8% vs anterior" />
        <KpiCard title="Estoque crítico" value="3" icon={<AlertTriangle size={22} />} sub="produtos abaixo do mínimo" alert />
        <KpiCard title="Decants ativos" value="24" icon={<Droplets size={22} />} sub="com precificação" />
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#26221E] text-base">Vendas por dia</h2>
            <span className="text-xs text-gray-400">Últimos 7 dias</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A67449" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A67449" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#26221E", border: "none", borderRadius: "8px", color: "white", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="vendas" stroke="#A67449" strokeWidth={2.5} fill="url(#colorVendas)" dot={{ fill: "#A67449", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Critical stock */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#26221E] text-sm">Estoque Crítico</h2>
            <Link to="/estoque/produtos" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: "#A67449" }}>
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {criticalStock.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-700 flex-1 mr-2 truncate">{item.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  item.status === "ruptura" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {item.current} unid.
                </span>
              </div>
            ))}
          </div>
          <Link to="/vendas/registrar" className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity" style={{ background: "#A67449" }}>
            <ShoppingCart size={13} /> Registrar venda
          </Link>
        </div>
      </div>

      {/* Recent activities */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h2 className="text-[#26221E] text-base">Atividades Recentes</h2>
          <span className="text-xs text-gray-400">Hoje</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                activity.type === "venda" ? "bg-amber-100" :
                activity.type === "producao" ? "bg-green-100" : "bg-blue-100"
              }`}>
                {activity.type === "venda" ? <ShoppingBag size={14} className="text-amber-700" /> :
                  activity.type === "producao" ? <Package size={14} className="text-green-600" /> :
                  <Package size={14} className="text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{activity.description}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
              <span className="text-xs text-gray-500 shrink-0 hidden sm:block">{activity.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, sub, alert }: {
  title: string; value: string; icon: React.ReactNode; sub: string; alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm" aria-label={`${title}: ${value}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 leading-tight pr-2">{title}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ background: alert ? "#dc2626" : "#A67449" }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold mb-1" style={{ color: "#26221E" }}>{value}</p>
      <div className="flex items-center gap-1">
        {!alert && <TrendingUp size={12} className="text-green-500 shrink-0" />}
        <p className="text-xs text-gray-400 leading-tight">{sub}</p>
      </div>
    </div>
  );
}
