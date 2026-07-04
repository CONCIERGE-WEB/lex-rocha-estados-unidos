"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { WhatsAppButton } from "@/components/atoms/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";
import {
  AVISO_LEGAL_TELA,
  NOME_SERVICO_PUBLICO,
  PRECIFICACAO,
} from "@/lib/constants/pesquisa-documental";
import {
  CATEGORIA_LABELS,
  CATEGORIAS_COM_BANCO_MVP,
  type CategoriaComBancoMvp,
} from "@/lib/pipeline-confiavel/categorias";
import { mensagemClienteAcompanhar } from "@/lib/whatsapp";

type Canal = "procon" | "consumidor.gov" | "sac_empresa" | "nenhum";

type FormState = {
  nome_cliente: string;
  cpf_cliente: string;
  email_cliente: string;
  telefone_cliente: string;
  categoria: CategoriaComBancoMvp;
  empresa_reclamada: string;
  data_evento: string;
  valor: string;
  tipo_cobranca: "cartao" | "emprestimo" | "assinatura" | "boleto" | "outro";
  pagou_valor_cobrado: boolean;
  possui_comprovante_quitacao: boolean;
  ja_tentou_resolver_diretamente: boolean;
  canal_tentativa: Canal;
  outro_detalhe: string;
  consentimento_lgpd: boolean;
};

const estadoInicial: FormState = {
  nome_cliente: "",
  cpf_cliente: "",
  email_cliente: "",
  telefone_cliente: "",
  categoria: "negativacao_indevida",
  empresa_reclamada: "",
  data_evento: "",
  valor: "",
  tipo_cobranca: "cartao",
  pagou_valor_cobrado: false,
  possui_comprovante_quitacao: false,
  ja_tentou_resolver_diretamente: false,
  canal_tentativa: "nenhum",
  outro_detalhe: "",
  consentimento_lgpd: false,
};

const { solicitar: copySolicitar } = COPY_SITE;

function montarPayload(form: FormState): Record<string, unknown> {
  const base = {
    categoria: form.categoria,
    nome_cliente: form.nome_cliente,
    cpf_cliente: form.cpf_cliente,
    email_cliente: form.email_cliente,
    telefone_cliente: form.telefone_cliente || undefined,
    empresa_reclamada: form.empresa_reclamada,
    ja_tentou_resolver_diretamente: form.ja_tentou_resolver_diretamente,
    canal_tentativa: form.ja_tentou_resolver_diretamente
      ? form.canal_tentativa
      : undefined,
    consentimento_lgpd: form.consentimento_lgpd ? true : undefined,
    outro_detalhe: form.outro_detalhe || undefined,
  };

  if (form.categoria === "negativacao_indevida") {
    return {
      ...base,
      data_negativacao: form.data_evento,
      valor_negativado_centavos: form.valor,
      possui_comprovante_quitacao: form.possui_comprovante_quitacao,
    };
  }

  return {
    ...base,
    data_cobranca: form.data_evento,
    valor_cobrado_centavos: form.valor,
    tipo_cobranca: form.tipo_cobranca,
    pagou_valor_cobrado: form.pagou_valor_cobrado,
  };
}

export function SolicitarPesquisaForm() {
  const [form, setForm] = useState<FormState>(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [codigoAcompanhamento, setCodigoAcompanhamento] = useState<string | null>(
    null
  );
  const [previsaoEntrega, setPrevisaoEntrega] = useState<string | null>(null);

  const isNegativacao = form.categoria === "negativacao_indevida";

  const tituloCategoria = useMemo(
    () => CATEGORIA_LABELS[form.categoria],
    [form.categoria]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const res = await fetch("/api/pesquisa-documental/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarPayload(form)),
        signal: AbortSignal.timeout(20_000),
      });
      const json = (await res.json()) as {
        erro?: string;
        codigoAcompanhamento?: string;
        previsaoEntrega?: string;
      };
      if (!res.ok) throw new Error(json.erro ?? "Falha ao enviar.");
      setCodigoAcompanhamento(json.codigoAcompanhamento ?? null);
      setPrevisaoEntrega(json.previsaoEntrega ?? null);
      setEnviado(true);
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        setErro(
          "A conexão demorou demais. Verifique sua internet e tente novamente."
        );
      } else {
        setErro(err instanceof Error ? err.message : "Erro inesperado.");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>{copySolicitar.sucessoTitulo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{copySolicitar.sucessoCorpo}</p>
          {codigoAcompanhamento && (
            <div className="rounded-lg border bg-secondary/40 p-4 text-sm">
              <p>
                Código de acompanhamento:{" "}
                <strong className="font-mono text-base">
                  {codigoAcompanhamento}
                </strong>
              </p>
              {previsaoEntrega && (
                <p className="mt-1 text-muted-foreground">
                  Previsão informativa:{" "}
                  {new Date(previsaoEntrega).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/acompanhar/${codigoAcompanhamento}`}>
                    Acompanhar pelo site
                  </Link>
                </Button>
                <WhatsAppButton
                  mensagem={mensagemClienteAcompanhar(codigoAcompanhamento)}
                  size="sm"
                >
                  Enviar código no WhatsApp
                </WhatsAppButton>
              </div>
            </div>
          )}
          <Button asChild variant="outline">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{NOME_SERVICO_PUBLICO}</CardTitle>
          <p className="text-sm text-muted-foreground">{AVISO_LEGAL_TELA}</p>
          <p className="text-sm text-muted-foreground">
            Informe de referência por categoria (panorama estatístico) — não é
            consultoria individualizada.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Categoria</span>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.categoria}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  categoria: e.target.value as CategoriaComBancoMvp,
                }))
              }
            >
              {CATEGORIAS_COM_BANCO_MVP.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIA_LABELS[c]}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              Selecionada: {tituloCategoria}
            </span>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Nome completo</span>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.nome_cliente}
              onChange={(e) =>
                setForm((p) => ({ ...p, nome_cliente: e.target.value }))
              }
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">CPF</span>
            <input
              required
              inputMode="numeric"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.cpf_cliente}
              onChange={(e) =>
                setForm((p) => ({ ...p, cpf_cliente: e.target.value }))
              }
              placeholder="000.000.000-00"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">E-mail</span>
            <input
              required
              type="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.email_cliente}
              onChange={(e) =>
                setForm((p) => ({ ...p, email_cliente: e.target.value }))
              }
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Telefone / WhatsApp (opcional)</span>
            <input
              type="tel"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.telefone_cliente}
              onChange={(e) =>
                setForm((p) => ({ ...p, telefone_cliente: e.target.value }))
              }
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Empresa reclamada</span>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.empresa_reclamada}
              onChange={(e) =>
                setForm((p) => ({ ...p, empresa_reclamada: e.target.value }))
              }
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">
              {isNegativacao ? "Data da negativação" : "Data da cobrança"}
            </span>
            <input
              required
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.data_evento}
              onChange={(e) =>
                setForm((p) => ({ ...p, data_evento: e.target.value }))
              }
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Valor (R$)</span>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.valor}
              onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
              placeholder="150,00"
            />
          </label>

          {!isNegativacao && (
            <>
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Tipo de cobrança</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={form.tipo_cobranca}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      tipo_cobranca: e.target
                        .value as FormState["tipo_cobranca"],
                    }))
                  }
                >
                  <option value="cartao">Cartão</option>
                  <option value="emprestimo">Empréstimo</option>
                  <option value="assinatura">Assinatura</option>
                  <option value="boleto">Boleto</option>
                  <option value="outro">Outro</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.pagou_valor_cobrado}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      pagou_valor_cobrado: e.target.checked,
                    }))
                  }
                />
                <span>Informei que paguei o valor cobrado</span>
              </label>
            </>
          )}

          {isNegativacao && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.possui_comprovante_quitacao}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    possui_comprovante_quitacao: e.target.checked,
                  }))
                }
              />
              <span>Possuo comprovante de quitação</span>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ja_tentou_resolver_diretamente}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  ja_tentou_resolver_diretamente: e.target.checked,
                }))
              }
            />
            <span>Já tentei resolver diretamente</span>
          </label>

          {form.ja_tentou_resolver_diretamente && (
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Canal da tentativa</span>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.canal_tentativa}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    canal_tentativa: e.target.value as Canal,
                  }))
                }
              >
                <option value="procon">Procon</option>
                <option value="consumidor.gov">Consumidor.gov</option>
                <option value="sac_empresa">SAC da empresa</option>
                <option value="nenhum">Nenhum / outro</option>
              </select>
            </label>
          )}

          <label className="block space-y-1 text-sm">
            <span className="font-medium">
              Detalhe adicional (opcional, até 120 caracteres)
            </span>
            <input
              maxLength={120}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.outro_detalhe}
              onChange={(e) =>
                setForm((p) => ({ ...p, outro_detalhe: e.target.value }))
              }
            />
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              required
              type="checkbox"
              checked={form.consentimento_lgpd}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  consentimento_lgpd: e.target.checked,
                }))
              }
              className="mt-1"
            />
            <span>
              Li e concordo com a{" "}
              <Link href="/privacidade" className="text-primary underline">
                Política de Privacidade
              </Link>{" "}
              para tratamento dos meus dados nesta solicitação.
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
          <p>
            {copySolicitar.referenciaValores} Essencial R${" "}
            {PRECIFICACAO.essencial.valor} · Padrão R$ {PRECIFICACAO.padrao.valor}{" "}
            · Completo R$ {PRECIFICACAO.completo.valor}.
          </p>
        </CardContent>
      </Card>

      {erro && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">
            {erro}
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={enviando}
        className="w-full sm:w-auto"
      >
        {enviando ? "Enviando…" : "Enviar solicitação"}
      </Button>
    </form>
  );
}
