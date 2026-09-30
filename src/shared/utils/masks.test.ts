import { describe, expect, it } from "vitest";
import { formatCep, formatCnpj, formatTelefone, onlyDigitsMax } from "./masks";

describe("masks", () => {
  it.each([
    ["", ""],
    ["12", "12"],
    ["123", "12.3"],
    ["12345678", "12.345.678"],
    ["123456780001", "12.345.678/0001"],
    ["12345678000190", "12.345.678/0001-90"],
    ["12.345.678/0001-90999", "12.345.678/0001-90"],
    ["12a345b678", "12.345.678"],
  ])("formata CNPJ %s como %s", (value, expected) => {
    expect(formatCnpj(value)).toBe(expected);
  });

  it.each([
    ["", ""],
    ["11", "(11"],
    ["119", "(11) 9"],
    ["1133334444", "(11) 3333-4444"],
    ["11991643000", "(11) 99164-3000"],
    ["119916430009", "(11) 99164-3000"],
    ["(11) 3333-4444", "(11) 3333-4444"],
  ])("formata telefone %s como %s", (value, expected) => {
    expect(formatTelefone(value)).toBe(expected);
  });

  it.each([
    ["", ""],
    ["01001", "01001"],
    ["010010", "01001-0"],
    ["01001000", "01001-000"],
    ["01001-0009", "01001-000"],
  ])("formata CEP %s como %s", (value, expected) => {
    expect(formatCep(value)).toBe(expected);
  });

  it("mantem apenas digitos ate o limite informado", () => {
    expect(onlyDigitsMax("12a3-45678", 6)).toBe("123456");
  });
});
