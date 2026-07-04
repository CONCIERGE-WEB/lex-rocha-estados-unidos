import { describe, expect, it } from "vitest";

import {
  COOKIE_ADMIN,
  criarTokenSessao,
  extrairTokenCookie,
  validarTokenSessao,
  type SessionPayload,
} from "@/lib/security/session-token";

const SECRET = "test-admin-secret-16chars";

describe("session-token", () => {
  it("cria e valida token assinado", async () => {
    const token = await criarTokenSessao("contato@lexrocha.com.br", SECRET);
    const payload = await validarTokenSessao(token, SECRET);
    expect(payload?.sub).toBe("contato@lexrocha.com.br");
    expect(payload?.exp).toBeGreaterThan(Date.now());
  });

  it("rejeita token assinado com outro secret", async () => {
    const token = await criarTokenSessao("admin@lexrocha.com.br", SECRET);
    expect(await validarTokenSessao(token, "outro-secret-diferente")).toBeNull();
  });

  it("rejeita token com assinatura adulterada", async () => {
    const token = await criarTokenSessao("admin@lexrocha.com.br", SECRET);
    const adulterado = token.slice(0, -4) + "XXXX";
    expect(await validarTokenSessao(adulterado, SECRET)).toBeNull();
  });

  it("rejeita token expirado", async () => {
    const iat = Date.now() - 60_000;
    const payload: SessionPayload = { sub: "x", iat, exp: iat + 1000 };
    const body = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const token = `${body}.assinatura-falsa`;
    expect(await validarTokenSessao(token, SECRET)).toBeNull();
  });

  it("extrai cookie de sessão do header", () => {
    const header = `outro=1; ${COOKIE_ADMIN}=abc.def; foo=bar`;
    expect(extrairTokenCookie(header)).toBe("abc.def");
    expect(extrairTokenCookie(null)).toBeNull();
  });
});
