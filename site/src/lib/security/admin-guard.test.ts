import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  adminAutenticado,
  emailAdminDaRequest,
  emailAutorizado,
} from "@/lib/security/admin-guard";
import { COOKIE_ADMIN, criarTokenSessao } from "@/lib/security/session-token";

const SECRET = "admin-secret-de-teste-1234";

function requestComToken(token: string): Request {
  return new Request("https://lexrocha.com.br/admin", {
    headers: { cookie: `${COOKIE_ADMIN}=${encodeURIComponent(token)}` },
  });
}

describe("admin-guard", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = SECRET;
    process.env.ADMIN_EMAIL = "contato@lexrocha.com.br,tiago@lexrocha.com.br";
  });

  afterEach(() => {
    delete process.env.ADMIN_SECRET;
    delete process.env.ADMIN_EMAIL;
  });

  it("reconhece e-mail na allowlist (case-insensitive)", () => {
    expect(emailAutorizado("Contato@LexRocha.com.br")).toBe(true);
    expect(emailAutorizado("invasor@gmail.com")).toBe(false);
  });

  it("autentica request com token válido de admin autorizado", async () => {
    const token = await criarTokenSessao("contato@lexrocha.com.br", SECRET);
    const req = requestComToken(token);
    expect(await adminAutenticado(req)).toBe(true);
    expect(await emailAdminDaRequest(req)).toBe("contato@lexrocha.com.br");
  });

  it("nega token válido de e-mail fora da allowlist", async () => {
    const token = await criarTokenSessao("removido@lexrocha.com.br", SECRET);
    const req = requestComToken(token);
    expect(await adminAutenticado(req)).toBe(false);
    expect(await emailAdminDaRequest(req)).toBeNull();
  });

  it("nega token assinado com outro secret", async () => {
    const token = await criarTokenSessao("contato@lexrocha.com.br", "secret-falso-1234567");
    const req = requestComToken(token);
    expect(await adminAutenticado(req)).toBe(false);
  });

  it("nega request sem cookie", async () => {
    const req = new Request("https://lexrocha.com.br/admin");
    expect(await adminAutenticado(req)).toBe(false);
  });

  it("nega quando ADMIN_SECRET não está configurado", async () => {
    const token = await criarTokenSessao("contato@lexrocha.com.br", SECRET);
    delete process.env.ADMIN_SECRET;
    expect(await adminAutenticado(requestComToken(token))).toBe(false);
  });
});
