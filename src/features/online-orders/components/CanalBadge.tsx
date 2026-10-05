import { PeractTag } from "../../../shared/components/peract-tag";
import { MessageCircle, Globe } from "lucide-react";
export function CanalBadge({
  canal
}: {
  canal?: "whatsapp" | "site";
}) {
  if (canal === "whatsapp") {
    return <PeractTag className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <MessageCircle size={10} /> WhatsApp
      </PeractTag>;
  }
  return <PeractTag className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <Globe size={10} /> Site
    </PeractTag>;
}
