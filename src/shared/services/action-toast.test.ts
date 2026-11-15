import { beforeEach, describe, expect, it, vi } from "vitest";
import { actionToast } from "./action-toast";

const mocks = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast: mocks }));

describe("feedback das ações", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["Perfume cadastrado com sucesso!", "Verifique-o na lista de perfumes."],
    ["Decant cadastrado com sucesso!", "Verifique-o na lista de decants."],
  ])("notifica sucesso com título e descrição: %s", (title, description) => {
    actionToast.success(title, description);
    expect(mocks.success).toHaveBeenCalledWith(title, { description });
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it("usa a orientação padrão para falhas", () => {
    actionToast.error("Falha ao cadastrar");
    expect(mocks.error).toHaveBeenCalledWith("Falha ao cadastrar", {
      description: "Tente novamente mais tarde",
    });
  });

  it("preserva orientações específicas sem expor erros técnicos", () => {
    actionToast.error("Falha ao entrar", "Confira seu e-mail e sua senha.");
    expect(mocks.error).toHaveBeenCalledWith("Falha ao entrar", {
      description: "Confira seu e-mail e sua senha.",
    });
  });
});