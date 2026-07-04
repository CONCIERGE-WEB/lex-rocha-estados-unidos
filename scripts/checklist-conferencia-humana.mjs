#!/usr/bin/env node
/**
 * Lista precedentes pendentes de conferência humana (abrir link e confirmar).
 * Uso: node scripts/checklist-conferencia-humana.mjs
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const bancoDir = join(
  process.cwd(),
  "src",
  "lib",
  "pipeline-confiavel",
  "banco"
);

const arquivos = readdirSync(bancoDir).filter((f) => f.endsWith(".json"));
let total = 0;

console.log("=== Checklist conferência humana (não automatizar CONFIRMADO) ===\n");

for (const arq of arquivos) {
  const entrada = JSON.parse(readFileSync(join(bancoDir, arq), "utf8"));
  const pendentes = (entrada.jurisprudencia || []).filter(
    (j) => j.status_verificacao !== "CONFIRMADO" && j.status_verificacao !== "DESCARTADO"
  );
  if (pendentes.length === 0) continue;
  console.log(`## ${entrada.categoria} — citacoes_conferidas=${entrada.citacoes_conferidas}`);
  for (const j of pendentes) {
    total += 1;
    console.log(`\n${total}. [${j.id}] ${j.numero_processo} (${j.tribunal})`);
    console.log(`   Status: ${j.status_verificacao}`);
    console.log(`   Link:   ${j.link_oficial}`);
    console.log(`   Resumo: ${j.resultado_resumido.slice(0, 120)}…`);
    console.log(`   Ação:   Abrir link → conferir número/tribunal/resultado → só então CONFIRMADO`);
    const dicas = {
      jur_001:
        "Súmula 548: 5 dias ÚTEIS (não corridos) após pagamento integral. Fonte scon.stj.jus.br. Opcional: Tema 735 (início da contagem).",
      jur_sum_297: "Súmula 297: CDC aplicável a instituições financeiras (scon.stj.jus.br).",
      jur_tema_929:
        "Tema 929: dobro sem má-fé, salvo engano justificável; modulação pós-30/03/2021.",
      jur_tjdft_2031528: "Sem engano justificável → dobro; dano moral afastado no concreto.",
      jur_tjdft_2021349: "Engano justificável → restituição simples (não em dobro).",
    };
    if (dicas[j.id]) console.log(`   Dica:   ${dicas[j.id]}`);
  }
  console.log("");
}


console.log(`Total pendente: ${total}`);
console.log(
  "\nSó ative citacoes_conferidas=true quando todos os itens da categoria estiverem CONFIRMADO e conferido_por preenchido."
);

