import { fmtBRL } from "../services/home.service";

export function TooltipFat({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return <div className="text-white text-xs rounded-lg px-3 py-2 shadow-xl peract-bg-primary">
      <p className="text-gray-300 mb-1">{label}</p>
      <p className="font-medium">{fmtBRL(payload[0].value)}</p>
    </div>;
}
