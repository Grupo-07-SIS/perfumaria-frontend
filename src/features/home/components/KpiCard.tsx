import { PeractCard } from "../../../shared/components/peract-card";
import { ACC } from "../config/home.config";
import { TrendingUp, TrendingDown } from "lucide-react";
export function KpiCard({
  title,
  value,
  value2,
  icon,
  sub,
  variacao,
  highlight,
  empty,
  emptyMsg,
  children,
  headerAction,
}: {
  title: string;
  value: string;
  value2?: string;
  icon: React.ReactNode;
  sub?: string;
  variacao?: number;
  highlight?: string;
  empty?: boolean;
  emptyMsg?: string;
  children?: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
    return <PeractCard className="flex h-48 min-w-0 flex-col peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm">
      <div data-slot="kpi-header" className="mb-2 flex h-14 min-w-0 shrink-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs peract-font-color-muted leading-tight">{title}</p>
          {children && <div className="mt-2 min-w-0">{children}</div>}
        </div>
        {headerAction ?? <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{
        background: empty ? "#e5e7eb" : highlight ?? ACC
      }}>
          <span className={empty ? "peract-font-color-muted" : "text-white"}>{icon}</span>
        </div>}
      </div>

      {empty ? <div>
          <p className="text-2xl font-semibold text-gray-200 mb-1">—</p>
          <p className="text-xs peract-font-color-muted">{emptyMsg ?? "Sem dados disponíveis"}</p>
        </div> : <>
          <p className="text-2xl font-semibold mb-0.5 peract-font-color-default">{value}</p>
          {value2 && <p className="text-xs font-medium mb-1" style={{
        color: highlight ?? ACC
      }}>{value2}</p>}
          {variacao !== undefined && <div className="flex items-center gap-1">
              {variacao >= 0 ? <TrendingUp size={12} className="text-green-500 shrink-0" /> : <TrendingDown size={12} className="text-red-500 shrink-0" />}
              <span className={`text-xs ${variacao >= 0 ? "text-green-600" : "text-red-500"}`}>
                {variacao >= 0 ? "+" : ""}{variacao.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% vs anterior
              </span>
            </div>}
          {sub && <p className="text-xs peract-font-color-muted">{sub}</p>}
        </>}
    </PeractCard>;
}
