import { useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  ShoppingBag, DollarSign, TrendingUp, TrendingDown,
  Package, ArrowRight, ShoppingCart, Users,
  Droplets, AlertTriangle, BarChart2, Globe, Store,
  FlaskConical, Eye,
} from "lucide-react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";

const ACC  = "#c29958";
const DARK = "#050300";
const WARM = "#f5ede0";

type Period = "diario" | "7dias" | "30dias" | "semestre";

const PERIOD_LABELS: Record<Period, string> = {
  diario:   "Diário",
  "7dias":  "7 dias",
  "30dias": "30 dias",
  semestre: "Semestre",
};

/* ─── Mock data ─── */
const CHART_DATA: Record<Period, Array<{ label: string; faturamento: number; vendas: number }>> = {
  diario: [
    { label: "08h", faturamento: 120,  vendas: 1 },
    { label: "10h", faturamento: 340,  vendas: 3 },
    { label: "12h", faturamento: 180,  vendas: 2 },
    { label: "14h", faturamento: 560,  vendas: 5 },
    { label: "16h", faturamento: 240,  vendas: 2 },
    { label: "18h", faturamento: 420,  vendas: 4 },
    { label: "20h", faturamento: 310,  vendas: 3 },
  ],
  "7dias": [
    { label: "26/03", faturamento: 420,  vendas: 4 },
    { label: "27/03", faturamento: 760,  vendas: 7 },
    { label: "28/03", faturamento: 530,  vendas: 5 },
    { label: "29/03", faturamento: 990,  vendas: 9 },
    { label: "30/03", faturamento: 640,  vendas: 6 },
    { label: "31/03", faturamento: 1180, vendas: 11 },
    { label: "01/04", faturamento: 850,  vendas: 8 },
  ],
  "30dias": [
    { label: "Sem 1", faturamento: 2100, vendas: 22 },
    { label: "Sem 2", faturamento: 3200, vendas: 31 },
    { label: "Sem 3", faturamento: 2800, vendas: 28 },
    { label: "Sem 4", faturamento: 3900, vendas: 38 },
  ],
  semestre: [
    { label: "Out", faturamento: 4100, vendas: 38 },
    { label: "Nov", faturamento: 4850, vendas: 45 },
    { label: "Dez", faturamento: 6700, vendas: 62 },
    { label: "Jan", faturamento: 4400, vendas: 41 },
    { label: "Fev", faturamento: 5350, vendas: 50 },
    { label: "Mar", faturamento: 5900, vendas: 55 },
  ],
};

const KPI_DATA: Record<Period, { vendas: number; faturamento: number; variacao: number; margem: number }> = {
  diario:   { vendas: 20,  faturamento: 2170,  variacao: 12,  margem: 38.4 },
  "7dias":  { vendas: 50,  faturamento: 5370,  variacao: 8,   margem: 39.1 },
  "30dias": { vendas: 119, faturamento: 12000, variacao: -3,  margem: 37.8 },
  semestre: { vendas: 291, faturamento: 31300, variacao: 15,  margem: 40.5 },
};

const CATEGORIA_DATA: Record<Period, Array<{ categoria: string; receita: number }>> = {
  diario:   [
    { categoria: "Perfumes",    receita: 980 },
    { categoria: "Body Splash", receita: 420 },
    { categoria: "Colônias",    receita: 210 },
    { categoria: "Kits",        receita: 560 },
  ],
  "7dias":  [
    { categoria: "Perfumes",    receita: 2800 },
    { categoria: "Body Splash", receita: 1200 },
    { categoria: "Colônias",    receita: 650 },
    { categoria: "Kits",        receita: 720 },
  ],
  "30dias": [
    { categoria: "Perfumes",    receita: 6500 },
    { categoria: "Body Splash", receita: 2900 },
    { categoria: "Colônias",    receita: 1400 },
    { categoria: "Kits",        receita: 1200 },
  ],
  semestre: [
    { categoria: "Perfumes",    receita: 18500 },
    { categoria: "Body Splash", receita: 7200 },
    { categoria: "Colônias",    receita: 3800 },
    { categoria: "Kits",        receita: 1800 },
  ],
};

const TOP_PRODUTOS = [
  { nome: "Dior Sauvage 5ml",  marca: "Dior",     vendas: 48 },
  { nome: "Chanel N°5 2ml",   marca: "Chanel",   vendas: 42 },
  { nome: "Creed Aventus 5ml", marca: "Creed",    vendas: 35 },
  { nome: "YSL Libre 2ml",    marca: "YSL",      vendas: 28 },
  { nome: "Tom Ford 5ml",     marca: "Tom Ford", vendas: 22 },
];

const CAT_COLORS = [ACC, "#b07d40", "#8c6030", "#6b4620"];

const TOOLTIP_STYLE = {
  contentStyle: { background: DARK, border: "none", borderRadius: "8px", color: "white", fontSize: "12px" },
};

function fmtBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtBRLShort(v: number) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1).replace(".", ",")}k`;
  return `R$ ${v.toFixed(0)}`;
}

/* ─── Empty chart placeholder ─── */
function EmptyChart({
  icon, message, sub,
}: { icon: React.ReactNode; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] gap-3">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${ACC}18` }}>
        <span style={{ color: `${ACC}80` }}>{icon}</span>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-400">{message}</p>
        {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({
  title, value, value2, icon, sub, variacao, highlight, empty, emptyMsg,
}: {
  title: string; value: string; value2?: string; icon: React.ReactNode; sub?: string;
  variacao?: number; highlight?: string; empty?: boolean; emptyMsg?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 leading-tight pr-2">{title}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ background: empty ? "#e5e7eb" : (highlight ?? ACC) }}>
          <span className={empty ? "text-gray-400" : "text-white"}>{icon}</span>
        </div>
      </div>

      {empty ? (
        <div>
          <p className="text-2xl font-semibold text-gray-200 mb-1">—</p>
          <p className="text-xs text-gray-400">{emptyMsg ?? "Sem dados disponíveis"}</p>
        </div>
      ) : (
        <>
          <p className="text-2xl font-semibold mb-0.5" style={{ color: DARK }}>{value}</p>
          {value2 && (
            <p className="text-xs font-medium mb-1" style={{ color: highlight ?? ACC }}>{value2}</p>
          )}
          {variacao !== undefined && (
            <div className="flex items-center gap-1">
              {variacao >= 0
                ? <TrendingUp size={12} className="text-green-500 shrink-0" />
                : <TrendingDown size={12} className="text-red-500 shrink-0" />}
              <span className={`text-xs ${variacao >= 0 ? "text-green-600" : "text-red-500"}`}>
                {variacao >= 0 ? "+" : ""}{variacao}% vs anterior
              </span>
            </div>
          )}
          {sub && variacao === undefined && !value2 && (
            <p className="text-xs text-gray-400">{sub}</p>
          )}
          {sub && value2 && (
            <p className="text-xs text-gray-400">{sub}</p>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Tooltip customizados ─── */
function TooltipFat({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="text-white text-xs rounded-lg px-3 py-2 shadow-xl" style={{ background: DARK }}>
      <p className="text-gray-300 mb-1">{label}</p>
      <p className="font-medium">{fmtBRL(payload[0].value)}</p>
    </div>
  );
}

function TooltipVendas({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="text-white text-xs rounded-lg px-3 py-2 shadow-xl" style={{ background: DARK }}>
      <p className="text-gray-300 mb-1">{label}</p>
      <p className="font-medium">{payload[0].value} vendas</p>
    </div>
  );
}

/* ─── Main ─── */
export function Inicio() {
  const { products, clientes, vendas, currentUser } = useApp();
  const isAdmin = currentUser?.cargo === "Administrador";

  const [period, setPeriod] = useState<Period>("7dias");
  const [emptyMode, setEmptyMode] = useState(false);

  /* ── Dados reais ── */
  const chartData     = emptyMode ? [] : CHART_DATA[period];
  const categoriaData = emptyMode ? [] : CATEGORIA_DATA[period];
  const kpi           = KPI_DATA[period];
  const criticalProducts = emptyMode ? [] : products.filter(p => p.status !== "ok");

  // Margem real calculada dos produtos com precoCompra
  const produtosComMargem = products.filter(p => p.precoCompra && p.precoCompra > 0);
  const margemPercReal = produtosComMargem.length > 0
    ? produtosComMargem.reduce((acc, p) => acc + ((p.preco - p.precoCompra!) / p.preco) * 100, 0) / produtosComMargem.length
    : null;
  const margemPerc = margemPercReal ?? kpi.margem;
  const margemBRL  = emptyMode ? 0 : (kpi.faturamento * margemPerc) / 100;

  // Vendas recentes (não canceladas, com total)
  const vendasRecentes = emptyMode
    ? []
    : [...vendas]
        .filter(v => !v.cancelada)
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 6);

  const totalVendasKpi   = emptyMode ? 0 : kpi.vendas;
  const faturamentoKpi   = emptyMode ? 0 : kpi.faturamento;
  const clientesKpi      = emptyMode ? 0 : clientes.length;
  const topProdutos      = emptyMode ? [] : TOP_PRODUTOS;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 style={{ color: DARK }}>Início</h1>
          <p className="text-sm text-gray-500 mt-0.5">Painel de controle Canal Perfumado Decants</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start">
          {/* Empty mode toggle */}
          <button
            onClick={() => setEmptyMode(!emptyMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
              emptyMode
                ? "text-white border-transparent"
                : "text-gray-500 border-gray-200 bg-white hover:border-gray-300"
            }`}
            style={emptyMode ? { background: "#6366f1" } : {}}
            title={emptyMode ? "Sair da simulação e ver dados reais" : "Simular dashboard sem dados (primeiro acesso)"}
          >
            <Eye size={12} />
            {emptyMode ? "Sair da simulação" : "Simular sem dados"}
          </button>

          {/* Period selector */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-xs transition-all"
                style={period === p
                  ? { background: DARK, color: "white" }
                  : { background: "white", color: "#4b5563" }}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty mode banner */}
      {emptyMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm mb-5"
          style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.3)", color: "#4338ca" }}>
          <Eye size={16} className="shrink-0" />
          <span>
            <strong>Modo de simulação ativo.</strong> Exibindo como ficaria o painel sem nenhum dado cadastrado —
            útil para prever a experiência de primeiro acesso.
            <button onClick={() => setEmptyMode(false)} className="underline ml-2 font-medium hover:opacity-80">
              Sair da simulação
            </button>
          </span>
        </div>
      )}

      {/* Alert (só admin, fora do empty mode) */}
      {!emptyMode && criticalProducts.length > 0 && isAdmin && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm mb-5"
          style={{ background: `${ACC}12`, borderColor: `${ACC}40`, color: DARK }}>
          <AlertTriangle size={16} className="shrink-0" style={{ color: ACC }} />
          <span>
            <strong>{criticalProducts.length} produto(s)</strong> com estoque abaixo do mínimo.{" "}
            <Link to="/estoque/produtos" className="underline ml-1 font-medium hover:opacity-80" style={{ color: ACC }}>
              Ver produtos →
            </Link>
          </span>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        <KpiCard
          title="Vendas no Período"
          value={String(totalVendasKpi)}
          icon={<ShoppingBag size={20} />}
          variacao={emptyMode ? undefined : kpi.variacao}
          empty={emptyMode}
          emptyMsg="Nenhuma venda registrada ainda"
        />
        {isAdmin && (
          <KpiCard
            title="Faturamento no Período"
            value={fmtBRL(faturamentoKpi)}
            icon={<DollarSign size={20} />}
            variacao={emptyMode ? undefined : kpi.variacao}
            empty={emptyMode}
            emptyMsg="Registre a primeira venda para ver o faturamento"
          />
        )}
        {isAdmin && (
          <KpiCard
            title="Margem de Lucro"
            value={`${margemPerc.toFixed(1)}%`}
            value2={`≈ ${fmtBRLShort(margemBRL)} no período`}
            icon={<TrendingUp size={20} />}
            sub={margemPercReal !== null ? "calculada do catálogo" : "estimativa"}
            highlight="#22c55e"
            empty={emptyMode}
            emptyMsg="Configure preços de compra nos produtos"
          />
        )}
        <KpiCard
          title="Clientes Cadastrados"
          value={String(clientesKpi)}
          icon={<Users size={20} />}
          sub="no sistema"
          highlight="#6366f1"
          empty={emptyMode}
          emptyMsg="Nenhum cliente cadastrado ainda"
        />
      </div>

      {/* ── Charts row 1: Faturamento + Qtd Vendas ── */}
      <div className={`grid gap-4 mb-4 ${isAdmin ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
        {isAdmin && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm mb-4" style={{ color: DARK }}>Faturamento — {PERIOD_LABELS[period]}</h2>
            {chartData.length === 0 ? (
              <EmptyChart
                icon={<DollarSign size={22} />}
                message="Nenhum dado de faturamento disponível"
                sub="Registre vendas para visualizar a evolução do faturamento"
              />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<TooltipFat />} />
                  <Bar dataKey="faturamento" fill={ACC} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm mb-4" style={{ color: DARK }}>Quantidade de Vendas — {PERIOD_LABELS[period]}</h2>
          {chartData.length === 0 ? (
            <EmptyChart
              icon={<BarChart2 size={22} />}
              message="Sem vendas para exibir"
              sub="O gráfico aparecerá após a primeira venda ser registrada"
            />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TooltipVendas />} />
                <Bar dataKey="vendas" fill={ACC} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Charts row 2: Top 5 + Distribuição por Categoria ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        {/* Top 5 Produtos */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm mb-4" style={{ color: DARK }}>Top 5 Produtos Mais Vendidos</h2>
          {topProdutos.length === 0 ? (
            <EmptyChart
              icon={<Droplets size={22} />}
              message="Nenhum produto vendido ainda"
              sub="Os produtos mais vendidos aparecerão aqui conforme as vendas forem registradas"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {topProdutos.map((p, i) => (
                <div key={p.nome} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white"
                    style={{ background: i === 0 ? ACC : i === 1 ? DARK : "#d1c0a0" }}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: WARM }}>
                    <Droplets size={14} style={{ color: ACC }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-xs text-gray-800 truncate">{p.nome}</p>
                        <p className="text-xs text-gray-400">{p.marca}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-700 shrink-0 ml-2">{p.vendas} vendas</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(p.vendas / topProdutos[0].vendas) * 100}%`, background: i === 0 ? ACC : "#d1c0a0" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribuição por Categoria */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm mb-4" style={{ color: DARK }}>Distribuição por Categoria — {PERIOD_LABELS[period]}</h2>
          {categoriaData.length === 0 ? (
            <EmptyChart
              icon={<Package size={22} />}
              message="Sem dados por categoria"
              sub="A distribuição de receita por categoria aparecerá após as primeiras vendas"
            />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  dataKey="receita"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categoriaData.map((entry, i) => (
                    <Cell key={`cat-${entry.categoria}`} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: DARK, border: "none", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#ffffff" }}
                  labelStyle={{ color: "#ffffff" }}
                  formatter={(v) => [fmtBRL(Number(v)), "Receita"]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: "#6b6b68" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Seção inferior: Estoque Crítico (admin) + Vendas Recentes ── */}
      {isAdmin && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Estoque Crítico */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm" style={{ color: DARK }}>Estoque Crítico</h2>
              <Link to="/estoque/produtos" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: ACC }}>
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {criticalProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Package size={18} className="text-green-500" />
                </div>
                <p className="text-sm text-gray-400">
                  {emptyMode ? "Nenhum produto cadastrado ainda" : "Nenhum produto em estoque crítico 🎉"}
                </p>
                {emptyMode && <p className="text-xs text-gray-300 text-center">Os produtos com baixo estoque aparecerão aqui</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 mb-4">
                {criticalProducts.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "#fafaf9" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === "esgotado" ? "bg-red-500" : "bg-amber-400"}`} />
                      <span className="text-xs text-gray-700 truncate">{item.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${item.status === "esgotado" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.currentStock} un.
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/vendas/registrar"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity mt-2"
              style={{ background: ACC }}>
              <ShoppingCart size={13} /> Registrar venda
            </Link>
          </div>

          {/* Vendas Recentes */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm" style={{ color: DARK }}>Vendas Recentes</h2>
              <Link to="/vendas/historico" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: ACC }}>
                Ver histórico <ArrowRight size={12} />
              </Link>
            </div>

            {vendasRecentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: WARM }}>
                  <ShoppingBag size={18} style={{ color: ACC, opacity: 0.5 }} />
                </div>
                <p className="text-sm text-gray-400">
                  {emptyMode ? "Nenhuma venda realizada ainda" : "Sem vendas recentes"}
                </p>
                {emptyMode && (
                  <p className="text-xs text-gray-300 text-center max-w-[200px]">
                    As últimas transações aparecerão aqui assim que uma venda for registrada
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {vendasRecentes.map((v) => {
                  const isOnline = v.tipoVenda === "online";
                  const isFinished = v.enviado || v.tipoVenda === "presencial";
                  return (
                    <div key={v.id} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: "#fafaf9" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isOnline ? "#EFF6FF" : WARM }}>
                        {isOnline
                          ? <Globe size={12} className="text-blue-500" />
                          : <Store size={12} style={{ color: ACC }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{v.cliente || "—"}</p>
                        <p className="text-xs text-gray-400">{v.data} · {v.pagamento}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold" style={{ color: DARK }}>
                          R$ {v.total.toFixed(2).replace(".", ",")}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isFinished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {isFinished ? "Finalizado" : "Pendente"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link to="/vendas/pedidos"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors mt-3"
            >
              <FlaskConical size={13} /> Ver pedidos online
            </Link>
          </div>
        </div>
      )}

      {/* Funcionário: acesso rápido */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <Link to="/vendas/registrar"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: ACC }}>
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: DARK }}>Registrar Venda</p>
              <p className="text-xs text-gray-400">Abrir ponto de venda</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link to="/vendas/pedidos"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "#6366f1" }}>
              <Package size={18} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: DARK }}>Pedidos Online</p>
              <p className="text-xs text-gray-400">Ver pedidos pendentes</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        </div>
      )}
    </div>
  );
}
