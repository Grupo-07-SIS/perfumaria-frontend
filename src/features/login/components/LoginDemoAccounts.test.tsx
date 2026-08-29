import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LoginDemoAccounts } from "./LoginDemoAccounts";

describe("LoginDemoAccounts", () => {
  it("renders demo accounts and notifies selection", () => {
    const onSelectAccount = vi.fn();

    render(
      <LoginDemoAccounts
        accounts={[
          {
            color: "#c29958",
            email: "admin@canalperfumado.com.br",
            icon: <span>icone</span>,
            label: "Administrador",
            senha: "admin123",
          },
        ]}
        onSelectAccount={onSelectAccount}
      />,
    );

    fireEvent.click(screen.getByText("Administrador"));

    expect(screen.getByText("CREDENCIAIS DE DEMONSTRAÇÃO")).toBeInTheDocument();
    expect(onSelectAccount).toHaveBeenCalledWith({
      color: "#c29958",
      email: "admin@canalperfumado.com.br",
      icon: expect.anything(),
      label: "Administrador",
      senha: "admin123",
    });
  });
});