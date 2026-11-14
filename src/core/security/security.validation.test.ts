import { describe, expect, it } from "vitest";
import { answerValidation, passwordValidation, questionValidation } from "./security.validation";
import { toUpdateQuestionsDTO } from "../../features/settings/repository/mapper/security-questions.mapper";

describe("Segurança — Specification by Example", () => {
  it.each([" João, Silva. ", "joão", "Joao", "e\u0301", "é", "x".repeat(100)])("preserva resposta exata %s", (resposta) => {
    const dto = toUpdateQuestionsDTO({ senhaAtual: " password ", perguntas: [1, 2, 3].map(ordem => ({ ordem, pergunta: ` Pergunta ${ordem} `, resposta })) });
    expect(dto.perguntas[0]).toEqual({ ordem: 1, pergunta: "Pergunta 1", resposta });
    expect(dto.senhaAtual).toBe(" password ");
  });
  it.each(["", " \t\n", "é".repeat(513)])("rejeita resposta branca ou acima de 1024 bytes", value => expect(answerValidation(value)).not.toBe(true));
  it("permite 1024 bytes e respostas acima do limite BCrypt", () => expect(answerValidation("é".repeat(512))).toBe(true));
  it.each(["1234567", "é".repeat(37)])("valida senha em bytes UTF-8", value => expect(passwordValidation(value)).not.toBe(true));
  it("aceita os limites de senha sem normalização", () => {
    expect(passwordValidation("é".repeat(4))).toBe(true);
    expect(passwordValidation("x".repeat(72))).toBe(true);
  });
  it("valida perguntas depois do trim", () => {
    expect(questionValidation("  pergunta  ")).toBe(true);
    expect(questionValidation("   ")).not.toBe(true);
    expect(questionValidation("x".repeat(256))).not.toBe(true);
  });
});