import type { useHomeFacade } from "../facade/useHomeFacade";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { Eye } from "lucide-react";
import { PERIOD_LABELS, DARK, ACC, CAT_COLORS, WARM } from "../config/home.config";
import type { Period } from "../models/home.models";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { KpiCard } from "./KpiCard";
import { ShoppingBag } from "lucide-react";
import { fmtBRL, fmtBRLShort } from "../services/home.service";
import { DollarSign } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Users } from "lucide-react";
import { PeractCard } from "../../../shared/components/peract-card";
import { EmptyChart } from "./EmptyChart";
import { ResponsiveContainer } from "recharts";
import { BarChart } from "recharts";
import { CartesianGrid } from "recharts";
import { XAxis } from "recharts";
import { YAxis } from "recharts";
import { Tooltip } from "recharts";
import { TooltipFat } from "./TooltipFat";
import { Bar } from "recharts";
import { BarChart2 } from "lucide-react";
import { TooltipVendas } from "./TooltipVendas";
import { Droplets } from "lucide-react";
import { PeractTag } from "../../../shared/components/peract-tag";
import { Package } from "lucide-react";
import { PieChart } from "recharts";
import { Pie } from "recharts";
import { Cell } from "recharts";
import { Legend } from "recharts";
import { ArrowRight } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Globe } from "lucide-react";
import { Store } from "lucide-react";
import { FlaskConical } from "lucide-react";

export function HomeView({ isAdmin, period, setPeriod, emptyMode, setEmptyMode, chartData, categoriaData, kpi, criticalProducts, margemPercReal, margemPerc, margemBRL, vendasRecentes, totalVendasKpi, faturamentoKpi, clientesKpi, topProdutos }: ReturnType<typeof useHomeFacade>) {
return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="peract-font-color-default">Início</h1>
          <p className="text-sm peract-font-color-muted mt-0.5">Painel de controle Canal Perfumado Decants</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start">
          {/* Empty mode toggle */}
          <PeractButtonPrimitive onClick={() => setEmptyMode(!emptyMode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${emptyMode ? "text-white border-transparent" : "peract-font-color-muted peract-border-color peract-bg-card hover:border-gray-300"}`} style={emptyMode ? {
          background: "#6366f1"
        } : {}} title={emptyMode ? "Sair da simulação e ver dados reais" : "Simular dashboard sem dados (primeiro acesso)"} variant="plain" size="plain" aria-label={emptyMode ? "Sair da simulação e ver dados reais" : "Simular dashboard sem dados (primeiro acesso)"}>
            <Eye size={12} />
            {emptyMode ? "Sair da simulação" : "Simular sem dados"}
          </PeractButtonPrimitive>

          {/* Period selector */}
          <div className="flex rounded-lg overflow-hidden border peract-border-color">
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => <PeractButtonPrimitive key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 text-xs transition-all" style={period === p ? {
            background: DARK,
            color: "white"
          } : {
            background: "white",
            color: "#4b5563"
          }} variant="plain" size="plain">
                {PERIOD_LABELS[p]}
              </PeractButtonPrimitive>)}
          </div>
        </div>
      </div>

      {/* Empty mode banner */}
      {emptyMode && <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm mb-5" style={{
      background: "rgba(99,102,241,0.08)",
      borderColor: "rgba(99,102,241,0.3)",
      color: "#4338ca"
    }}>
          <Eye size={16} className="shrink-0" />
          <span>
            <strong>Modo de simulação ativo.</strong> Exibindo como ficaria o painel sem nenhum dado cadastrado —
            útil para prever a experiência de primeiro acesso.
            <PeractButtonPrimitive onClick={() => setEmptyMode(false)} className="underline ml-2 font-medium hover:opacity-80" variant="plain" size="plain">
              Sair da simulação
            </PeractButtonPrimitive>
          </span>
        </div>}

      {/* Alert (só admin, fora do empty mode) */}
      {!emptyMode && criticalProducts.length > 0 && isAdmin && <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm mb-5 peract-font-color-default" style={{
      background: `${ACC}12`,
      borderColor: `${ACC}40`
    }}>
          <AlertTriangle size={16} className="shrink-0 peract-font-color-accent" />
          <span>
            <strong>{criticalProducts.length} produto(s)</strong> com estoque abaixo do mínimo.{" "}
            <Link to="/estoque/produtos" className="underline ml-1 font-medium hover:opacity-80 peract-font-color-accent">
              Ver produtos →
            </Link>
          </span>
        </div>}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        <KpiCard title="Vendas no Período" value={String(totalVendasKpi)} icon={<ShoppingBag size={20} />} variacao={emptyMode ? undefined : kpi.variacao} empty={emptyMode} emptyMsg="Nenhuma venda registrada ainda" />
        {isAdmin && <KpiCard title="Faturamento no Período" value={fmtBRL(faturamentoKpi)} icon={<DollarSign size={20} />} variacao={emptyMode ? undefined : kpi.variacao} empty={emptyMode} emptyMsg="Registre a primeira venda para ver o faturamento" />}
        {isAdmin && <KpiCard title="Margem de Lucro" value={`${margemPerc.toFixed(1)}%`} value2={`≈ ${fmtBRLShort(margemBRL)} no período`} icon={<TrendingUp size={20} />} sub={margemPercReal !== null ? "calculada do catálogo" : "estimativa"} highlight="#22c55e" empty={emptyMode} emptyMsg="Configure preços de compra nos produtos" />}
        <KpiCard title="Clientes Cadastrados" value={String(clientesKpi)} icon={<Users size={20} />} sub="no sistema" highlight="#6366f1" empty={emptyMode} emptyMsg="Nenhum cliente cadastrado ainda" />
      </div>

      {/* ── Charts row 1: Faturamento + Qtd Vendas ── */}
      <div className={`grid gap-4 mb-4 ${isAdmin ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
        {isAdmin && <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
            <h2 className="text-sm mb-4 peract-font-color-default">Faturamento — {PERIOD_LABELS[period]}</h2>
            {chartData.length === 0 ? <EmptyChart icon={<DollarSign size={22} />} message="Nenhum dado de faturamento disponível" sub="Registre vendas para visualizar a evolução do faturamento" /> : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{
              fontSize: 11,
              fill: "#9ca3af"
            }} axisLine={false} tickLine={false} />
                  <YAxis tick={{
              fontSize: 11,
              fill: "#9ca3af"
            }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<TooltipFat />} />
                  <Bar dataKey="faturamento" fill={ACC} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>}
          </PeractCard>}

        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <h2 className="text-sm mb-4 peract-font-color-default">Quantidade de Vendas — {PERIOD_LABELS[period]}</h2>
          {chartData.length === 0 ? <EmptyChart icon={<BarChart2 size={22} />} message="Sem vendas para exibir" sub="O gráfico aparecerá após a primeira venda ser registrada" /> : <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{
              fontSize: 11,
              fill: "#9ca3af"
            }} axisLine={false} tickLine={false} />
                <YAxis tick={{
              fontSize: 11,
              fill: "#9ca3af"
            }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TooltipVendas />} />
                <Bar dataKey="vendas" fill={ACC} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>}
        </PeractCard>
      </div>

      {/* ── Charts row 2: Top 5 + Distribuição por Categoria ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        {/* Top 5 Produtos */}
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <h2 className="text-sm mb-4 peract-font-color-default">Top 5 Produtos Mais Vendidos</h2>
          {topProdutos.length === 0 ? <EmptyChart icon={<Droplets size={22} />} message="Nenhum produto vendido ainda" sub="Os produtos mais vendidos aparecerão aqui conforme as vendas forem registradas" /> : <div className="flex flex-col gap-3">
              {topProdutos.map((p, i) => <div key={p.nome} className="flex items-center gap-3">
                  <PeractTag className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white" style={{
              background: i === 0 ? ACC : i === 1 ? DARK : "#d1c0a0"
            }}>
                    {i + 1}
                  </PeractTag>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 peract-bg-accent-soft">
                    <Droplets size={14} className="peract-font-color-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-xs peract-font-color-default truncate">{p.nome}</p>
                        <p className="text-xs peract-font-color-muted">{p.marca}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-700 shrink-0 ml-2">{p.vendas} vendas</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                  width: `${p.vendas / topProdutos[0].vendas * 100}%`,
                  background: i === 0 ? ACC : "#d1c0a0"
                }} />
                    </div>
                  </div>
                </div>)}
            </div>}
        </PeractCard>

        {/* Distribuição por Categoria */}
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <h2 className="text-sm mb-4 peract-font-color-default">Distribuição por Categoria — {PERIOD_LABELS[period]}</h2>
          {categoriaData.length === 0 ? <EmptyChart icon={<Package size={22} />} message="Sem dados por categoria" sub="A distribuição de receita por categoria aparecerá após as primeiras vendas" /> : <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoriaData} dataKey="receita" nameKey="categoria" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {categoriaData.map((entry, i) => <Cell key={`cat-${entry.categoria}`} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{
              background: DARK,
              border: "none",
              borderRadius: "8px",
              fontSize: "12px"
            }} itemStyle={{
              color: "#ffffff"
            }} labelStyle={{
              color: "#ffffff"
            }} formatter={v => [fmtBRL(Number(v)), "Receita"]} />
                <Legend iconType="circle" iconSize={8} formatter={value => <span style={{
              fontSize: 11,
              color: "#6b6b68"
            }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>}
        </PeractCard>
      </div>

      {/* ── Seção inferior: Estoque Crítico (admin) + Vendas Recentes ── */}
      {isAdmin && <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Estoque Crítico */}
          <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm peract-font-color-default">Estoque Crítico</h2>
              <Link to="/estoque/produtos" className="text-xs flex items-center gap-1 hover:opacity-80 peract-font-color-accent">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {criticalProducts.length === 0 ? <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Package size={18} className="text-green-500" />
                </div>
                <p className="text-sm peract-font-color-muted">
                  {emptyMode ? "Nenhum produto cadastrado ainda" : "Nenhum produto em estoque crítico 🎉"}
                </p>
                {emptyMode && <p className="text-xs text-gray-300 text-center">Os produtos com baixo estoque aparecerão aqui</p>}
              </div> : <div className="flex flex-col gap-1.5 mb-4">
                {criticalProducts.slice(0, 6).map((item, i) => <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{
            background: "#fafaf9"
          }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === "esgotado" ? "bg-red-500" : "bg-amber-400"}`} />
                      <span className="text-xs text-gray-700 truncate">{item.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${item.status === "esgotado" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.currentStock} un.
                    </span>
                  </div>)}
              </div>}
            <Link to="/vendas/registrar" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity mt-2 peract-bg-accent">
              <ShoppingCart size={13} /> Registrar venda
            </Link>
          </PeractCard>

          {/* Vendas Recentes */}
          <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm peract-font-color-default">Vendas Recentes</h2>
              <Link to="/vendas/historico" className="text-xs flex items-center gap-1 hover:opacity-80 peract-font-color-accent">
                Ver histórico <ArrowRight size={12} />
              </Link>
            </div>

            {vendasRecentes.length === 0 ? <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center peract-bg-accent-soft">
                  <ShoppingBag size={18} style={{
              opacity: 0.5
            }} className="peract-font-color-accent" />
                </div>
                <p className="text-sm peract-font-color-muted">
                  {emptyMode ? "Nenhuma venda realizada ainda" : "Sem vendas recentes"}
                </p>
                {emptyMode && <p className="text-xs text-gray-300 text-center max-w-[200px]">
                    As últimas transações aparecerão aqui assim que uma venda for registrada
                  </p>}
              </div> : <div className="flex flex-col gap-1.5">
                {vendasRecentes.map(v => {
            const isOnline = v.tipoVenda === "online";
            const isFinished = v.enviado || v.tipoVenda === "presencial";
            return <div key={v.id} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{
              background: "#fafaf9"
            }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{
                background: isOnline ? "#EFF6FF" : WARM
              }}>
                        {isOnline ? <Globe size={12} className="text-blue-500" /> : <Store size={12} className="peract-font-color-accent" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{v.cliente || "—"}</p>
                        <p className="text-xs peract-font-color-muted">{v.data} · {v.pagamento}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold peract-font-color-default">
                          R$ {v.total.toFixed(2).replace(".", ",")}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isFinished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {isFinished ? "Finalizado" : "Pendente"}
                        </span>
                      </div>
                    </div>;
          })}
              </div>}

            <Link to="/vendas/pedidos" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs border peract-border-color text-gray-600 hover:bg-gray-50 transition-colors mt-3">
              <FlaskConical size={13} /> Ver pedidos online
            </Link>
          </PeractCard>
        </div>}

      {/* Funcionário: acesso rápido */}
      {!isAdmin && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <Link to="/vendas/registrar" className="flex items-center gap-3 p-4 peract-bg-card rounded-xl border peract-border-color shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 peract-bg-accent">
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className="text-sm font-medium peract-font-color-default">Registrar Venda</p>
              <p className="text-xs peract-font-color-muted">Abrir ponto de venda</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link to="/vendas/pedidos" className="flex items-center gap-3 p-4 peract-bg-card rounded-xl border peract-border-color shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{
          background: "#6366f1"
        }}>
              <Package size={18} />
            </div>
            <div>
              <p className="text-sm font-medium peract-font-color-default">Pedidos Online</p>
              <p className="text-xs peract-font-color-muted">Ver pedidos pendentes</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        </div>}
    </div>;
}
