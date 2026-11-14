import { afterEach, describe, expect, it, vi } from "vitest";
import { securityQuestionsRepository } from "./security-questions.repository";
import { securityQuestionsService } from "../services/security-questions.service";
import { securityErrorMessage, SecurityHttpError } from "../../../core/services/security-http";

afterEach(() => vi.unstubAllGlobals());
describe("Contrato autenticado das perguntas", () => {
  it("GET retorna array; PUT exige CSRF dinâmico, credentials include e aceita 204", async () => {
    const questions = [1, 2, 3].map(ordem => ({ ordem, pergunta: `Pergunta ${ordem}`, resposta: "não pode aparecer" }));
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(questions))).mockResolvedValueOnce(new Response(JSON.stringify({ token: "csrf-test", headerName: "X-CUSTOM-CSRF" }))).mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const loaded = await securityQuestionsService.load();
    expect(loaded[0]).not.toHaveProperty("resposta");
    await securityQuestionsService.save({ senhaAtual: " password ", perguntas: [1, 2, 3].map(ordem => ({ ordem, pergunta: ` Pergunta ${ordem} `, resposta: " João, Silva. " })) });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/usuarios\/me\/perguntas-seguranca$/);
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/auth\/csrf$/);
    for (const call of fetchMock.mock.calls) expect(call[1]).toMatchObject({ credentials: "include", cache: "no-store" });
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: "PUT", headers: { "Content-Type": "application/json", "X-CUSTOM-CSRF": "csrf-test" } });
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ senhaAtual: " password ", perguntas: [1, 2, 3].map(ordem => ({ ordem, pergunta: `Pergunta ${ordem}`, resposta: " João, Silva. " })) });
  });
  it("não envia perguntas duplicadas depois do trim", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    await expect(securityQuestionsService.save({ senhaAtual: "password", perguntas: [1, 2, 3].map(ordem => ({ ordem, pergunta: ordem === 1 ? " mesma " : "mesma", resposta: "exata" })) })).rejects.toThrow(/diferentes/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["message", "mensagem"])("lê ErrorResponseDTO.%s e Retry-After sem inventar prazo", async field => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ [field]: "Aguarde." }), { status: 429, headers: { "Retry-After": "28800" } })));
    try { await securityQuestionsRepository.list(); throw new Error("Expected rejection"); }
    catch (error) {
      expect(error).toBeInstanceOf(SecurityHttpError);
      expect(securityErrorMessage(error)).toContain("28800 segundos");
      expect(securityErrorMessage(error)).toContain("8 horas");
    }
  });
});