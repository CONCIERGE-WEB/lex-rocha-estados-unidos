#!/usr/bin/env node
/**
 * Frontend smoke test: GETs the public routes against a running server and
 * checks HTTP status + that the HTML contains an expected marker string.
 * Catches build/render regressions before opening the site in Chrome.
 *
 * Usage: BASE_URL=http://localhost:3010 node scripts/smoke-frontend.mjs
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3010";

/** @type {{path:string, expect:number, contains?:string}[]} */
const ROUTES = [
  { path: "/", expect: 200, contains: "Consumer rights" },
  { path: "/report-sample", expect: 200, contains: "report" },
  { path: "/terms", expect: 200, contains: "Not a law firm" },
  { path: "/privacy", expect: 200, contains: "Privacy" },
  { path: "/contact", expect: 200, contains: "question" },
  { path: "/partners", expect: 200, contains: "attorneys" },
  { path: "/track", expect: 200, contains: "Track" },
  { path: "/cookies", expect: 200 },
  { path: "/checkout?plano=padrao", expect: 200, contains: "Confirm your order" },
  { path: "/request", expect: 200 },
  { path: "/checkout", expect: 307 }, // no plan -> redirect to /#planos
];

let failures = 0;
console.log(`\n=== Frontend smoke test ===\nBASE_URL=${BASE_URL}\n`);

for (const r of ROUTES) {
  const t0 = Date.now();
  let status = 0;
  let bodyOk = true;
  let note = "";
  try {
    const res = await fetch(`${BASE_URL}${r.path}`, { redirect: "manual" });
    status = res.status;
    if (r.contains && status === 200) {
      const html = await res.text();
      bodyOk = html.includes(r.contains);
      if (!bodyOk) note = `missing "${r.contains}"`;
    }
  } catch (e) {
    note = `net: ${e instanceof Error ? e.message : String(e)}`;
  }
  const statusOk = status === r.expect;
  const pass = statusOk && bodyOk && !note.startsWith("net");
  if (!pass) failures++;
  console.log(
    `  [${pass ? "OK " : "ERR"}] ${r.path.padEnd(26)} ${status} (want ${r.expect}) ${Date.now() - t0}ms` +
      (note ? `  -> ${note}` : "")
  );
}

console.log(`\n${failures === 0 ? "All routes rendered OK. ✅" : `${failures} route(s) failed. ❌`}`);
process.exitCode = failures === 0 ? 0 : 1;
