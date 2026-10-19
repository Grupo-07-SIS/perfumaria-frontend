import { beforeEach, describe, expect, it, vi } from "vitest";

const { createFuncionarioMock, deleteFuncionarioMock, listFuncionariosMock, updateFuncionarioMock } = vi.hoisted(() => ({
  createFuncionarioMock: vi.fn(),
  deleteFuncionarioMock: vi.fn(),
  listFuncionariosMock: vi.fn(),
  updateFuncionarioMock: vi.fn(),
}));

vi.mock("../repository/funcionarios.repository", () => ({
  funcionariosRepository: {
    createFuncionario: createFuncionarioMock,
    deleteFuncionario: deleteFuncionarioMock,
    listFuncionarios: listFuncionariosMock,
    updateFuncionario: updateFuncionarioMock,
  },
}));

import { createFuncionario, fetchFuncionarios, removeFuncionario, updateFuncionario } from "./funcionarios.service";

const uuid = "9ec76c44-24b2-4f23-bfb6-461548173bdd";
const values = {
  nome: "Beatriz Oliveira",
  email: "beatriz@example.test",
  cargo: "Funcionário" as const,
  senha: "senha-segura",
};
const response = {
  id: uuid,
  nome: values.nome,
  email: values.email,
  fkTipoUsuario: 2,
  tipoUsuarioNome: "Funcionário",
};
const model = { id: uuid, nome: values.nome, email: values.email, cargo: "Funcionário" as const, donoOrganizacao: false };

describe("funcionariosService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mapeia a listagem mantendo UUID e cargo", async () => {
    listFuncionariosMock.mockResolvedValue([response]);
    await expect(fetchFuncionarios()).resolves.toEqual([model]);
  });

  it("encaminha busca e status para a listagem remota", async () => {
    listFuncionariosMock.mockResolvedValue([response]);

    await expect(fetchFuncionarios({ busca: "Beatriz", status: 1 })).resolves.toEqual([model]);
    expect(listFuncionariosMock).toHaveBeenCalledWith({ busca: "Beatriz", status: 1 });
  });

  it("mapeia criacao e atualizacao com os IDs de tipo de usuario", async () => {
    createFuncionarioMock.mockResolvedValue(response);
    updateFuncionarioMock.mockResolvedValue({
      ...response,
      nome: "Admin Revisado",
      fkTipoUsuario: 1,
      tipoUsuarioNome: "Administrador",
    });

    await expect(createFuncionario(values)).resolves.toEqual(model);
    await expect(updateFuncionario(model, {
      nome: "Admin Revisado",
      email: values.email,
      cargo: "Administrador",
      senha: "",
    })).resolves.toEqual({ ...model, nome: "Admin Revisado", cargo: "Administrador" });

    expect(createFuncionarioMock).toHaveBeenCalledWith({
      nome: values.nome,
      email: values.email,
      senha: values.senha,
      fkTipoUsuario: 2,
    });
    expect(updateFuncionarioMock).toHaveBeenCalledWith(uuid, {
      nome: "Admin Revisado",
      email: values.email,
      fkTipoUsuario: 1,
    });
  });

  it("exclui o funcionario e retorna seu UUID", async () => {
    deleteFuncionarioMock.mockResolvedValue(undefined);
    await expect(removeFuncionario(model)).resolves.toBe(uuid);
    expect(deleteFuncionarioMock).toHaveBeenCalledWith(uuid);
  });
});