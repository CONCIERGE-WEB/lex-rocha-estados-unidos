import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const key = env.GROQ_API_KEY;
const model = env.GROQ_MODEL || "openai/gpt-oss-120b";
console.log("Key present:", Boolean(key), "| Model:", model);

const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [{ role: "user", content: "Reply with the single word: OK" }],
    max_tokens: 5,
  }),
});

console.log("HTTP status:", res.status);
const txt = await res.text();
console.log("Body:", txt.slice(0, 500));
