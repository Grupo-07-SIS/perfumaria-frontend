import { describe, expect, it } from "vitest";
import { toLoginUserDto } from "./login-user.mapper";

describe("toLoginUserDto", () => {
  it("maps a Funcionario to the login repository dto", () => {
    expect(
      toLoginUserDto({
        cargo: "Administrador",
        email: "admin@canalperfumado.com.br",
        id: 1,
        nome: "Admin",
        senha: "admin123",
      }),
    ).toEqual({
      cargo: "Administrador",
      email: "admin@canalperfumado.com.br",
      id: 1,
      nome: "Admin",
      senha: "admin123",
    });
  });
});