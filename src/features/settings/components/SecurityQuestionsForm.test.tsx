import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { load, save, useAppMock } = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn(), useAppMock: vi.fn() }));
vi.mock("../services/security-questions.service", () => ({ securityQuestionsService: { load, save } }));
vi.mock("../../../core/store/AppContext", () => ({ useApp: useAppMock }));
import { SecurityQuestionsForm } from "./SecurityQuestionsForm";

beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue([1, 2, 3].map(ordem => ({ ordem, pergunta: `Pergunta ${ordem}`, resposta: "NUNCA EXIBIR" })));
  save.mockResolvedValue(undefined);
  useAppMock.mockReturnValue({ currentUser: { id: "a" }, refreshSecurityQuestionsStatus: vi.fn().mockResolvedValue(undefined), markSecurityQuestionsComplete: vi.fn(), invalidateAuthSession: vi.fn() });
});
describe("Cadastro de exatamente três pares", () => {
  it("pré-carrega somente perguntas, exige senha atual e limpa segredos após salvar", async () => {
    render(<SecurityQuestionsForm />);
    await waitFor(() => expect(screen.getByLabelText(/^Pergunta 1/, { selector: "input" })).toHaveValue("Pergunta 1"));
    for (const ordem of [1, 2, 3]) {
      const answer = screen.getByLabelText(new RegExp(`^Resposta ${ordem}`), { selector: "input" });
      expect(answer).toHaveValue(""); expect(answer).toHaveAttribute("type", "password");
      fireEvent.change(answer, { target: { value: " João, Silva. " } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Salvar perguntas de segurança" }));
    expect(await screen.findByText(/Informe a senha atual da conta/)).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/^Senha atual para confirmar/, { selector: "input" }), { target: { value: " 1234 " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar perguntas de segurança" }));
    await screen.findByText(/Perguntas de segurança cadastradas/);
    expect(save.mock.calls[0][0].perguntas[0].resposta).toBe(" João, Silva. ");
    expect(save.mock.calls[0][0].senhaAtual).toBe(" 1234 ");
    expect(screen.getByLabelText(/^Resposta 1/, { selector: "input" })).toHaveValue("");
    expect(screen.getByLabelText(/^Senha atual para confirmar/, { selector: "input" })).toHaveValue("");
    expect(useAppMock().markSecurityQuestionsComplete).toHaveBeenCalledOnce();
  });
  it("perguntas iguais depois do trim não são enviadas", async () => {
    render(<SecurityQuestionsForm />);
    await waitFor(() => expect(screen.getByLabelText(/^Pergunta 1/, { selector: "input" })).toHaveValue("Pergunta 1"));
    for (const ordem of [1, 2, 3]) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^Pergunta ${ordem}`), { selector: "input" }), { target: { value: ordem === 1 ? " igual " : "igual" } });
      fireEvent.change(screen.getByLabelText(new RegExp(`^Resposta ${ordem}`), { selector: "input" }), { target: { value: "answer" } });
    }
    fireEvent.change(screen.getByLabelText(/^Senha atual para confirmar/, { selector: "input" }), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar perguntas de segurança" }));
    await waitFor(() => expect(screen.getAllByText("As três perguntas devem ser diferentes.")).toHaveLength(3));
    expect(save).not.toHaveBeenCalled();
  });
});