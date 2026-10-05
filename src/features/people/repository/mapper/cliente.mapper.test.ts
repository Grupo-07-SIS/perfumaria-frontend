import { describe, expect, it } from "vitest";
import { toClienteModel, toClienteRequestDto } from "./cliente.mapper";

const endereco = {
  logradouro: "Rua das Flores",
  numero: "42",
  complemento: "Apto 7",
  cep: "01001-000",
  bairro: "Centro",
  cidade: "Sao Paulo",
  uf: "SP",
};

describe("clienteMapper", () => {
  it("mapeia status numerico e total de pedidos da resposta", () => {
    expect(toClienteModel({
      id: 17,
      nome: "Ana Lima",
      telefone: "11999990000",
      email: "ana@example.test",
      endereco,
      status: 0,
      totalPedidos: 3,
    })).toEqual({
      id: 17,
      nome: "Ana Lima",
      telefone: "11999990000",
      email: "ana@example.test",
      endereco,
      ativo: false,
      totalPedidos: 3,
    });
  });

  it("gera somente o payload aceito pelo OpenAPI", () => {
    expect(toClienteRequestDto({
      nome: "Ana Lima",
      telefone: "11999990000",
      email: "ana@example.test",
      endereco,
    })).toEqual({
      nome: "Ana Lima",
      telefone: "11999990000",
      email: "ana@example.test",
      endereco,
    });
  });

  it("envia o telefone somente com digitos", () => {
    expect(toClienteRequestDto({
      nome: "Ana Lima",
      telefone: "(11) 99999-0000",
      email: "ana@example.test",
      endereco,
    }).telefone).toBe("11999990000");
  });
});