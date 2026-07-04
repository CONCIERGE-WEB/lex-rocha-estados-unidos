import { describe, expect, it } from "vitest";

import {
  compararSnapshotsLegislacao,
  criarSnapshot,
  hashTextoLegislacao,
} from "@/lib/pipeline-confiavel/monitor-legislacao";

describe("pipeline-confiavel/monitor-legislacao (Módulo 5)", () => {
  it("detecta sem mudança por hash", () => {
    const a = criarSnapshot({
      fonteId: "planalto_cdc",
      fonteLabel: "CDC",
      texto: "Art. 42 texto oficial",
    });
    const b = criarSnapshot({
      fonteId: "planalto_cdc",
      fonteLabel: "CDC",
      texto: "Art. 42 texto oficial",
    });
    expect(a.hashSha256).toBe(hashTextoLegislacao("Art. 42 texto oficial"));
    const diff = compararSnapshotsLegislacao({ anterior: a, atual: b });
    expect(diff.status).toBe("sem_mudanca");
    if (diff.status === "sem_mudanca") {
      expect(diff.mensagemTelegram).toMatch(/sem alterações/i);
    }
  });

  it("detecta mudança simulada no snapshot", () => {
    const anterior = criarSnapshot({
      fonteId: "planalto_cdc",
      fonteLabel: "CDC",
      texto: "Art. 42 texto oficial\nLinha estável",
    });
    const atual = criarSnapshot({
      fonteId: "planalto_cdc",
      fonteLabel: "CDC",
      texto: "Art. 42 texto oficial ALTERADO\nLinha estável",
    });
    const diff = compararSnapshotsLegislacao({
      anterior,
      atual,
      categoriasQueReferenciam: ["negativacao_indevida"],
    });
    expect(diff.status).toBe("mudanca_detectada");
    if (diff.status === "mudanca_detectada") {
      expect(diff.trechoDiffLiteral).toMatch(/ALTERADO|-/);
      expect(diff.categoriasAfetadas).toContain("negativacao_indevida");
      expect(diff.mensagemTelegram).toMatch(/ALERTA/i);
    }
  });
});
