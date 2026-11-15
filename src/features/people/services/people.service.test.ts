import { describe, expect, it } from "vitest";
import { buildSearchParams, formatEndereco, peopleErrorMessage, peopleFormErrors, selectPeople, validateCliente, validateFornecedor, validateFuncionario } from "./people.service";
import { STRONG_PASSWORD_MESSAGE } from "../../../shared/utils/password";

const endereco = { logradouro: "", numero: "", cep: "", bairro: "", cidade: "", uf: "" };

describe("people.service", () => {
  it.each([null, undefined, {}])("formata endereco ausente sem interromper a tela: %s", value => {
    expect(formatEndereco(value)).toBe("—");
  });

  it("preserva os campos disponiveis de enderecos parciais e completos", () => {
    expect(formatEndereco({ cidade: "São Paulo", uf: "SP" })).toBe("São Paulo/SP");
    expect(formatEndereco({ logradouro: "Rua das Flores", numero: "10", complemento: "Casa", bairro: "Centro", cidade: "São Paulo", uf: "SP", cep: "01001-000" }))
      .toBe("Rua das Flores, nº 10, Casa, Centro, São Paulo/SP, CEP 01001-000");
  });

  it("mapeia validação remota para os campos e ignora campos desconhecidos", () => {
    const error = Object.assign(new Error("PEOPLE_SUPPLIERS_CREATE_FAILED:400"), { status: 400, fields: { nome: "Nome inválido", "endereco.cep": "CEP inválido", interno: "SQL" } });
    expect(peopleFormErrors(error, "Falha", { nome: "razaoSocial" })).toEqual({ razaoSocial: "Nome inválido", cep: "CEP inválido" });
  });

  it("mantém conflitos concorrentes genéricos e erros de servidor fora dos campos", () => {
    expect(peopleFormErrors(new Error("PEOPLE_CLIENTS_CREATE_FAILED:409|Já existe um cadastro com esses dados. Confira e-mail e telefone."), "Falha")).toHaveProperty("form");
    expect(peopleFormErrors({ isAxiosError: true, response: { status: 500, data: { fields: { email: "SQL" } } } }, "Falha")).toEqual({ form: "O servidor está temporariamente indisponível. Tente novamente em instantes." });
  });
  it("traduz conflito de telefone sem confundir com e-mail", () => {
    expect(peopleErrorMessage({ isAxiosError: true, response: { status: 409, data: { message: "Telefone já cadastrado" } } }, "Falha")).toBe("Este telefone já está cadastrado. Informe outro telefone.");
  });
  it("traduz conflito de e-mail do funcionário para orientação no campo", () => {
    expect(peopleErrorMessage(new Error("PEOPLE_EMPLOYEES_CREATE_FAILED:409"), "Falha ao salvar.")).toBe(
      "Este e-mail já está cadastrado. Informe outro e-mail."
    );
  });

  it.each([
    ["PEOPLE_CLIENTS_CREATE_FAILED:400", "Confira os dados informados e corrija os campos destacados."],
    ["PEOPLE_CLIENTS_CREATE_FAILED:401", "Sua sessão expirou. Entre novamente para continuar."],
    ["PEOPLE_CLIENTS_CREATE_FAILED:403", "Você não tem permissão para realizar esta operação."],
    ["PEOPLE_CLIENTS_CREATE_FAILED:404", "O registro não foi encontrado. Atualize a lista e tente novamente."],
    ["PEOPLE_CLIENTS_CREATE_FAILED:503", "O servidor está temporariamente indisponível. Tente novamente em instantes."],
  ])("não mostra código HTTP para %s", (technicalError, expected) => {
    expect(peopleErrorMessage(new Error(technicalError), "Falha ao salvar.")).toBe(expected);
  });

  it("preserva detalhe de validação fornecido pelo backend", () => {
    expect(peopleErrorMessage(new Error("PEOPLE_CLIENTS_CREATE_FAILED:400|Telefone inválido"), "Falha ao salvar.")).toBe("Telefone inválido");
  });

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

    it("rejeita nome, e-mail e endereço acima dos limites da API", () => {
      expect(validateFornecedor({
        ...valido,
        razaoSocial: "x".repeat(46),
        email: `${"x".repeat(36)}@example.test`,
        endereco: { ...endereco, logradouro: "x".repeat(46) },
      })).toEqual({
        razaoSocial: "Máximo de 45 caracteres.",
        email: "Máximo de 45 caracteres.",
        logradouro: "Máximo de 45 caracteres.",
      });
    });
  });

  describe("validateCliente", () => {
    const valido = { nome: "Ana", telefone: "(11) 99999-0000", email: "ana@example.test", endereco };

    it("aceita telefone com DDD e e-mail valido", () => {
      expect(validateCliente(valido)).toEqual({});
      expect(validateCliente({ ...valido, telefone: "1133334444", email: "ana@perfumaria.com" })).toEqual({});
    });

    it.each(["", "   ", undefined])("exige e-mail do cliente: %s", email => {
      expect(validateCliente({ ...valido, email })).toEqual({ email: "Informe o e-mail do cliente." });
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
      expect(validateCliente({ ...valido, endereco: { ...endereco, cep: "0100" } }))
        .toEqual({ cep: "O CEP deve conter 8 dígitos." });
      expect(validateCliente({ ...valido, endereco: { ...endereco, cep: "01001-000" } }))
        .toEqual({});
    });

    it("rejeita nome, e-mail e endereço acima dos limites da API", () => {
      expect(validateCliente({
        ...valido,
        nome: "x".repeat(46),
        email: `${"x".repeat(90)}@example.test`,
        endereco: { ...endereco, cidade: "x".repeat(46) },
      })).toEqual({
        nome: "Máximo de 45 caracteres.",
        email: "Máximo de 100 caracteres.",
        cidade: "Máximo de 45 caracteres.",
      });
    });
  });

  describe("validateFuncionario", () => {
    const valid = { nome: "Ana", email: "ana@example.test", senha: "SenhaForte12!", confirmSenha: "SenhaForte12!", isNew: true };

    it("aceita senha forte e edição sem alterar a senha", () => {
      expect(validateFuncionario(valid)).toEqual({});
      expect(validateFuncionario({ ...valid, isNew: false, senha: "", confirmSenha: "" })).toEqual({});
    });

    it.each(["12345", "abc"])("rejeita senha curta: %s", senha => {
      expect(validateFuncionario({ ...valid, senha, confirmSenha: senha })).toEqual({ senha: STRONG_PASSWORD_MESSAGE });
    });

    it.each(["123456", "abcdef"])("aceita senha com seis caracteres: %s", senha => {
      expect(validateFuncionario({ ...valid, senha, confirmSenha: senha })).toEqual({});
    });

    it("rejeita campos acima dos limites da API", () => {
      const oversizedPassword = "x".repeat(101);
      expect(validateFuncionario({ ...valid, nome: "x".repeat(46), email: `${"x".repeat(34)}@example.test`, senha: oversizedPassword, confirmSenha: oversizedPassword })).toEqual({
        nome: "Máximo de 45 caracteres.",
        email: "Máximo de 45 caracteres.",
        senha: STRONG_PASSWORD_MESSAGE,
      });
    });
  });
});
