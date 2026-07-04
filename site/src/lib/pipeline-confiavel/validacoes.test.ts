import { describe, expect, it } from "vitest";

import {
  alertaPrescricaoConsumo,
  centavosParaReais,
  cpfValido,
  dataNaoFutura,
  moedaParaCentavos,
  nomeCompletoValido,
} from "@/lib/pipeline-confiavel/validacoes";

describe("pipeline-confiavel/validacoes", () => {
  it("aceita CPF válido e rejeita inválido", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224725")).toBe(true);
    expect(cpfValido("111.111.111-11")).toBe(false);
    expect(cpfValido("123")).toBe(false);
  });

  it("rejeita data futura e aceita data passada", () => {
    const agora = new Date(2026, 6, 3);
    expect(dataNaoFutura("2026-07-03", agora)).toBe(true);
    expect(dataNaoFutura("2026-07-04", agora)).toBe(false);
    expect(dataNaoFutura("2020-01-15", agora)).toBe(true);
    expect(dataNaoFutura("2020-13-01", agora)).toBe(false);
  });

  it("converte moeda positiva para centavos e rejeita negativo", () => {
    expect(moedaParaCentavos("150,00")).toBe(15000);
    expect(moedaParaCentavos(10.5)).toBe(1050);
    expect(moedaParaCentavos("-1")).toBeNull();
    expect(moedaParaCentavos(0)).toBeNull();
    expect(centavosParaReais(15000)).toBe("150,00");
  });

  it("exige nome completo", () => {
    expect(nomeCompletoValido("Maria Silva")).toBe(true);
    expect(nomeCompletoValido("Maria")).toBe(false);
  });

  it("sinaliza prescrição típica sem bloquear", () => {
    const agora = new Date(2026, 6, 3);
    const antigo = alertaPrescricaoConsumo("2018-01-01", agora);
    expect(antigo.alerta).toBe(true);
    expect(antigo.mensagem).toBeTruthy();
    const recente = alertaPrescricaoConsumo("2024-01-01", agora);
    expect(recente.alerta).toBe(false);
  });
});
