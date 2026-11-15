import { describe, expect, it } from "vitest";
import { toFornecedorModel, toFornecedorRequestDto } from "./fornecedor.mapper";
import { EMPTY_ENDERECO } from "../../config/people.config";

const endereco = {
  logradouro: "Rua das Essencias",
  numero: "120",
  complemento: "Galpao 2",
  cep: "01001-000",
  bairro: "Centro",
  cidade: "Sao Paulo",
  uf: "SP",
};

describe("fornecedorMapper", () => {
  it.each([null, undefined, {}, { cidade: "Sao Paulo" }])("normaliza endereco opcional do fornecedor: %s", value => {
    const result = toFornecedorModel({ id: 31, nome: "Essencias Brasil", cnpj: "12345678000190", telefone: "1133334444", email: "contato@example.test", endereco: value });
    expect(result.endereco).toEqual({ ...EMPTY_ENDERECO, ...value });
    expect(result.endereco).not.toBe(EMPTY_ENDERECO);
  });

  it("mapeia nome e endereco do backend para o model visual", () => {
    expect(toFornecedorModel({
      id: 31,
      nome: "Essencias Brasil Ltda",
      cnpj: "12345678000190",
      telefone: "1133334444",
      email: "contato@essencias.test",
      endereco,
      totalCompras: 8,
    })).toEqual({
      id: 31,
      razaoSocial: "Essencias Brasil Ltda",
      cnpj: "12345678000190",
      telefone: "1133334444",
      email: "contato@essencias.test",
      endereco,
      totalCompras: 8,
    });
  });

  it("gera payload com nome e endereco sem fkOrganizacao", () => {
    const request = toFornecedorRequestDto({
      razaoSocial: "Essencias Brasil Ltda",
      cnpj: "12345678000190",
      telefone: "1133334444",
      email: "contato@essencias.test",
      endereco,
    });

    expect(request).toEqual({
      nome: "Essencias Brasil Ltda",
      cnpj: "12345678000190",
      telefone: "1133334444",
      email: "contato@essencias.test",
      endereco,
    });
    expect(request).not.toHaveProperty("fkOrganizacao");
  });

  it("envia CNPJ e telefone somente com digitos como exige o backend", () => {
    const request = toFornecedorRequestDto({
      razaoSocial: "Essencias Brasil Ltda",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 3333-4444",
      email: "contato@essencias.test",
      endereco,
    });

    expect(request.cnpj).toBe("12345678000190");
    expect(request.telefone).toBe("1133334444");
  });
});