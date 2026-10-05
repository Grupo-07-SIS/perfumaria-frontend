import type { useDashboardFacade } from "../facade/useDashboardFacade";
import { periodLabels, axisProps, tooltipStyle, PIE_COLORS } from "../config/dashboard.config";
import type { Period } from "../models/dashboard.models";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { AlertTriangle, ShoppingBag, DollarSign, Droplets, ArrowRight, ShoppingCart, Package } from "lucide-react";
import { Link } from "react-router";
import { KpiCard } from "./KpiCard";
import { PeractCard } from "../../../shared/components/peract-card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from "recharts";
export function DashboardView({
  period,
  setPeriod,
  chartData,
  criticalStock,
  categoryData,
  recentActivities
}: ReturnType<typeof useDashboardFacade>) {
  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="peract-font-color-default">Dashboard</h1>
          <p className="text-sm peract-font-color-muted mt-0.5">Visão geral da sua perfumaria</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border peract-border-color self-start">
          {(Object.keys(periodLabels) as Period[]).map(p => <PeractButtonPrimitive key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs transition-all ${period === p ? "text-white" : "text-gray-600 peract-bg-card hover:bg-gray-50"}`} style={period === p ? {
          background: "#c29958"
        } : {}} variant="plain" size="plain">
              {periodLabels[p]}
            </PeractButtonPrimitive>)}
        </div>
      </div>

      {/* Alert */}
      <div className="mb-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm peract-border-color-accent" style={{
        background: "#FFF8F0",
        color: "#401201"
      }} role="status" aria-live="polite">
          <AlertTriangle size={16} className="shrink-0 peract-font-color-accent" />
          <span>
            <strong>3 produtos</strong> com estoque abaixo do mínimo.{" "}
            <Link to="/estoque/produtos" className="underline ml-1 font-medium hover:opacity-80 peract-font-color-accent">
              Ver produtos críticos →
            </Link>
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <KpiCard title="Vendas no período" value="50" icon={<ShoppingBag size={22} />} sub="+12% vs anterior" />
        <KpiCard title="Faturamento estimado" value="R$ 5.370" icon={<DollarSign size={22} />} sub="+8% vs anterior" />
        <KpiCard title="Estoque crítico" value="3" icon={<AlertTriangle size={22} />} sub="produtos abaixo do mínimo" alert />
        <KpiCard title="Decants ativos" value="24" icon={<Droplets size={22} />} sub="com precificação" />
      </div>

      {/* Row 1 — Faturamento (bar) + Estoque Crítico */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <PeractCard className="xl:col-span-2 peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="peract-font-color-default text-base">Faturamento</h2>
            <span className="text-xs peract-font-color-muted">{periodLabels[period]}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="dia" tick={axisProps} axisLine={false} tickLine={false} />
              <YAxis tick={axisProps} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$ ${v.toFixed(2).replace(".", ",")}`, "Faturamento"]} />
              <Bar dataKey="faturamento" fill="#c29958" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PeractCard>

        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="peract-font-color-default text-sm">Estoque Crítico</h2>
            <Link to="/estoque/produtos" className="text-xs flex items-center gap-1 hover:opacity-80 peract-font-color-accent">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {criticalStock.map((item, i) => <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-700 flex-1 mr-2 truncate">{item.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${item.status === "ruptura" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {item.current} unid.
                </span>
              </div>)}
          </div>
          <Link to="/vendas/registrar" className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity peract-bg-accent">
            <ShoppingCart size={13} /> Registrar venda
          </Link>
        </PeractCard>
      </div>

      {/* Row 2 — Quantidade de Vendas (bar) + Distribuição por Categoria (pie) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="peract-font-color-default text-base">Quantidade de Vendas</h2>
            <span className="text-xs peract-font-color-muted">{periodLabels[period]}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="dia" tick={axisProps} axisLine={false} tickLine={false} />
              <YAxis tick={axisProps} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Vendas"]} />
              <Bar dataKey="vendas" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PeractCard>

        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="peract-font-color-default text-base">Distribuição por Categoria</h2>
            <span className="text-xs peract-font-color-muted">{periodLabels[period]}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v}%`, name]} />
              <Legend iconType="circle" iconSize={8} formatter={value => <span style={{
              fontSize: 11,
              color: "#6b6b68"
            }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </PeractCard>
      </div>

      {/* Recent activities */}
      <PeractCard className="peract-bg-card rounded-xl border peract-border-color shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h2 className="peract-font-color-default text-base">Atividades Recentes</h2>
          <span className="text-xs peract-font-color-muted">Hoje</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentActivities.map(activity => <div key={activity.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.type === "venda" ? "bg-amber-100" : activity.type === "producao" ? "bg-green-100" : "bg-blue-100"}`}>
                {activity.type === "venda" ? <ShoppingBag size={14} className="text-amber-700" /> : activity.type === "producao" ? <Package size={14} className="text-green-600" /> : <Package size={14} className="text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm peract-font-color-default truncate">{activity.description}</p>
                <p className="text-xs peract-font-color-muted">{activity.time}</p>
              </div>
              <span className="text-xs peract-font-color-muted shrink-0 hidden sm:block">{activity.value}</span>
            </div>)}
        </div>
      </PeractCard>
    </div>;
}
