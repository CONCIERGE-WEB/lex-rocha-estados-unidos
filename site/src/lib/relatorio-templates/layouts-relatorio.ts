/**
 * Structural layouts for Essential / Standard / Premium (consumer).
 * Structure copy only — no invented citations.
 * Folder: report-templates/layouts/consumer-{essential|standard|premium}.md
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export type FaixaLayoutConsumidor = "essential" | "standard" | "premium";

const FAIXAS: FaixaLayoutConsumidor[] = ["essential", "standard", "premium"];

/** Map plan ids (essencial/padrao/completo) → layout stem. */
export function faixaLayoutDePlano(
  planoId: string | null | undefined
): FaixaLayoutConsumidor {
  switch ((planoId || "").toLowerCase()) {
    case "essencial":
    case "essential":
      return "essential";
    case "premium":
    case "completo":
    case "complete":
      return "premium";
    default:
      return "standard";
  }
}

export function arquivoLayoutRelatorio(faixa: FaixaLayoutConsumidor): string {
  return `consumer-${faixa}.md`;
}

export function carregarLayoutRelatorio(
  faixa: FaixaLayoutConsumidor | null,
  cwd = process.cwd()
): string | null {
  const f = faixa && FAIXAS.includes(faixa) ? faixa : "standard";
  const path = join(cwd, "report-templates", "layouts", arquivoLayoutRelatorio(f));
  if (!existsSync(path)) return null;
  try {
    const txt = readFileSync(path, "utf8").trim();
    return txt.length > 0 ? txt : null;
  } catch {
    return null;
  }
}

export const LAYOUTS_RELATORIO_ESPERADOS: ReadonlyArray<FaixaLayoutConsumidor> = [
  "essential",
  "standard",
  "premium",
];
