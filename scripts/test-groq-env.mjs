#!/usr/bin/env node
/**
 * Testa GROQ_API_KEY do .env.local (não imprime o segredo).
 * Uso: node --env-file=.env.local scripts/test-groq-env.mjs
 */

const key = process.env.GROQ_API_KEY?.trim();
if (!key || key.length < 10) {
  console.error("FAIL — GROQ_API_KEY ausente ou inválida em .env.local");
  process.exit(1);
}

console.log(
  `OK — GROQ_API_KEY presente (${key.slice(0, 6)}…${key.slice(-4)}, ${key.length} caracteres)`
);

const model = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    max_tokens: 100,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Classificador de teste Lex Rocha. Responda JSON: {"status":"ok","servico":"lex-rocha"}',
      },
      { role: "user", content: "ping" },
    ],
  }),
});

const body = await response.text();
console.log(`Groq HTTP: ${response.status} · modelo pedido: ${model}`);

if (!response.ok) {
  console.error("FAIL — Groq API:", body.slice(0, 400));
  process.exit(2);
}

const json = JSON.parse(body);
console.log("OK — resposta:", json.choices?.[0]?.message?.content);
console.log(
  "OK — tokens:",
  json.usage?.prompt_tokens,
  "entrada +",
  json.usage?.completion_tokens,
  "saída"
);
