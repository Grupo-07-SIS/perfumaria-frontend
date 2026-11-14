import { afterEach, describe, expect, it, vi } from "vitest";
import { getSecurityQuestionsStatus } from "./security-questions-status.service";
afterEach(() => vi.unstubAllGlobals());
describe("Status confirmado pelo backend", () => {
  it.each([0, 1, 2, 3])("transporta quantidade %s e completude explícita", async quantidade => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ quantidade, completo: quantidade === 3 })));
    vi.stubGlobal("fetch", fetchMock);
    expect(await getSecurityQuestionsStatus()).toEqual({ quantidade, completo: quantidade === 3 });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/usuarios\/me\/perguntas-seguranca\/status$/);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include", cache: "no-store" });
  });
  it("não presume completude a partir de quantidade e rejeita DTO incoerente", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ quantidade: 3, completo: false }))).mockResolvedValueOnce(new Response(JSON.stringify({ quantidade: 2, completo: true }))));
    expect(await getSecurityQuestionsStatus()).toEqual({ quantidade: 3, completo: false });
    await expect(getSecurityQuestionsStatus()).rejects.toThrow(/inválido/);
  });
});