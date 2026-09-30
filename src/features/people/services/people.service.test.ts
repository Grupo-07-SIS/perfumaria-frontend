import { describe, expect, it } from "vitest";
import { buildSearchParams, selectPeople, validateCliente, validateFornecedor } from "./people.service";

const endereco = { logradouro: "", numero: "", cep: "", bairro: "", cidade: "", uf: "" };

describe("people.service", () => {
  it("monta params de busca omitindo texto vazio", () => {
    expect(buildSearchParams("Frascos")).toEqual({ busca: "Frascos" });
    expect(buildSearchParams("")).toEqual({});
  });

  it("filtra clientes por status sem refiltrar localmente os resultados remotos", () => {
    const ativo = { id: 1, nome: "Ana", email: "", telefone: "1", endereco, totalPedidos: 0, ativo: true };
    const inativo = { ...ativo, id: 2, nome: "Bruno", ativo: false };
    const fornecedor = { id: 3, razaoSocial: "Frascos", cnpj: "", email: "f@x.test", telefone: "", endereco, totalCompras: 0 };

    const result = selectPeople({ clientes: [ativo, inativo], fornecedores: [fornecedor], funcionarios: [], statusFiltro: "ativos" });

    expect(result.filtClientes).toEqual([ativo]);
    expect(result.filtFornecedores).toEqual([fornecedor]);
  });

  describe("validateFornecedor", () => {
    const valido = { razaoSocial: "Essencias Ltda", cnpj: "12.345.678/0001-90", email: "contato@essencias.com" };

    it("aceita CNPJ com ou sem mascara e e-mail valido", () => {
      expect(validateFornecedor(valido)).toEqual({});
      expect(validateFornecedor({ ...valido, cnpj: "12345678000190" })).toEqual({});
    });

    it("exige campos obrigatorios", () => {
      expect(validateFornecedor({ razaoSocial: " ", cnpj: "", email: "" })).toEqual({
        razaoSocial: "Obrigatório.",
        cnpj: "Obrigatório.",
        email: "Obrigatório.",
      });
    });

    it.each(["31873921378", "123456780001901", "12.345.678/0001-9"])("rejeita CNPJ sem 14 digitos: %s", cnpj => {
      expect(validateFornecedor({ ...valido, cnpj })).toEqual({ cnpj: "O CNPJ deve conter 14 dígitos." });
    });

    it.each(["teste@perfumaria,com", "teste@perfumaria", "teste perfumaria@x.com", "@perfumaria.com"])("rejeita e-mail invalido: %s", email => {
      expect(validateFornecedor({ ...valido, email })).toEqual({ email: "Informe um e-mail válido." });
    });

    it("aceita telefone e CEP vazios porque sao opcionais", () => {
      expect(validateFornecedor({ ...valido, telefone: "", endereco: { ...endereco, cep: "" } })).toEqual({});
    });

    it.each(["(11) 3333-4444", "(11) 99164-3000"])("aceita telefone com DDD: %s", telefone => {
      expect(validateFornecedor({ ...valido, telefone })).toEqual({});
    });

    it.each(["(11) 9916", "119"])("rejeita telefone incompleto: %s", telefone => {
      expect(validateFornecedor({ ...valido, telefone })).toEqual({ telefone: "Informe DDD + número (10 ou 11 dígitos)." });
    });

    it("rejeita CEP incompleto", () => {
      expect(validateFornecedor({ ...valido, endereco: { ...endereco, cep: "01001-00" } })).toEqual({ cep: "O CEP deve conter 8 dígitos." });
    });
  });

  describe("validateCliente", () => {
    const valido = { nome: "Ana", telefone: "(11) 99999-0000", email: "", endereco };

    it("aceita telefone com DDD e e-mail vazio porque ele e opcional", () => {
      expect(validateCliente(valido)).toEqual({});
      expect(validateCliente({ ...valido, telefone: "1133334444", email: "ana@perfumaria.com" })).toEqual({});
    });

    it("exige nome e telefone", () => {
      expect(validateCliente({ ...valido, nome: " ", telefone: "" })).toEqual({ nome: "Obrigatório.", telefone: "Obrigatório." });
    });

    it.each(["(11) 9999", "119"])("rejeita telefone incompleto: %s", telefone => {
      expect(validateCliente({ ...valido, telefone })).toEqual({ telefone: "Informe DDD + número (10 ou 11 dígitos)." });
    });

    it("rejeita e-mail informado em formato invalido", () => {
      expect(validateCliente({ ...valido, email: "ana@perfumaria,com" })).toEqual({ email: "Informe um e-mail válido." });
    });
    it("valida o CEP informado no endereco do cliente", () => {
      expect(validateCliente({ nome: "Ana", telefone: "11999990000", endereco: { ...endereco, cep: "0100" } }))
        .toEqual({ cep: "O CEP deve conter 8 dígitos." });
      expect(validateCliente({ nome: "Ana", telefone: "11999990000", endereco: { ...endereco, cep: "01001-000" } }))
        .toEqual({});
    });
  });
});
