import { useState, type FormEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { MemoryRouter, Route, Routes } from "react-router";
const { flags } = vi.hoisted(() => ({ flags: { securityQuestionsEnabled: true } }));
vi.mock("../../../environment", () => ({ environment: { features: flags } }));
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
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showPass, setShowPass] = useState(false);

  return (
    <LoginFormPanel
      facade={{
        authError,
        control,
        errors,
        loading,
        onSubmit: (event?: FormEvent<HTMLFormElement>) => {
          event?.preventDefault();
          onSubmit();
        },
        showPass,
        togglePasswordVisibility: () => setShowPass((currentValue) => !currentValue),
      }}
    />
  );
}

describe("LoginFormPanel", () => {
  beforeEach(() => { flags.securityQuestionsEnabled = true; });
  it("link de recuperação é acessível mesmo sem Router", () => {
    render(<TestHost />);
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute("href", "/recuperar-senha");
  });
  it("link navega para rota pública quando dentro do Router", () => {
    render(<MemoryRouter initialEntries={["/login"]}><Routes><Route path="/login" element={<TestHost />} /><Route path="/recuperar-senha" element={<div>Recuperação</div>} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole("link", { name: "Esqueci minha senha" }));
    expect(screen.getByText("Recuperação")).toBeInTheDocument();
  });
  it("flag desligada oculta link", () => {
    flags.securityQuestionsEnabled = false;
    const view = render(<TestHost />);
    expect(screen.queryByRole("link", { name: "Esqueci minha senha" })).not.toBeInTheDocument();
    view.unmount(); flags.securityQuestionsEnabled = true;
  });
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