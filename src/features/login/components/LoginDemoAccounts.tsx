import type { ReactNode } from "react";
import { PeractButton } from "../../../shared/components/peract-button";

interface DemoAccount {
  color: string;
  email: string;
  icon: ReactNode;
  label: string;
  senha: string;
}

interface LoginDemoAccountsProps {
  accounts: DemoAccount[];
  onSelectAccount: (account: DemoAccount) => void;
}

export function LoginDemoAccounts({ accounts, onSelectAccount }: LoginDemoAccountsProps) {
  return (
    <div className="mt-8 border-t border-[rgba(0,0,0,0.08)] pt-6">
      <p className="mb-3 text-center text-xs tracking-[0.1em] text-[#9a9a97]">CREDENCIAIS DE DEMONSTRAÇÃO</p>
      <div className="flex flex-col gap-2">
        {accounts.map((account) => (
          <PeractButton
            key={account.email}
            action={() => onSelectAccount(account)}
            className="h-auto w-full rounded-xl border px-4 py-3 text-left text-xs transition-all active:scale-[0.99]"
            style={{ background: "#f7f7f6", borderColor: `${account.color}28`, color: "inherit" }}
            theme="secondary"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span style={{ color: account.color }}>{account.icon}</span>
              <span className="font-medium" style={{ color: account.color }}>{account.label}</span>
              <span className="ml-auto text-[#9a9a97]">clique para preencher</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span className="text-[#9a9a97]">E-mail:</span>
                <span className="font-mono text-[#4a4a47]">{account.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a9a97]">Senha:</span>
                <span className="font-mono text-[#4a4a47]">{account.senha}</span>
              </div>
            </div>
          </PeractButton>
        ))}
      </div>
    </div>
  );
}