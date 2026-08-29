import { ShieldCheck, UserCheck } from "lucide-react";
import type { DemoAccount } from "../models/login.models";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    color: "#c29958",
    email: "admin@canalperfumado.com.br",
    icon: <ShieldCheck size={12} />,
    label: "Administrador",
    senha: "admin123",
  },
  {
    color: "#6366f1",
    email: "beatriz@canalperfumado.com.br",
    icon: <UserCheck size={12} />,
    label: "Funcionário",
    senha: "func123",
  },
];

export const PERFUME_BG = "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJmdW1lJTIwYm90dGxlJTIwd2hpdGUlMjBnb2xkJTIwbHV4dXJ5JTIwZmxhdCUyMGxheXxlbnwxfHx8fDE3Nzg4ODEyMDN8MA&ixlib=rb-4.1.0&q=80&w=1080";