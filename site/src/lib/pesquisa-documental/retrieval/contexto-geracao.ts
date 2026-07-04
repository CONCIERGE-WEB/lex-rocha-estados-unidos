import type { PacotePesquisaDocumental } from "@/lib/pesquisa-documental/retrieval/schemas";

export function montarBlocoPacoteParaClaude(pacote: PacotePesquisaDocumental): string {
  const linhas: string[] = [
    "=== PACOTE DE PESQUISA VALIDADO (use SOMENTE estas fontes; não invente URL nem decisão) ===",
    `Montado em: ${pacote.montadoEm}`,
    "",
    "--- PLANO RESOLVIDO POR REGRA (não altere valores) ---",
  ];

  if (pacote.plano.tipo === "sem_cobranca") {
    linhas.push("Sem precedente comparável documentado → sem cobrança (R$ 0).");
  } else {
    linhas.push(
      `Faixa: ${pacote.plano.label} (R$ ${pacote.plano.valor}) · ${pacote.plano.qtdPrecedentes} precedente(s) · ${pacote.plano.qtdFundamentos} fundamento(s).`
    );
  }

  linhas.push("", "--- PRECEDENTES (cite apenas estas URLs) ---");
  if (pacote.precedentes.length === 0) {
    linhas.push("(Nenhum precedente comparável no pacote.)");
  } else {
    pacote.precedentes.forEach((p, i) => {
      linhas.push(`${i + 1}. URL: ${p.url}`);
      linhas.push(`   Resumo do operador: ${p.resumoOperador}`);
      if (p.consultadoEm) linhas.push(`   Consultado em: ${p.consultadoEm}`);
      if (p.trechoFonte) {
        linhas.push(`   Trecho da fonte (não extrapole além disto): ${p.trechoFonte.slice(0, 2000)}`);
      }
      linhas.push("");
    });
  }

  linhas.push("--- LEGISLAÇÃO FEDERAL (referência) ---");
  pacote.legislacao.forEach((l) => {
    linhas.push(`• ${l.artigoRef} — ${l.titulo}`);
    linhas.push(`  URL: ${l.url}`);
    if (l.consultadoEm) linhas.push(`  Consultado em: ${l.consultadoEm}`);
    if (l.trechoFonte) {
      linhas.push(`  Trecho: ${l.trechoFonte.slice(0, 1500)}`);
    }
  });

  linhas.push(
    "",
    "REGRAS: não citar URL fora desta lista; não prever resultado; não recomendar ação processual."
  );

  return linhas.join("\n");
}
