import { Package, Shield } from "lucide-react";
import type { Section } from "../models/settings.models";
export const settingsSections: {
  key: Section;
  label: string;
  icon: React.ReactNode;
}[] = [{
  key: "estoque",
  label: "Configurações de estoque",
  icon: <Package size={16} />
}, {
  key: "seguranca",
  label: "Segurança",
  icon: <Shield size={16} />
}];
