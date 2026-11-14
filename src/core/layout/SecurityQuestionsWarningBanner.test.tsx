import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
const { useAppMock } = vi.hoisted(() => ({ useAppMock: vi.fn() }));
vi.mock("../../app/context/AppContext", () => ({ useApp: useAppMock }));
import { SecurityQuestionsWarningBanner } from "./SecurityQuestionsWarningBanner";

beforeEach(() => vi.clearAllMocks());
describe("Aviso amarelo persistente", () => {
  it("CTA, Escape e clique externo não fecham; apenas X fecha", () => {
    const dismiss = vi.fn();
    useAppMock.mockReturnValue({ securityQuestions: { warningVisible: true, complete: false }, dismissSecurityQuestionsWarning: dismiss });
    render(<MemoryRouter><SecurityQuestionsWarningBanner /><div>Fora</div></MemoryRouter>);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(screen.getByText("Fora"));
    fireEvent.click(screen.getByRole("link", { name: "Cadastrar perguntas de segurança" }));
    expect(dismiss).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Segurança da conta")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar aviso de segurança" }));
    expect(dismiss).toHaveBeenCalledOnce();
  });
  it("completo atualiza texto, mas permanece enquanto visível", () => {
    useAppMock.mockReturnValue({ securityQuestions: { warningVisible: true, complete: true }, dismissSecurityQuestionsWarning: vi.fn() });
    render(<MemoryRouter><SecurityQuestionsWarningBanner /></MemoryRouter>);
    expect(screen.getByText(/Perguntas cadastradas/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar aviso de segurança" })).toBeInTheDocument();
  });
});