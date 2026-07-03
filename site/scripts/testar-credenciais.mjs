/**
 * Testa credenciais em .env.local — não commitar resultados.
 * Uso: node scripts/testar-credenciais.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  const env = {};
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const results = [];

function ok(name, detail) {
  results.push({ name, status: "OK", detail });
}
function warn(name, detail) {
  results.push({ name, status: "AVISO", detail });
}
function fail(name, detail) {
  results.push({ name, status: "FALHA", detail });
}

async function testStripe() {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) return fail("Stripe secret", "STRIPE_SECRET_KEY ausente");
  const mode = key.startsWith("sk_test_") ? "test" : key.startsWith("sk_live_") ? "live" : "?";
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    if (!res.ok) return fail("Stripe API", `${res.status} ${data.error?.message ?? JSON.stringify(data)}`);
    ok("Stripe API", `modo ${mode}, conta autenticada`);
  } catch (e) {
    fail("Stripe API", e.message);
  }

  const pk = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  if (pk && pk.startsWith(mode === "test" ? "pk_test_" : "pk_live_")) {
    ok("Stripe publishable", `par com secret (${mode})`);
  } else if (pk) {
    warn("Stripe publishable", "prefixo pk pode não corresponder ao secret key");
  }

  const wh = env.STRIPE_WEBHOOK_SECRET;
  if (!wh) warn("Stripe webhook secret", "ausente — pagamentos confirmados não chegam ao site");
  else if (!wh.startsWith("whsec_")) fail("Stripe webhook secret", "formato inválido");
  else ok("Stripe webhook secret", "formato whsec_ presente (validação real só com evento Stripe)");

  for (const [nome, url] of [
    ["Link Essencial", env.STRIPE_LINK_ESSENCIAL],
    ["Link Padrão", env.STRIPE_LINK_PADRAO],
    ["Link Completo", env.STRIPE_LINK_COMPLETO],
  ]) {
    if (!url) {
      warn(nome, "URL ausente");
      continue;
    }
    try {
      const r = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (r.ok || r.status === 405) ok(nome, `HTTP ${r.status}`);
      else warn(nome, `HTTP ${r.status}`);
    } catch (e) {
      fail(nome, e.message);
    }
  }
}

async function testSupabase() {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) return fail("Supabase URL", "ausente");
  if (!service) return fail("Supabase service role", "ausente");

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: service, Authorization: `Bearer ${service}` },
    });
    if (res.status === 200 || res.status === 404) ok("Supabase service role", `ligação REST (${res.status})`);
    else {
      const t = await res.text();
      fail("Supabase service role", `${res.status} ${t.slice(0, 120)}`);
    }
  } catch (e) {
    const code = e.cause?.code ?? e.code;
    const msg = code === "ENOTFOUND"
      ? `domínio não existe — confirme Project URL no dashboard (ENOTFOUND)`
      : e.message;
    fail("Supabase service role", msg);
  }

  if (anon) {
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      });
      if (res.status === 200 || res.status === 404) ok("Supabase anon key", `ligação REST (${res.status})`);
      else fail("Supabase anon key", `HTTP ${res.status}`);
    } catch (e) {
      fail("Supabase anon key", e.message);
    }
  }

  const tables = ["pedidos_pendentes", "checkout_intent", "operador_config"];
  for (const table of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=count&limit=1`, {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
          Prefer: "count=exact",
        },
      });
      if (res.ok) ok(`Supabase tabela ${table}`, "acessível");
      else if (res.status === 404) warn(`Supabase tabela ${table}`, "não existe — executar schema SQL");
      else fail(`Supabase tabela ${table}`, `HTTP ${res.status}`);
    } catch (e) {
      fail(`Supabase tabela ${table}`, e.message);
    }
  }
}

async function testTelegram() {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chat = env.TELEGRAM_CHAT_ID;
  if (!token) return fail("Telegram", "TELEGRAM_BOT_TOKEN ausente");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    if (!data.ok) return fail("Telegram bot", data.description ?? "getMe falhou");
    ok("Telegram bot", `@${data.result.username}`);
    if (env.TELEGRAM_BOT_USERNAME && data.result.username !== env.TELEGRAM_BOT_USERNAME.replace("@", "")) {
      warn("Telegram username env", `env=${env.TELEGRAM_BOT_USERNAME} bot=@${data.result.username}`);
    }
  } catch (e) {
    fail("Telegram bot", e.message);
  }
  if (!chat) warn("Telegram chat", "TELEGRAM_CHAT_ID ausente");
  else ok("Telegram chat ID", "configurado (não enviamos teste automático)");
}

async function testGroq() {
  const key = env.GROQ_API_KEY;
  if (!key) return warn("Groq", "GROQ_API_KEY ausente");
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    if (!res.ok) return fail("Groq API", data.error?.message ?? res.status);
    const model = env.GROQ_MODEL ?? "openai/gpt-oss-120b";
    const has = data.data?.some((m) => m.id === model);
    if (has) ok("Groq API", `modelo ${model} disponível`);
    else warn("Groq API", `autenticado mas modelo ${model} não listado`);
  } catch (e) {
    fail("Groq API", e.message);
  }
}

async function testResend() {
  const key = env.RESEND_API_KEY;
  if (!key) return warn("Resend", "RESEND_API_KEY ausente");
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.status === 200) ok("Resend API", "chave válida");
    else if (res.status === 401) fail("Resend API", "chave inválida");
    else ok("Resend API", `HTTP ${res.status} (chave aceite)`);
  } catch (e) {
    fail("Resend API", e.message);
  }
  if (!env.RESEND_FROM_EMAIL) warn("Resend from", "RESEND_FROM_EMAIL ausente");
  else ok("Resend from", env.RESEND_FROM_EMAIL.replace(/<.*>/, "[email]"));
}

function testWhatsApp() {
  const n = env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!n || n.length < 9) fail("WhatsApp número", "NEXT_PUBLIC_WHATSAPP_NUMBER inválido");
  else ok("WhatsApp número", `+${n}`);

  const url = env.NEXT_PUBLIC_WHATSAPP_URL;
  if (!url?.includes("wa.me")) fail("WhatsApp URL", "NEXT_PUBLIC_WHATSAPP_URL inválida");
  else {
    const decoded = decodeURIComponent(url.split("text=")[1] ?? "");
    const ptPt = /gostava de saber|Agradeço|dúvida antes de avançar/i.test(decoded);
    ok("WhatsApp URL", ptPt ? "wa.me + mensagem pt-PT" : "wa.me configurado");
  }
}

function testGoogleOAuth() {
  const id = env.GOOGLE_OAUTH_CLIENT_ID;
  const secret = env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!id || !secret) return warn("Google OAuth", "credenciais incompletas");
  const idOk = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i.test(id);
  const secOk = /^GOCSPX-/.test(secret);
  if (idOk && secOk) ok("Google OAuth", "formato válido (login só testável no browser)");
  else fail("Google OAuth", "formato inválido");
}

function testAdmin() {
  const s = env.ADMIN_SECRET;
  if (!s || s.length < 16) warn("ADMIN_SECRET", "ausente ou curto (<16)");
  else ok("ADMIN_SECRET", "presente");
  if (env.ADMIN_EMAIL) ok("ADMIN_EMAIL", `${env.ADMIN_EMAIL.split(",").length} email(s)`);
}

async function testProducao() {
  const base = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.direitosconsumidor.com";
  const paths = ["/", "/contacto", "/api/agenda"];
  for (const p of paths) {
    try {
      const r = await fetch(`${base}${p}`, { method: p.startsWith("/api") ? "GET" : "GET" });
      if (r.ok) ok(`Produção ${p}`, `HTTP ${r.status}`);
      else warn(`Produção ${p}`, `HTTP ${r.status}`);
    } catch (e) {
      fail(`Produção ${p}`, e.message);
    }
  }
}

await testStripe();
await testSupabase();
await testTelegram();
await testGroq();
await testResend();
testWhatsApp();
testGoogleOAuth();
testAdmin();
await testProducao();

console.log("\n=== TESTE DE CREDENCIAIS (.env.local) ===\n");
for (const r of results) {
  const icon = r.status === "OK" ? "✓" : r.status === "AVISO" ? "!" : "✗";
  console.log(`${icon} [${r.status}] ${r.name}: ${r.detail}`);
}
const fails = results.filter((r) => r.status === "FALHA").length;
const warns = results.filter((r) => r.status === "AVISO").length;
console.log(`\nTotal: ${results.length} | Falhas: ${fails} | Avisos: ${warns}`);
process.exit(fails > 0 ? 1 : 0);
