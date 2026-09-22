import { ACC } from "../config/home.config";
export function EmptyChart({
  icon,
  message,
  sub
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) {
  return <div className="flex flex-col items-center justify-center h-[200px] gap-3">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
      background: `${ACC}18`
    }}>
        <span style={{
        color: `${ACC}80`
      }}>{icon}</span>
      </div>
      <div className="text-center">
        <p className="text-sm peract-font-color-muted">{message}</p>
        {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>;
}
