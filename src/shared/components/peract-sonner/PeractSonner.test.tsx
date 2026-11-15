import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { actionToast } from "../../services/action-toast";
import { PeractToaster } from "./PeractSonner";

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
});

afterEach(() => {
  toast.dismiss();
  cleanup();
  vi.unstubAllGlobals();
});

describe("toasts de ações", () => {
  it.each([
    ["success", "Perfume cadastrado com sucesso!", "Verifique-o na lista de perfumes."],
    ["error", "Falha ao cadastrar", "Tente novamente mais tarde"],
  ] as const)("renderiza %s com ícone e cores semânticas", async (type, title, description) => {
    render(<PeractToaster />);
    act(() => actionToast[type](title, description));
    const heading = await screen.findByText(title);
    const notification = heading.closest("[data-sonner-toast]");
    expect(notification).toHaveAttribute("data-type", type);
    expect(notification).toHaveAttribute("data-rich-colors", "true");
    expect(notification?.querySelector(`[data-toast-icon="${type}"]`)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar notificação" })).toBeInTheDocument();
  });
});