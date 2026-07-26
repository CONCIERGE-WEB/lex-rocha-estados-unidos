import { describe, expect, it } from "vitest";

import { mapCourtListenerSearchResult } from "@/lib/fontes-us/courtlistener";
import {
  carregarCorpusGranted,
  formatarCorpusMarkdown,
  hitsParaItensCorpus,
  resolverCorpusComFallbackFederal,
} from "@/lib/fontes-us/corpus-loader";
import { elaborarRelatorioRascunho } from "@/lib/relatorio-templates/elaborar-relatorio";

describe("fontes-us/courtlistener mapper", () => {
  it("maps a valid search hit", () => {
    const hit = mapCourtListenerSearchResult({
      caseName: "Smith v. Equifax",
      absolute_url: "/opinion/123/smith-v-equifax/",
      dateFiled: "2020-01-15",
      court_id: "cand",
      cluster_id: 123,
      snippet: "FCRA <em>damages</em>",
    });
    expect(hit).not.toBeNull();
    expect(hit?.case_name).toBe("Smith v. Equifax");
    expect(hit?.absolute_url).toContain("courtlistener.com");
    expect(hit?.snippet).toBe("FCRA damages");
  });

  it("rejects rows without case name or url", () => {
    expect(mapCourtListenerSearchResult({ caseName: "X" })).toBeNull();
    expect(
      mapCourtListenerSearchResult({ absolute_url: "/opinion/1/" })
    ).toBeNull();
  });
});

describe("fontes-us/corpus-loader", () => {
  it("loads seeded empty FCRA/US cell", () => {
    const c = carregarCorpusGranted("fcra_credit_reporting", "US");
    expect(c).not.toBeNull();
    expect(c?.status).toBe("aguardando_corpus");
    expect(c?.itens).toEqual([]);
  });

  it("resolver documents empty cell without inventing", () => {
    const r = resolverCorpusComFallbackFederal("fcra_credit_reporting", "WY");
    expect(r.corpus?.itens.length ?? 0).toBe(0);
    expect(r.notaFallback || r.corpus?.status).toBeTruthy();
  });

  it("hitsParaItensCorpus preserves CourtListener urls", () => {
    const itens = hitsParaItensCorpus(
      [
        {
          cluster_id: 1,
          case_name: "A v. B",
          absolute_url: "https://www.courtlistener.com/opinion/1/a-v-b/",
          date_filed: "2021-02-02",
          court_id: "scotus",
          snippet: null,
          citation: "1 U.S. 1",
        },
      ],
      "US"
    );
    expect(itens).toHaveLength(1);
    expect(itens[0]?.source).toBe("courtlistener");
    expect(formatarCorpusMarkdown({ ...carregarCorpusGranted("fcra_credit_reporting", "US")!, itens, total: 1, status: "parcial" })).toContain(
      "A v. B"
    );
  });
});

describe("elaborar-relatorio + corpus", () => {
  it("includes awaiting-corpus note for empty cell", () => {
    const out = elaborarRelatorioRascunho({
      plano: "essencial",
      categoria: "fcra_credit_reporting",
      state: "US",
      nomeCliente: "Jane Doe",
    });
    expect(out.layoutCarregado).toBe(true);
    expect(out.corpusStatus).toBe("aguardando_corpus");
    expect(out.markdown).toMatch(/Practical Results/i);
    expect(out.markdown).toMatch(/aguardando|awaiting|no invented/i);
  });
});
