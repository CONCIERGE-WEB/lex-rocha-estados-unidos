import { describe, expect, it } from "vitest";

import {
  checklistRevisaoCompleto,
  estadoChecklistRevisaoInicial,
  itensChecklistPendentes,
} from "@/lib/pesquisa-documental/checklist-revisao";

describe("checklist-revisao", () => {
  it("inicia incompleto", () => {
    const e = estadoChecklistRevisaoInicial();
    expect(checklistRevisaoCompleto(e)).toBe(false);
    expect(itensChecklistPendentes(e).length).toBe(5);
  });

  it("completo quando todos marcados", () => {
    const e = estadoChecklistRevisaoInicial();
    for (const k of Object.keys(e) as (keyof typeof e)[]) {
      e[k] = true;
    }
    expect(checklistRevisaoCompleto(e)).toBe(true);
    expect(itensChecklistPendentes(e)).toEqual([]);
  });
});
