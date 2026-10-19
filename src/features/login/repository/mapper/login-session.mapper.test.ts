import { describe, expect, it } from "vitest";
import { toAuthenticatedUser } from "./login-session.mapper";

describe("toAuthenticatedUser", () => {
  it("maps an admin backend response to the frontend authenticated user model", () => {
    expect(
      toAuthenticatedUser({
        accessToken: "token-123",
        expiresIn: 3600,
        tokenType: "Bearer",
        usuario: {
          email: "admin@canalperfumado.com.br",
          id: "uuid-1",
          idOrganizacao: 7,
          nome: "Admin",
          tipoUsuario: "ADMIN",
          donoOrganizacao: true,
        },
      }),
    ).toEqual({
      cargo: "Administrador",
      donoOrganizacao: true,
      email: "admin@canalperfumado.com.br",
      id: "uuid-1",
      idOrganizacao: 7,
      nome: "Admin",
    });
  });

  it("maps non-admin backend roles to funcionário", () => {
    expect(
      toAuthenticatedUser({
        accessToken: "token-123",
        expiresIn: 3600,
        tokenType: "Bearer",
        usuario: {
          email: "beatriz@canalperfumado.com.br",
          id: "uuid-2",
          nome: "Beatriz",
          tipoUsuario: "FUNCIONARIO",
        },
      }),
    ).toEqual({
      cargo: "Funcionário",
      donoOrganizacao: false,
      email: "beatriz@canalperfumado.com.br",
      id: "uuid-2",
      nome: "Beatriz",
    });
  });
});