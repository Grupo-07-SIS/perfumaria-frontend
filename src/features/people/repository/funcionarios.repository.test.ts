import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiClientDeleteMock, apiClientGetMock, apiClientPostMock, apiClientPutMock } = vi.hoisted(() => ({
  apiClientDeleteMock: vi.fn(),
  apiClientGetMock: vi.fn(),
  apiClientPostMock: vi.fn(),
  apiClientPutMock: vi.fn(),
}));

vi.mock("../../../core/services/http-client", () => ({
  apiClient: {
    delete: apiClientDeleteMock,
    get: apiClientGetMock,
    post: apiClientPostMock,
    put: apiClientPutMock,
  },
}));

import { funcionariosRepository } from "./funcionarios.repository";

const uuid = "9ec76c44-24b2-4f23-bfb6-461548173bdd";
const payload = {
  nome: "Beatriz Oliveira",
  email: "beatriz@example.test",
  senha: "senha-segura",
  fkTipoUsuario: 2,
};
const response = {
  id: uuid,
  nome: payload.nome,
  email: payload.email,
  fkTipoUsuario: 2,
  tipoUsuarioNome: "Funcionário",
};

function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe("funcionariosRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista funcionarios sem enviar params", async () => {
    apiClientGetMock.mockResolvedValue({ data: [response] });

    await expect(funcionariosRepository.listFuncionarios()).resolves.toEqual([response]);
    expect(apiClientGetMock).toHaveBeenCalledWith("/funcionarios");
  });

  it("envia busca e status como query params quando informados", async () => {
    apiClientGetMock.mockResolvedValue({ data: [response] });

    await funcionariosRepository.listFuncionarios({ busca: "Beatriz", status: 1 });

    expect(apiClientGetMock).toHaveBeenCalledWith("/funcionarios", {
      params: { busca: "Beatriz", status: 1 },
    });
  });

  it("cria, atualiza e exclui usando UUID e o payload OpenAPI", async () => {
    const updatePayload = { nome: "Beatriz Revisada", email: payload.email, fkTipoUsuario: 1 };
    apiClientPostMock.mockResolvedValue({ data: response });
    apiClientPutMock.mockResolvedValue({
      data: { ...response, nome: updatePayload.nome, fkTipoUsuario: 1, tipoUsuarioNome: "Administrador" },
    });
    apiClientDeleteMock.mockResolvedValue({ data: undefined });

    await expect(funcionariosRepository.createFuncionario(payload)).resolves.toEqual(response);
    await expect(funcionariosRepository.updateFuncionario(uuid, updatePayload)).resolves.toMatchObject(updatePayload);
    await expect(funcionariosRepository.deleteFuncionario(uuid)).resolves.toBeUndefined();

    expect(apiClientPostMock).toHaveBeenCalledWith("/funcionarios", payload);
    expect(apiClientPutMock).toHaveBeenCalledWith(`/funcionarios/${uuid}`, updatePayload);
    expect(apiClientDeleteMock).toHaveBeenCalledWith(`/funcionarios/${uuid}`);
  });

  it.each([
    ["list", "PEOPLE_EMPLOYEES_LIST_FAILED", () => funcionariosRepository.listFuncionarios(), apiClientGetMock],
    ["create", "PEOPLE_EMPLOYEES_CREATE_FAILED", () => funcionariosRepository.createFuncionario(payload), apiClientPostMock],
    ["update", "PEOPLE_EMPLOYEES_UPDATE_FAILED", () => funcionariosRepository.updateFuncionario(uuid, payload), apiClientPutMock],
    ["delete", "PEOPLE_EMPLOYEES_DELETE_FAILED", () => funcionariosRepository.deleteFuncionario(uuid), apiClientDeleteMock],
  ])("preserva operacao e status no erro de %s", async (_operation, code, request, requestMock) => {
    requestMock.mockRejectedValueOnce(axiosError(503));
    await expect(request()).rejects.toThrow(`${code}:503`);
  });
});