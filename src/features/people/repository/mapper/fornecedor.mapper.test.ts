import { describe, expect, it } from "vitest";
import { toFornecedorModel, toFornecedorRequestDto } from "./fornecedor.mapper";

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
});