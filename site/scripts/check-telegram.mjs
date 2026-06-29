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

const token = env.TELEGRAM_BOT_TOKEN;
const chatId = env.TELEGRAM_CHAT_ID;
console.log("Token present:", Boolean(token), "| Chat ID present:", Boolean(chatId));

if (!token) {
  console.error("No TELEGRAM_BOT_TOKEN — aborting.");
  process.exit(1);
}

// 1) Validate the bot token / identity
const me = await fetch(`https://api.telegram.org/bot${token}/getMe`);
const meJson = await me.json();
console.log("\n[getMe] HTTP", me.status);
console.log(JSON.stringify(meJson, null, 2).slice(0, 500));

// 2) Send a real test message to the configured chat (end-to-end check)
if (chatId && meJson.ok) {
  const text =
    "✅ Judicial Intelligence — Telegram test\nThis is an automated connectivity check. If you can read this, alerts are working.";
  const send = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  const sendJson = await send.json();
  console.log("\n[sendMessage] HTTP", send.status, "ok:", sendJson.ok);
  if (!sendJson.ok) console.log("Error:", JSON.stringify(sendJson).slice(0, 300));
  else console.log("Delivered message id:", sendJson.result?.message_id);
}
