import { describe, expect, it } from "vitest";

import type { GoogleOAuthConfig } from "@/lib/security/config";
import {
  emailVerificado,
  urlAutorizacaoGoogle,
  validarIdTokenAdmin,
  type GoogleIdTokenInfo,
} from "@/lib/security/google-oauth";

const CFG: GoogleOAuthConfig = {
  clientId: "908981096323-abc.apps.googleusercontent.com",
  clientSecret: "GOCSPX-test",
  redirectUri: "http://localhost:3000/api/admin/auth/google/callback",
};

describe("google-oauth", () => {
  it("monta URL de autorização com parâmetros obrigatórios", () => {
    const url = urlAutorizacaoGoogle(CFG, "state-xyz");
    expect(url).toContain("accounts.google.com");
    expect(url).toContain(encodeURIComponent(CFG.clientId));
    expect(url).toContain(encodeURIComponent(CFG.redirectUri));
    expect(url).toContain("state=state-xyz");
    expect(url).toContain("scope=openid");
  });

  it("aceita id_token de email autorizado e verificado", () => {
    const info: GoogleIdTokenInfo = {
      aud: CFG.clientId,
      email: "Contato@LexRocha.com.br",
      email_verified: true,
      exp: String(Math.floor(Date.now() / 1000) + 3600),
      sub: "123",
    };
    const r = validarIdTokenAdmin(info, CFG.clientId, ["contato@lexrocha.com.br"]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.email).toBe("contato@lexrocha.com.br");
  });

  it("rejeita audience inválida", () => {
    const info: GoogleIdTokenInfo = {
      aud: "outro-client-id",
      email: "contato@lexrocha.com.br",
      email_verified: true,
      exp: String(Math.floor(Date.now() / 1000) + 3600),
      sub: "123",
    };
    const r = validarIdTokenAdmin(info, CFG.clientId, ["contato@lexrocha.com.br"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("audience inválida");
  });

  it("rejeita email não autorizado", () => {
    const info: GoogleIdTokenInfo = {
      aud: CFG.clientId,
      email: "outro@gmail.com",
      email_verified: true,
      exp: String(Math.floor(Date.now() / 1000) + 3600),
      sub: "123",
    };
    const r = validarIdTokenAdmin(info, CFG.clientId, ["admin@lexrocha.com.br"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("email não autorizado");
  });

  it("rejeita email não verificado", () => {
    const info: GoogleIdTokenInfo = {
      aud: CFG.clientId,
      email: "admin@lexrocha.com.br",
      email_verified: false,
      exp: String(Math.floor(Date.now() / 1000) + 3600),
      sub: "123",
    };
    const r = validarIdTokenAdmin(info, CFG.clientId, ["admin@lexrocha.com.br"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("email não verificado");
  });

  it("rejeita token expirado", () => {
    const info: GoogleIdTokenInfo = {
      aud: CFG.clientId,
      email: "admin@lexrocha.com.br",
      email_verified: true,
      exp: String(Math.floor(Date.now() / 1000) - 10),
      sub: "123",
    };
    const r = validarIdTokenAdmin(info, CFG.clientId, ["admin@lexrocha.com.br"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe("token expirado");
  });

  it("detecta email verificado em string ou boolean", () => {
    expect(emailVerificado({ email_verified: true } as GoogleIdTokenInfo)).toBe(true);
    expect(emailVerificado({ email_verified: "true" } as GoogleIdTokenInfo)).toBe(true);
    expect(emailVerificado({ email_verified: false } as GoogleIdTokenInfo)).toBe(false);
  });
});
