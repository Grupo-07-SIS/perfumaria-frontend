import { afterEach, describe, expect, it, vi } from "vitest";
import { passwordRecoveryService } from "../services/password-recovery.service";

afterEach(() => vi.unstubAllGlobals());
describe("Contrato público de recuperação", () => {
  it("usa somente capability header, credentials omit e respostas/senha exatas", async () => {
    const expiraEm = new Date(Date.now() + 600000).toISOString();
    const perguntas = [1, 2, 3].map(ordem => ({ ordem, pergunta: `Pergunta ${ordem}` }));
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ tokenDesafio: "challenge-test", expiraEm, perguntas }))).mockResolvedValueOnce(new Response(JSON.stringify({ tokenRedefinicao: "reset-test", expiraEm }))).mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const challenge = await passwordRecoveryService.start("user@example.com");
    const respostas = [1, 2, 3].map(ordem => ({ ordem, resposta: " João, Silva. " }));
    const authorization = await passwordRecoveryService.verify(challenge, respostas);
    await passwordRecoveryService.reset(authorization, { novaSenha: " senha nova ", confirmacao: " senha nova " });
    expect(fetchMock.mock.calls.map(call => call[0].split("/").pop())).toEqual(["iniciar", "verificar", "redefinir"]);
    for (const call of fetchMock.mock.calls) {
      expect(call[1]).toMatchObject({ credentials: "omit", method: "POST", cache: "no-store" });
      expect(call[1].headers).not.toHaveProperty("Authorization");
      expect(call[1].headers).not.toHaveProperty("Cookie");
    }
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("X-Recuperacao-Token");
    expect(fetchMock.mock.calls[1][1].headers["X-Recuperacao-Token"]).toBe("challenge-test");
    expect(fetchMock.mock.calls[2][1].headers["X-Recuperacao-Token"]).toBe("reset-test");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ respostas });
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ novaSenha: " senha nova ", confirmacao: " senha nova " });
  });
  it("nega autorização expirada e confirmação diferente antes de enviar", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    await expect(passwordRecoveryService.reset({ token: "test", expiresAt: new Date(0).toISOString() }, { novaSenha: "password", confirmacao: "password" })).rejects.toThrow(/expirou/);
    await expect(passwordRecoveryService.reset({ token: "test", expiresAt: new Date(Date.now() + 60000).toISOString() }, { novaSenha: "password ", confirmacao: "password" })).rejects.toThrow(/coincidem/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});