import { describe, expect, it } from "vitest";
import { toFuncionarioModel, toFuncionarioRequestDto } from "./funcionario.mapper";

const uuid = "9ec76c44-24b2-4f23-bfb6-461548173bdd";

describe("funcionarioMapper", () => {
  it.each([
    [1, "Administrador"],
    [2, "Funcionário"],
  ] as const)("mapeia fkTipoUsuario %s para o cargo %s mantendo o UUID", (fkTipoUsuario, cargo) => {
    expect(toFuncionarioModel({
      id: uuid,
      nome: "Beatriz Oliveira",
      email: "beatriz@example.test",
      fkTipoUsuario,
      tipoUsuarioNome: cargo,
    })).toEqual({
      id: uuid,
      nome: "Beatriz Oliveira",
      email: "beatriz@example.test",
      cargo,
    });
  });

  it("converte cargos para IDs e inclui senha informada", () => {
    expect(toFuncionarioRequestDto({
      nome: "Beatriz Oliveira",
      email: "beatriz@example.test",
      cargo: "Funcionário",
      senha: "senha-segura",
    })).toEqual({
      nome: "Beatriz Oliveira",
      email: "beatriz@example.test",
      senha: "senha-segura",
      fkTipoUsuario: 2,
    });
  });

  it("omite senha vazia na atualização e usa ID 1 para Administrador", () => {
    expect(toFuncionarioRequestDto({
      nome: "Admin Revisado",
      email: "admin@example.test",
      cargo: "Administrador",
      senha: "",
    })).toEqual({
      nome: "Admin Revisado",
      email: "admin@example.test",
      fkTipoUsuario: 1,
    });
  });
});