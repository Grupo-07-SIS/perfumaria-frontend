import { useState } from "react";
import { ptBR } from "date-fns/locale";
import type { useHomeFacade } from "../facade/useHomeFacade";
import { PeractButtonPrimitive } from "../../../shared/components/peract-button";
import { AlertTriangle, ShoppingBag, DollarSign, TrendingUp, TrendingDown, BarChart2, Droplets, Package, ArrowRight, ShoppingCart, CalendarDays, Check, RefreshCw } from "lucide-react";
import { PERIOD_LABELS, DARK, ACC, CAT_COLORS, WARM, SALES_CHANNEL_OPTIONS } from "../config/home.config";
import type { Period, SalesChannel } from "../models/home.models";
import { Link } from "react-router";
import { KpiCard } from "./KpiCard";
import { fmtBRL, fmtBRLShort } from "../services/home.service";
import { PeractCard } from "../../../shared/components/peract-card";
import { EmptyChart } from "./EmptyChart";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { TooltipFat } from "./TooltipFat";
import { TooltipVendas } from "./TooltipVendas";
import { PeractTag } from "../../../shared/components/peract-tag";
import { PeractNativeSelect } from "../../../shared/components/peract-select";
import { PeractCalendar } from "../../../shared/components/peract-calendar";
import { PeractPopover, PeractPopoverContent, PeractPopoverTrigger } from "../../../shared/components/peract-popover";
import { brazilianDateToLocalDate } from "../services/home.service";

function CalendarDateField({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: string;
  onSelect: (date?: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="flex items-center gap-1.5 text-xs peract-font-color-muted">
      <span>{label === "Data inicial" ? "De" : "Até"}</span>
      <PeractPopover open={isOpen} onOpenChange={setIsOpen}>
        <PeractPopoverTrigger asChild>
          <PeractButtonPrimitive variant="plain" size="plain" className="flex h-8 w-36 items-center justify-start gap-2 rounded-md border peract-border-color px-2 text-xs" style={{ color: "#4b5563" }} aria-label={`Selecionar ${label}`}>
            <CalendarDays size={14} className="shrink-0 peract-font-color-muted" />
            <span>{value || "DD/MM/AAAA"}</span>
          </PeractButtonPrimitive>
        </PeractPopoverTrigger>
        <PeractPopoverContent align="start" className="w-auto p-0">
          <PeractCalendar
            mode="single"
            selected={brazilianDateToLocalDate(value)}
            onSelect={date => {
              onSelect(date);
              if (date) setIsOpen(false);
            }}
            locale={ptBR}
            initialFocus
          />
        </PeractPopoverContent>
      </PeractPopover>
    </div>;
}

export function HomeView({
  isAdmin,
  period,
  setPeriod,
  customMode,
  activateCustomPeriod,
  periodLabel,
  customStartDate,
  selectCustomStartDate,
  customEndDate,
  selectCustomEndDate,
  customRangeActive,
  customPeriodError,
  applyCustomPeriod,
  chartData,
  categoriaData,
  criticalProducts,
  criticalCount,
  margemPercReal,
  margemPerc,
  margemBRL,
  vendasRecentes,
  totalVendasKpi,
  salesChange,
  faturamentoKpi,
  revenueChange,
  marginChange,
  salesChannel,
  setSalesChannel,
  channelSalesCount,
  channelSalesChange,
  channelsAvailable,
  isChannelsLoading,
  channelsError,
  retrySalesByChannel,
  topProdutos,
  isDashboardLoading,
  failedSections,
  summaryAvailable,
  marginAvailable
}: ReturnType<typeof useHomeFacade>) {
  const isLoss = margemPerc < 0;
  const marginColor = isLoss ? "#dc2626" : "#22c55e";
  const marginValueLabel = isLoss
    ? `Perda: ${fmtBRL(Math.abs(margemBRL))}`
    : `Lucro: ${fmtBRL(margemBRL)}`;

  return <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div>
          <h1 data-tour="tour-home-heading" className="peract-font-color-default">Início</h1>
          <p className="text-sm peract-font-color-muted mt-0.5">Painel de controle Canal Perfumado Decants</p>
        </div>
        {isAdmin && <div className="flex w-full flex-col items-start gap-2 self-start sm:w-auto sm:items-end">
          <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
            <div className="flex rounded-lg overflow-hidden border peract-border-color">
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => <PeractButtonPrimitive key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 text-xs transition-all" style={period === p && !customMode ? {
                background: DARK,
                color: "white"
              } : {
                background: "white",
                color: "#4b5563"
              }} variant="plain" size="plain">
                {PERIOD_LABELS[p]}
              </PeractButtonPrimitive>)}
              <PeractButtonPrimitive onClick={activateCustomPeriod} className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all" style={customMode ? { background: DARK, color: "white" } : { background: "white", color: "#4b5563" }} variant="plain" size="plain" aria-pressed={customMode}>
                <CalendarDays size={13} /> Personalizado
              </PeractButtonPrimitive>
            </div>
          </div>
          {customMode && <div className="flex w-full flex-col items-start gap-1 sm:items-end">
            <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
              <CalendarDateField label="Data inicial" value={customStartDate} onSelect={selectCustomStartDate} />
              <CalendarDateField label="Data final" value={customEndDate} onSelect={selectCustomEndDate} />
              <PeractButtonPrimitive onClick={applyCustomPeriod} className="flex h-8 items-center gap-1.5 rounded-md border border-transparent px-4 text-xs font-medium text-white shadow-sm transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29958] focus-visible:ring-offset-2 active:translate-y-px" style={{ background: ACC }} variant="plain" size="plain" aria-label="Aplicar período personalizado">
                <Check size={13} /> Aplicar
              </PeractButtonPrimitive>
            </div>
            {customRangeActive && <span role="status" className="text-xs font-medium peract-font-color-accent">Personalizado: {periodLabel}</span>}
          </div>}
          {customPeriodError && <p role="alert" className="w-full text-xs text-red-600">{customPeriodError}</p>}
        </div>}
      </div>

      {isAdmin && isDashboardLoading && <p role="status" className="mb-4 text-xs peract-font-color-muted">Carregando indicadores da Dashboard...</p>}
      {isAdmin && failedSections.length > 0 && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Não foi possível carregar {failedSections.length === 1 ? "um indicador" : "alguns indicadores"}. As demais seções continuam disponíveis.</div>}

      {/* Alert (só admin) */}
      {criticalCount > 0 && isAdmin && <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm mb-5 peract-font-color-default" style={{
      background: `${ACC}12`,
      borderColor: `${ACC}40`
    }}>
          <AlertTriangle size={16} className="shrink-0 peract-font-color-accent" />
          <span>
            <strong>{criticalCount} produto(s)</strong> no limite de estoque ou abaixo dele.{" "}
            <Link to="/estoque/produtos" className="underline ml-1 font-medium hover:opacity-80 peract-font-color-accent">
              Ver produtos →
            </Link>
          </span>
        </div>}

      {/* ── KPI Cards ── */}
      {isAdmin && <div data-tour="tour-home-kpis" className="grid grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-5">
        <KpiCard title="Vendas no Período" value={String(totalVendasKpi)} icon={<ShoppingBag size={20} />} variacao={salesChange} empty={!summaryAvailable} emptyMsg="Não foi possível carregar vendas" />
        {isAdmin && <KpiCard title="Faturamento no Período" value={fmtBRL(faturamentoKpi)} icon={<DollarSign size={20} />} variacao={revenueChange} empty={!summaryAvailable} emptyMsg="Não foi possível carregar vendas" />}
        {isAdmin && <KpiCard title="Margem de Lucro" value={`${margemPerc.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} value2={marginValueLabel} icon={isLoss ? <TrendingDown size={20} /> : <TrendingUp size={20} />} variacao={marginChange} sub="sobre vendas finalizadas" highlight={marginColor} empty={!marginAvailable} emptyMsg="Não foi possível carregar margem" />}
        <KpiCard title="Vendas por canal" value={channelSalesCount.toLocaleString("pt-BR")} icon={<ShoppingCart size={20} />} variacao={channelSalesChange} sub={channelsAvailable && channelSalesChange === undefined ? "Comparação com período anterior indisponível" : "vendas finalizadas no período"} empty={!channelsAvailable} emptyMsg={isChannelsLoading ? "Carregando vendas por canal..." : "Não foi possível carregar vendas por canal"} headerAction={channelsError ? <PeractButtonPrimitive onClick={retrySalesByChannel} aria-label="Recarregar vendas por canal" title="Tentar novamente" variant="plain" size="plain" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg peract-bg-accent-soft peract-font-color-muted hover:opacity-80"><RefreshCw size={16} /></PeractButtonPrimitive> : undefined}>
          <PeractNativeSelect aria-label="Canal das vendas" value={salesChannel} onChange={event => setSalesChannel(event.target.value as SalesChannel)} className="h-7 min-h-7 w-full max-w-full px-2 py-0 text-xs">
            {SALES_CHANNEL_OPTIONS.map(channel => <option key={channel.value} value={channel.value}>{channel.label}</option>)}
          </PeractNativeSelect>
        </KpiCard>
      </div>}

      {/* ── Charts row 1: Faturamento + Qtd Vendas ── */}
      {isAdmin && <div data-tour="tour-home-charts" className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
            <h2 className="text-sm mb-4 peract-font-color-default">Faturamento — {customRangeActive ? periodLabel : PERIOD_LABELS[period]}</h2>
            {chartData.length === 0 ? <EmptyChart icon={<DollarSign size={22} />} message={failedSections.includes("temporalSeries") ? "Série temporal indisponível" : "Sem movimentação no período"} sub={failedSections.includes("temporalSeries") ? "Não foi possível carregar os dados do período" : undefined} /> : <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{
              fontSize: 11,
              fill: "#9ca3af"
            }} axisLine={false} tickLine={false} />
                  <YAxis tick={{
              fontSize: 11,
              fill: "#9ca3af"
                  }} axisLine={false} tickLine={false} tickFormatter={v => fmtBRLShort(Number(v))} />
                  <Tooltip content={<TooltipFat />} />
                  <Line type="monotone" dataKey="faturamento" stroke={ACC} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>}
          </PeractCard>

        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <h2 className="text-sm mb-4 peract-font-color-default">Quantidade de Vendas — {customRangeActive ? periodLabel : PERIOD_LABELS[period]}</h2>
          {chartData.length === 0 ? <EmptyChart icon={<BarChart2 size={22} />} message={failedSections.includes("temporalSeries") ? "Série temporal indisponível" : "Sem movimentação no período"} sub={failedSections.includes("temporalSeries") ? "Não foi possível carregar os dados do período" : undefined} /> : <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
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
                <Line type="monotone" dataKey="vendas" stroke={ACC} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>}
        </PeractCard>
      </div>}

      {/* ── Charts row 2: Top 5 + Distribuição por Categoria ── */}
      {isAdmin && <div data-tour="tour-home-products" className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Top 5 Produtos */}
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
          <h2 className="text-sm mb-4 peract-font-color-default">Top 5 Produtos Mais Vendidos</h2>
          {topProdutos.length === 0 ? <EmptyChart icon={<Droplets size={22} />} message={failedSections.includes("topProducts") ? "Top produtos indisponível" : "Nenhum produto vendido no período"} /> : <div className="flex flex-col gap-3">
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
                        <p className="text-xs peract-font-color-muted">{p.categoria}</p>
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
        <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm flex flex-col">
          <h2 className="text-sm mb-4 peract-font-color-default">Distribuição por Categoria — {customRangeActive ? periodLabel : PERIOD_LABELS[period]}</h2>
          {categoriaData.length === 0 ? <EmptyChart icon={<Package size={22} />} message={failedSections.includes("categoryData") ? "Distribuição por categoria indisponível" : "Sem vendas por categoria no período"} /> : <div className="flex flex-1 min-h-[360px] items-center justify-center">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie data={categoriaData} dataKey="receita" nameKey="categoria" cx="50%" cy="45%" innerRadius="58%" outerRadius="78%" paddingAngle={3}>
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
              fontSize: 13,
              color: "#6b6b68"
            }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>}
        </PeractCard>
      </div>}

      {/* ── Seção inferior: Estoque Crítico (admin) + Vendas Recentes ── */}
      {isAdmin && <div data-tour="tour-home-operations" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
                  {failedSections.includes("criticalProducts") ? "Estoque crítico indisponível" : "Nenhum produto em estoque crítico"}
                </p>
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
                  {failedSections.includes("recentSales") ? "Vendas recentes indisponíveis" : "Nenhuma venda recente"}
                </p>
              </div> : <div className="flex flex-col gap-1.5">
                {vendasRecentes.map(v => {
              const statusLabel = v.status === "FINALIZADA" ? "Finalizado" : v.status === "CANCELADA" ? "Cancelado" : "Pendente";
              const statusStyle = v.status === "FINALIZADA" ? "bg-green-100 text-green-700" : v.status === "CANCELADA" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
            return <div key={v.id} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{
              background: "#fafaf9"
            }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{
                background: WARM
              }}>
                  <ShoppingBag size={12} className="peract-font-color-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{v.cliente || "—"}</p>
                        <p className="text-xs peract-font-color-muted">{v.data} · {v.pagamento}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold peract-font-color-default">
                          R$ {v.total.toFixed(2).replace(".", ",")}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusStyle}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>;
          })}
              </div>}

            <Link to="/vendas/pedidos" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs border peract-border-color text-gray-600 hover:bg-gray-50 transition-colors mt-3">
              <Package size={13} /> Ver pedidos online
            </Link>
          </PeractCard>
        </div>}

      {/* Funcionário: acesso rápido */}
      {!isAdmin && <div data-tour="tour-home-employee-actions" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
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
