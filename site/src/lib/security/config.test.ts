import { describe, expect, it } from "vitest";

import {
  auditarConfigSeguranca,
  emailsAdminPermitidos,
  googleOAuthConfigurado,
  validarFormatoClientId,
  validarFormatoClientSecret,
  validarAdminSecret,
} from "@/lib/security/config";

describe("config segurança", () => {
  it("valida formato client id Google", () => {
    expect(validarFormatoClientId("908981096323-abc.apps.googleusercontent.com")).toBe(true);
    expect(validarFormatoClientId("invalido")).toBe(false);
  });

  it("valida formato client secret Google", () => {
    expect(validarFormatoClientSecret("GOCSPX-abc123_XYZ")).toBe(true);
    expect(validarFormatoClientSecret("secret-errado")).toBe(false);
  });

  it("exige ADMIN_SECRET com comprimento mínimo", () => {
    expect(validarAdminSecret("curto")).toBe(false);
    expect(validarAdminSecret("palavra-passe-forte-ok")).toBe(true);
  });

  it("parseia lista de emails admin", () => {
    expect(emailsAdminPermitidos("A@x.com, b@y.com")).toEqual(["a@x.com", "b@y.com"]);
    expect(
      emailsAdminPermitidos("contato@lexrocha.com.br,tiago@lexrocha.com.br")
    ).toEqual(["contato@lexrocha.com.br", "tiago@lexrocha.com.br"]);
    expect(emailsAdminPermitidos("")).toEqual([]);
  });

  it("auditoria detecta env incompleto", () => {
    const issues = auditarConfigSeguranca({});
    expect(issues.some((i) => i.campo === "ADMIN_SECRET")).toBe(true);
    expect(issues.some((i) => i.campo === "ADMIN_EMAIL")).toBe(true);
  });

  it("auditoria aceita env mínimo válido", () => {
    const issues = auditarConfigSeguranca({
      ADMIN_SECRET: "palavra-passe-forte-ok",
      ADMIN_EMAIL: "admin@lexrocha.com.br",
      GOOGLE_OAUTH_CLIENT_ID: "908981096323-abc.apps.googleusercontent.com",
      GOOGLE_OAUTH_CLIENT_SECRET: "GOCSPX-teste123",
    });
    expect(issues).toHaveLength(0);
    expect(googleOAuthConfigurado).toBeTypeOf("function");
  });

  it("auditoria sinaliza OAuth com formato inválido", () => {
    const issues = auditarConfigSeguranca({
      ADMIN_SECRET: "palavra-passe-forte-ok",
      ADMIN_EMAIL: "admin@lexrocha.com.br",
      GOOGLE_OAUTH_CLIENT_ID: "errado",
      GOOGLE_OAUTH_CLIENT_SECRET: "tambem-errado",
    });
    expect(issues.some((i) => i.campo === "GOOGLE_OAUTH_CLIENT_ID")).toBe(true);
    expect(issues.some((i) => i.campo === "GOOGLE_OAUTH_CLIENT_SECRET")).toBe(true);
  });
});
