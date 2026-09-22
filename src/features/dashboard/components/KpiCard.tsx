import { PeractCard } from "../../../shared/components/peract-card";
import { TrendingUp } from "lucide-react";

export function KpiCard({
  title,
  value,
  icon,
  sub,
  alert
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
  alert?: boolean;
}) {
  return <PeractCard className="peract-bg-card rounded-xl border peract-border-color p-4 shadow-sm" aria-label={`${title}: ${value}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs peract-font-color-muted leading-tight pr-2">{title}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{
        background: alert ? "#dc2626" : "#c29958"
      }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold mb-1 peract-font-color-default">{value}</p>
      <div className="flex items-center gap-1">
        {!alert && <TrendingUp size={12} className="text-green-500 shrink-0" />}
        <p className="text-xs peract-font-color-muted leading-tight">{sub}</p>
      </div>
    </PeractCard>;
}
