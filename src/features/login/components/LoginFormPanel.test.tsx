import { useState, type FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { LoginFormPanel } from "./LoginFormPanel";
import type { LoginFormData } from "../models/login.models";

interface TestHostProps {
  authError?: string;
  loading?: boolean;
  onSubmit?: () => void;
}

function TestHost({ authError = "", loading = false, onSubmit = vi.fn() }: TestHostProps) {
  const {
    control,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showPass, setShowPass] = useState(false);

  return (
    <LoginFormPanel
      accounts={[
        {
          color: "#c29958",
          email: "admin@canalperfumado.com.br",
          icon: <span>icone</span>,
          label: "Administrador",
          senha: "admin123",
        },
      ]}
      facade={{
        authError,
        control,
        errors,
        handleSelectAccount: vi.fn(),
        loading,
        onSubmit: (event?: FormEvent<HTMLFormElement>) => {
          event?.preventDefault();
          onSubmit();
        },
        setValue,
        showPass,
        togglePasswordVisibility: () => setShowPass((currentValue) => !currentValue),
      }}
    />
  );
}

describe("LoginFormPanel", () => {
  it("renders the login form and toggles password visibility", () => {
    render(<TestHost authError="E-mail ou senha incorretos." />);

    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");

    const toggleButton = screen.getByLabelText("Mostrar senha");
    fireEvent.click(toggleButton);

    expect(screen.getByLabelText("Ocultar senha")).toBeInTheDocument();
  });

  it("submits the form and shows the loading text", () => {
    const onSubmit = vi.fn();

    const { rerender } = render(<TestHost onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar no sistema" }));

    expect(onSubmit).toHaveBeenCalled();

    rerender(<TestHost loading onSubmit={onSubmit} />);

    expect(screen.getByRole("button", { name: /Verificando/ })).toBeInTheDocument();
  });
});