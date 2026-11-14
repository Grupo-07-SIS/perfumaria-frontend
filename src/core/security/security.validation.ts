export const EXACT_ANSWER_NOTICE = "As respostas devem ser digitadas exatamente como foram cadastradas, incluindo letras maiúsculas/minúsculas, espaços, acentos, pontos e vírgulas.";

export const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;
export const questionValidation = (value: string): true | string => {
  const length = Array.from(value.trim()).length;
  return length >= 1 && length <= 255 || "A pergunta deve ter entre 1 e 255 caracteres, sem contar espaços externos.";
};
export const answerValidation = (value: string): true | string =>
  (/\S/u.test(value) && utf8Bytes(value) >= 1 && utf8Bytes(value) <= 1024) || "Informe uma resposta não branca de até 1024 bytes UTF-8.";
export const passwordValidation = (value: string): true | string =>
  (utf8Bytes(value) >= 8 && utf8Bytes(value) <= 72) || "A senha deve ter de 8 a 72 bytes UTF-8 (acentos podem ocupar mais de um byte).";
export const currentPasswordValidation = (value: string): true | string =>
  (value.length > 0 && utf8Bytes(value) <= 72) || "Informe a senha atual da conta, com até 72 bytes UTF-8.";

export function assertThreeOrders(values: { ordem: number }[]) {
  if (values.length !== 3 || new Set(values.map(value => value.ordem)).size !== 3 || values.some(value => ![1, 2, 3].includes(value.ordem))) {
    throw new Error("São obrigatórias exatamente três perguntas, nas ordens 1, 2 e 3.");
  }
}