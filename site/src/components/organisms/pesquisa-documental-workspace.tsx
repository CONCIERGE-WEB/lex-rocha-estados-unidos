"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ChecklistRevisaoCard } from "@/components/molecules/checklist-revisao-card";
import { EstimativaCausaCard } from "@/components/molecules/estimativa-causa-card";
import { PacotePesquisaCard } from "@/components/molecules/pacote-pesquisa-card";
import { TriagemResultadoCard } from "@/components/molecules/triagem-resultado-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FONTES_PESQUISA_PUBLICA,
  NOTA_FONTES_RELATORIO,
} from "@/lib/constants/fontes-publicas";
import {
  AREAS_PROBLEMA,
  AVISO_LEGAL_RELATORIO,
  AVISO_LEGAL_TELA,
  CHAVE_PIX_CNPJ,
  FUNDAMENTOS_OPCOES,
  NOME_SERVICO_PUBLICO,
  NOTA_APROVACAO_CLIENTE,
  PRECIFICACAO,
  PRECIFICACAO_TEXTO_COMPARATIVO,
  formatarNumeroReferencia,
  type FundamentoId,
  type ResultadoTriagem,
} from "@/lib/constants/pesquisa-documental";
import {
  checklistRevisaoCompleto,
  estadoChecklistRevisaoInicial,
  type EstadoChecklistRevisao,
  type ItemChecklistRevisaoId,
} from "@/lib/pesquisa-documental/checklist-revisao";
import {
  AGRAVANTES_OPCOES,
  sugerirValorRelatorioCompleto,
  type AgravanteId,
} from "@/lib/pesquisa-documental/estimativa";
import type { ResumoPacotePesquisa } from "@/lib/pesquisa-documental/resumo-pacote";
import { baixarPdfRelatorio } from "@/lib/pdf/relatorio-pesquisa";

type FormState = {
  referenciaInterna: string;
  area: (typeof AREAS_PROBLEMA)[number];
  fatos: string;
  precedentes: string;
  fundamentos: FundamentoId[];
  agravantes: AgravanteId[];
  observacoes: string;
};

const estadoInicial: FormState = {
  referenciaInterna: "",
  area: AREAS_PROBLEMA[0],
  fatos: "",
  precedentes: "",
  fundamentos: [],
  agravantes: [],
  observacoes: "",
};

export function PesquisaDocumentalWorkspace() {
  const [form, setForm] = useState<FormState>(estadoInicial);
  const [triagem, setTriagem] = useState<ResultadoTriagem | null>(null);
  const [conteudoGerado, setConteudoGerado] = useState<string | null>(null);
  const [modeloIa, setModeloIa] = useState<string | null>(null);
  const [tokensRelatorio, setTokensRelatorio] = useState<{
    entrada?: number;
    saida?: number;
  } | null>(null);
  const [numeroSequencial, setNumeroSequencial] = useState<number | null>(null);
  const [relatorioId, setRelatorioId] = useState<string | null>(null);
  const [codigoAcompanhamento, setCodigoAcompanhamento] = useState<string | null>(null);
  const [previsaoEntrega, setPrevisaoEntrega] = useState<string | null>(null);
  const [classificando, setClassificando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [valorCobrado, setValorCobrado] = useState("");
  const [statusPagamento, setStatusPagamento] = useState<"pendente" | "pago">("pendente");
  const [gerandoLinkStripe, setGerandoLinkStripe] = useState(false);
  const [enriquecerComFetch, setEnriquecerComFetch] = useState(false);
  const [pacoteResumo, setPacoteResumo] = useState<ResumoPacotePesquisa | null>(null);
  const [checklistRevisao, setChecklistRevisao] = useState<EstadoChecklistRevisao>(
    estadoChecklistRevisaoInicial
  );

  const numeroReferencia = useMemo(
    () =>
      numeroSequencial != null ? formatarNumeroReferencia(numeroSequencial) : null,
    [numeroSequencial]
  );

  const valorRelatorioSugerido = useMemo(
    () =>
      sugerirValorRelatorioCompleto({
        precedentes: form.precedentes,
        fundamentosCount: form.fundamentos.length,
        triagem,
      }),
    [form.precedentes, form.fundamentos.length, triagem]
  );

  const valorExibido = useMemo(() => {
    if (pacoteResumo?.plano.tipo === "cobranca") {
      return { valor: pacoteResumo.plano.valor, faixa: pacoteResumo.plano.label };
    }
    if (pacoteResumo?.plano.tipo === "sem_cobranca") {
      return { valor: 0, faixa: pacoteResumo.plano.label };
    }
    return valorRelatorioSugerido;
  }, [pacoteResumo, valorRelatorioSugerido]);

  function atualizarChecklist(id: ItemChecklistRevisaoId, marcado: boolean) {
    setChecklistRevisao((prev) => ({ ...prev, [id]: marcado }));
  }

  function alternarAgravante(id: AgravanteId) {
    setForm((prev) => ({
      ...prev,
      agravantes: prev.agravantes.includes(id)
        ? prev.agravantes.filter((a) => a !== id)
        : [...prev.agravantes, id],
    }));
  }

  function alternarFundamento(id: FundamentoId) {
    setForm((prev) => ({
      ...prev,
      fundamentos: prev.fundamentos.includes(id)
        ? prev.fundamentos.filter((f) => f !== id)
        : [...prev.fundamentos, id],
    }));
  }

  async function handleClassificar() {
    setErro(null);
    setClassificando(true);
    setTriagem(null);
    setConteudoGerado(null);
    setPacoteResumo(null);
    setChecklistRevisao(estadoChecklistRevisaoInicial());

    try {
      const res = await fetch("/api/pesquisa-documental/triagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: form.area, fatos: form.fatos }),
      });
      const json = (await res.json()) as { triagem?: ResultadoTriagem; erro?: string };
      if (!res.ok) throw new Error(json.erro ?? "Falha na classificação.");
      setTriagem(json.triagem ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro na classificação.");
    } finally {
      setClassificando(false);
    }
  }

  async function handleGerarRelatorio() {
    if (!triagem) {
      setErro("Execute a classificação do caso antes de gerar o relatório.");
      return;
    }

    setErro(null);
    setCarregando(true);
    setConteudoGerado(null);
    setPacoteResumo(null);
    setChecklistRevisao(estadoChecklistRevisaoInicial());

    try {
      const res = await fetch("/api/pesquisa-documental/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenciaInterna: form.referenciaInterna || undefined,
          area: form.area,
          fatos: form.fatos,
          precedentes: form.precedentes,
          fundamentos: form.fundamentos,
          observacoes: form.observacoes || undefined,
          triagem,
          enriquecerComFetch,
        }),
      });

      const json = (await res.json()) as {
        conteudoGerado?: string;
        modeloIa?: string;
        tokens?: { entrada?: number; saida?: number };
        pacote?: ResumoPacotePesquisa;
        erro?: string;
        codigo?: string;
      };

      if (!res.ok) throw new Error(json.erro ?? "Falha ao gerar relatório.");

      setConteudoGerado(json.conteudoGerado ?? "");
      setModeloIa(json.modeloIa ?? null);
      setTokensRelatorio(json.tokens ?? null);
      setPacoteResumo(json.pacote ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleSalvar(rascunho = false) {
    if (!triagem) return;
    if (!rascunho && (!conteudoGerado || !modeloIa)) return;
    if (!rascunho && !checklistRevisaoCompleto(checklistRevisao)) {
      setErro("Marque todos os itens do checklist de revisão antes de salvar.");
      return;
    }

    setErro(null);
    setSalvando(true);

    try {
      const res = await fetch("/api/pesquisa-documental/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenciaInterna: form.referenciaInterna || undefined,
          area: form.area,
          fatos: form.fatos,
          precedentes: form.precedentes,
          fundamentos: form.fundamentos,
          observacoes: form.observacoes || undefined,
          triagem,
          conteudoGerado: rascunho ? "(rascunho — relatório não gerado)" : conteudoGerado,
          modeloIa: modeloIa ?? "rascunho",
          tokensEntrada: tokensRelatorio?.entrada,
          tokensSaida: tokensRelatorio?.saida,
          valorCobrado: valorExibido.valor,
          status: rascunho ? "rascunho" : "gerado",
        }),
      });

      const json = (await res.json()) as {
        id?: string;
        numeroSequencial?: number;
        codigoAcompanhamento?: string;
        previsaoEntrega?: string;
        erro?: string;
      };

      if (!res.ok) throw new Error(json.erro ?? "Falha ao salvar.");

      setRelatorioId(json.id ?? null);
      setNumeroSequencial(json.numeroSequencial ?? null);
      setCodigoAcompanhamento(json.codigoAcompanhamento ?? null);
      setPrevisaoEntrega(json.previsaoEntrega ?? null);

      if (!rascunho && conteudoGerado) {
        setValorCobrado(String(valorExibido.valor));
        setModalPagamento(true);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleRegistrarPagamento() {
    if (!relatorioId || !valorCobrado) return;

    setErro(null);
    try {
      const res = await fetch("/api/pesquisa-documental/registrar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatorioId,
          valorCobrado: Number(valorCobrado),
          statusPagamento,
          formaPagamento: "pix",
        }),
      });
      const json = (await res.json()) as { erro?: string };
      if (!res.ok) throw new Error(json.erro ?? "Falha ao registrar pagamento.");
      setModalPagamento(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro no pagamento.");
    }
  }

  async function handleGerarLinkStripe() {
    if (!relatorioId || !valorCobrado) return;

    setErro(null);
    setGerandoLinkStripe(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatorioId,
          valorCobrado: Number(valorCobrado),
        }),
      });
      const json = (await res.json()) as { url?: string; erro?: string };
      if (!res.ok) throw new Error(json.erro ?? "Falha ao gerar link de pagamento.");
      if (json.url) window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro no Stripe.");
    } finally {
      setGerandoLinkStripe(false);
    }
  }

  async function handleSair() {
    await fetch("/api/workspace/auth", { method: "DELETE" });
    window.location.href = "/pesquisa-documental/acesso";
  }

  function handlePdf() {
    if (!conteudoGerado) return;

    const nome = numeroReferencia
      ? `lex-rocha-${numeroReferencia}.pdf`
      : `lex-rocha-relatorio-${Date.now()}.pdf`;

    baixarPdfRelatorio(
      {
        numeroReferencia: numeroReferencia ?? undefined,
        referenciaInterna: form.referenciaInterna || undefined,
        area: form.area,
        conteudoGerado,
        codigoAcompanhamento: codigoAcompanhamento ?? undefined,
        previsaoEntrega: previsaoEntrega ?? undefined,
      },
      nome
    );
  }

  const formularioValido =
    form.fatos.length >= 20 &&
    form.precedentes.length >= 10 &&
    form.fundamentos.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-3 py-4 sm:px-4 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/"
              className="mb-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              ← Voltar ao site público
            </Link>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Uso interno — Tiago Aureliano da Rocha · Pesquisador de Jurisprudência
            </p>
            <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              {NOME_SERVICO_PUBLICO}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{AVISO_LEGAL_TELA}</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/pesquisa-documental/fila">Fila de pedidos</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleSair}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
        <Card className="border-amber-200 bg-amber-50/80">
          <CardContent className="pt-6 text-sm text-amber-950">{AVISO_LEGAL_RELATORIO}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fontes públicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{NOTA_FONTES_RELATORIO}</p>
            <ul className="list-inside list-disc space-y-1">
              {FONTES_PESQUISA_PUBLICA.map((f) => (
                <li key={f.url}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {f.nome}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do caso</CardTitle>
            <p className="text-xs text-muted-foreground">
              Não inclua nome, CPF ou número de processo nos campos de fatos — use apenas a
              referência interna.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Referência interna</span>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.referenciaInterna}
                onChange={(e) =>
                  setForm((p) => ({ ...p, referenciaInterna: e.target.value }))
                }
                placeholder="Ex.: Cliente 001/2026"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Área do caso</span>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.area}
                onChange={(e) =>
                  setForm((p) => ({ ...p, area: e.target.value as FormState["area"] }))
                }
              >
                {AREAS_PROBLEMA.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Resumo dos fatos (suas palavras)</span>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.fatos}
                onChange={(e) => setForm((p) => ({ ...p, fatos: e.target.value }))}
                placeholder="Descreva o caso sem citar nome ou CPF do cliente"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Precedentes pesquisados</span>
              <textarea
                className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                value={form.precedentes}
                onChange={(e) => setForm((p) => ({ ...p, precedentes: e.target.value }))}
                placeholder="Links e resumos do Jusbrasil, CNJ, tribunais"
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Agravantes (referência da causa)</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {AGRAVANTES_OPCOES.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-input p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.agravantes.includes(a.id)}
                      onChange={() => alternarAgravante(a.id)}
                      className="mt-0.5"
                    />
                    <span>{a.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <EstimativaCausaCard area={form.area} agravantes={form.agravantes} />

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Fundamentos aplicáveis</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {FUNDAMENTOS_OPCOES.map((f) => (
                  <label
                    key={f.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md border border-input p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.fundamentos.includes(f.id)}
                      onChange={() => alternarFundamento(f.id)}
                      className="mt-0.5"
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Observações</span>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.observacoes}
                onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={classificando || form.fatos.length < 20}
                onClick={handleClassificar}
              >
                {classificando ? "Classificando…" : "1. Classificar caso"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={salvando || !triagem}
                onClick={() => handleSalvar(true)}
              >
                Salvar rascunho
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Preço sugerido do relatório: R$ {valorExibido.valor} ({valorExibido.faixa})
            </p>
          </CardContent>
        </Card>

        {triagem && <TriagemResultadoCard triagem={triagem} />}

        {triagem && formularioValido && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-input p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={enriquecerComFetch}
                  onChange={(e) => setEnriquecerComFetch(e.target.checked)}
                />
                <span>
                  <span className="font-medium">Consultar fontes na web antes de gerar</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Busca HTTP apenas em domínios permitidos (Planalto, tribunais, Jusbrasil, gov.br).
                    Falha de rede interrompe a geração — sem fallback silencioso.
                  </span>
                </span>
              </label>
              <Button
                type="button"
                disabled={carregando}
                onClick={handleGerarRelatorio}
              >
                {carregando ? "Gerando relatório…" : "2. Confirmar e gerar relatório (Claude)"}
              </Button>
            </CardContent>
          </Card>
        )}

        {erro && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-sm text-destructive">{erro}</CardContent>
          </Card>
        )}

        {pacoteResumo && <PacotePesquisaCard pacote={pacoteResumo} />}

        {conteudoGerado && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview do relatório</CardTitle>
              {numeroReferencia && (
                <p className="text-sm font-medium text-primary">{numeroReferencia}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-slate max-w-none whitespace-pre-wrap break-words rounded-lg border bg-card p-3 text-sm sm:p-4">
                {conteudoGerado}
              </div>
              <ChecklistRevisaoCard estado={checklistRevisao} onChange={atualizarChecklist} />
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={handlePdf}>
                  Baixar PDF
                </Button>
                <Button
                  type="button"
                  disabled={salvando || !checklistRevisaoCompleto(checklistRevisao)}
                  onClick={() => handleSalvar(false)}
                >
                  {salvando ? "Salvando…" : "Salvar e registrar pagamento"}
                </Button>
              </div>
              {!checklistRevisaoCompleto(checklistRevisao) && (
                <p className="text-xs text-amber-800">
                  Complete o checklist de revisão para habilitar o salvamento.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-1 pt-6 text-sm text-muted-foreground">
            <p>{PRECIFICACAO_TEXTO_COMPARATIVO}</p>
            <p>{NOTA_APROVACAO_CLIENTE}</p>
            <ul className="grid gap-1 sm:grid-cols-3">
              <li>
                {PRECIFICACAO.essencial.label}: R$ {PRECIFICACAO.essencial.valor}
              </li>
              <li>
                {PRECIFICACAO.padrao.label}: R$ {PRECIFICACAO.padrao.valor}
              </li>
              <li>
                {PRECIFICACAO.completo.label}: R$ {PRECIFICACAO.completo.valor}
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {modalPagamento && relatorioId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Controle financeiro</CardTitle>
              {triagem && (
                <p className="text-sm text-muted-foreground">
                  Preço sugerido do relatório: R$ {valorExibido.valor} ({valorExibido.faixa}) · Faixa da causa:{" "}
                  {triagem.analise_fatores.faixa_estimada_causa}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Valor cobrado pelo relatório (R$)</span>
                <input
                  type="number"
                  className="w-full rounded-md border border-input px-3 py-2"
                  value={valorCobrado}
                  onChange={(e) => setValorCobrado(e.target.value)}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Status</span>
                <select
                  className="w-full rounded-md border border-input px-3 py-2"
                  value={statusPagamento}
                  onChange={(e) =>
                    setStatusPagamento(e.target.value as "pendente" | "pago")
                  }
                >
                  <option value="pendente">Aguardando PIX</option>
                  <option value="pago">Pago via PIX</option>
                </select>
              </label>
              <p className="text-xs text-muted-foreground">PIX CNPJ: {CHAVE_PIX_CNPJ}</p>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={gerandoLinkStripe}
                  onClick={handleGerarLinkStripe}
                >
                  {gerandoLinkStripe ? "Gerando link…" : "Gerar link Stripe (cartão / PIX)"}
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" className="flex-1" onClick={handleRegistrarPagamento}>
                    Registrar PIX manual
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalPagamento(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
