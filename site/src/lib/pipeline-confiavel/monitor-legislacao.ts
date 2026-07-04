import { createHash } from "crypto";

export type SnapshotLegislacao = {
  fonteId: string;
  fonteLabel: string;
  texto: string;
  hashSha256: string;
  capturadoEm: string;
};

export type DiffLegislacao =
  | {
      status: "sem_mudanca";
      fonteId: string;
      fonteLabel: string;
      checadoEm: string;
      mensagemTelegram: string;
    }
  | {
      status: "mudanca_detectada";
      fonteId: string;
      fonteLabel: string;
      checadoEm: string;
      hashAnterior: string;
      hashNovo: string;
      trechoDiffLiteral: string;
      categoriasAfetadas: string[];
      mensagemTelegram: string;
      /** Texto novo para eventual resumo por IA (fora deste módulo). */
      textoNovo: string;
      textoAnterior: string;
    };

export function hashTextoLegislacao(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

export function criarSnapshot(params: {
  fonteId: string;
  fonteLabel: string;
  texto: string;
  capturadoEm?: string;
}): SnapshotLegislacao {
  const texto = params.texto.replace(/\r\n/g, "\n").trim();
  return {
    fonteId: params.fonteId,
    fonteLabel: params.fonteLabel,
    texto,
    hashSha256: hashTextoLegislacao(texto),
    capturadoEm: params.capturadoEm ?? new Date().toISOString(),
  };
}

/**
 * Diff determinístico — IA nunca decide se "mudou".
 * IA só pode resumir depois, se status === mudanca_detectada.
 */
export function compararSnapshotsLegislacao(params: {
  anterior: SnapshotLegislacao;
  atual: SnapshotLegislacao;
  categoriasQueReferenciam?: string[];
  agora?: Date;
}): DiffLegislacao {
  const checadoEm = (params.agora ?? new Date()).toISOString();
  if (params.anterior.fonteId !== params.atual.fonteId) {
    throw new Error("Snapshots de fontes diferentes não podem ser comparados.");
  }

  if (params.anterior.hashSha256 === params.atual.hashSha256) {
    return {
      status: "sem_mudanca",
      fonteId: params.atual.fonteId,
      fonteLabel: params.atual.fonteLabel,
      checadoEm,
      mensagemTelegram: `OK, sem alterações em ${params.atual.fonteLabel}, checado em ${checadoEm}`,
    };
  }

  const trechoDiffLiteral = montarDiffLiteral(
    params.anterior.texto,
    params.atual.texto
  );
  const categorias = params.categoriasQueReferenciam ?? [];

  return {
    status: "mudanca_detectada",
    fonteId: params.atual.fonteId,
    fonteLabel: params.atual.fonteLabel,
    checadoEm,
    hashAnterior: params.anterior.hashSha256,
    hashNovo: params.atual.hashSha256,
    trechoDiffLiteral,
    categoriasAfetadas: categorias,
    textoNovo: params.atual.texto,
    textoAnterior: params.anterior.texto,
    mensagemTelegram: [
      `ALERTA: mudança detectada em ${params.atual.fonteLabel}`,
      `Checado em: ${checadoEm}`,
      `Hash anterior: ${params.anterior.hashSha256.slice(0, 12)}…`,
      `Hash novo: ${params.atual.hashSha256.slice(0, 12)}…`,
      `Categorias que referenciam: ${categorias.join(", ") || "(nenhuma mapeada)"}`,
      `Diff (trecho):`,
      trechoDiffLiteral.slice(0, 1500),
    ].join("\n"),
  };
}

function montarDiffLiteral(anterior: string, atual: string): string {
  const a = anterior.split("\n");
  const b = atual.split("\n");
  const linhas: string[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    const la = a[i];
    const lb = b[i];
    if (la === lb) continue;
    if (la !== undefined && lb === undefined) linhas.push(`- ${la}`);
    else if (la === undefined && lb !== undefined) linhas.push(`+ ${lb}`);
    else {
      linhas.push(`- ${la}`);
      linhas.push(`+ ${lb}`);
    }
  }
  return linhas.length > 0 ? linhas.join("\n") : "(conteúdo alterado sem linhas isoláveis)";
}

/** Fontes iniciais do monitor (Módulo 5). */
export const FONTES_MONITOR_INICIAL = [
  {
    id: "planalto_cdc",
    label: "Planalto — CDC (Lei 8.078/1990)",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8078.htm",
    categorias: [
      "negativacao_indevida",
      "cobranca_indevida",
      "cancelamento_nao_efetivado",
      "produto_defeito_atraso",
    ],
  },
  {
    id: "stj_sumulas",
    label: "STJ — Súmulas",
    url: "https://scon.stj.jus.br/SCON/sumstj/",
    categorias: ["negativacao_indevida", "score_credito"],
  },
] as const;
