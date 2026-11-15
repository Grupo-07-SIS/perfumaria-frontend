import { User, Truck, Briefcase } from "lucide-react";
import type { Aba } from "../models/people.models";
export function createPeopleTabs(clientCount: number, supplierCount: number, employeeCount: number) {
  const allTabs: {
    key: Aba;
    label: string;
    icon: React.ReactNode;
    count: number;
    adminOnly: boolean;
  }[] = [{
    key: "clientes",
    label: "Clientes",
    icon: <User size={15} />,
    count: clientCount,
    adminOnly: false
  }, {
    key: "fornecedores",
    label: "Fornecedores",
    icon: <Truck size={15} />,
    count: supplierCount,
    adminOnly: true
  }, {
    key: "funcionarios",
    label: "Funcionários",
    icon: <Briefcase size={15} />,
    count: employeeCount,
    adminOnly: true
  }];
  return allTabs;
}
