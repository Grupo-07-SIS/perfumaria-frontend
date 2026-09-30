import { onlyDigits } from "./digits";

function applyDigitPattern(digits: string, pattern: string) {
  let formatted = "";
  let digitIndex = 0;
  for (const token of pattern) {
    if (digitIndex >= digits.length) break;
    formatted += token === "#" ? digits[digitIndex++] : token;
  }
  return formatted;
}

export function onlyDigitsMax(value: string, maxDigits: number) {
  return onlyDigits(value).slice(0, maxDigits);
}

export function formatCnpj(value: string) {
  return applyDigitPattern(onlyDigitsMax(value, 14), "##.###.###/####-##");
}

export function formatTelefone(value: string) {
  const digits = onlyDigitsMax(value, 11);
  return applyDigitPattern(digits, digits.length > 10 ? "(##) #####-####" : "(##) ####-####");
}

export function formatCep(value: string) {
  return applyDigitPattern(onlyDigitsMax(value, 8), "#####-###");
}
