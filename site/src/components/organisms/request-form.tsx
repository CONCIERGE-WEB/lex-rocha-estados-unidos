"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CHECKOUT_CASO_KEY } from "@/components/checkout-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COPY } from "@/lib/constants/copy-en";
import { PLANOS } from "@/lib/constants/empresa";
import {
  AVISO_LEGAL_TELA,
  PRECIFICACAO,
} from "@/lib/constants/pesquisa-documental";
import { US_STATES_LANCAMENTO } from "@/lib/constants/us-states";
import {
  CATEGORIA_LABELS,
  CATEGORIAS_COM_BANCO_MVP,
  normalizarCategoriaPipeline,
  type CategoriaComBancoMvp,
} from "@/lib/pipeline-confiavel/categorias";

type Canal = "company" | "cfpb" | "state_ag" | "nenhum";

type FormState = {
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente: string;
  state_us: string;
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
  consentimento_privacidade: boolean;
};

const estadoInicial: FormState = {
  nome_cliente: "",
  email_cliente: "",
  telefone_cliente: "",
  state_us: "",
  categoria: "fcra_credit_reporting",
  empresa_reclamada: "",
  data_evento: "",
  valor: "",
  tipo_cobranca: "cartao",
  pagou_valor_cobrado: false,
  possui_comprovante_quitacao: false,
  ja_tentou_resolver_diretamente: false,
  canal_tentativa: "nenhum",
  outro_detalhe: "",
  consentimento_privacidade: false,
};

const R = COPY.request;

function montarPayload(form: FormState): Record<string, unknown> {
  const base = {
    categoria: form.categoria,
    nome_cliente: form.nome_cliente,
    email_cliente: form.email_cliente,
    telefone_cliente: form.telefone_cliente || undefined,
    state_us: form.state_us,
    empresa_reclamada: form.empresa_reclamada,
    ja_tentou_resolver_diretamente: form.ja_tentou_resolver_diretamente,
    canal_tentativa: form.ja_tentou_resolver_diretamente
      ? form.canal_tentativa
      : undefined,
    consentimento_privacidade: form.consentimento_privacidade ? true : undefined,
    outro_detalhe: form.outro_detalhe || undefined,
  };

  switch (form.categoria) {
    case "fcra_credit_reporting":
      return {
        ...base,
        data_negativacao: form.data_evento,
        valor_negativado_centavos: form.valor,
        possui_comprovante_quitacao: form.possui_comprovante_quitacao,
      };
    case "fdcpa_debt_collection":
      return {
        ...base,
        data_cobranca: form.data_evento,
        valor_cobrado_centavos: form.valor,
        tipo_cobranca: form.tipo_cobranca,
        pagou_valor_cobrado: form.pagou_valor_cobrado,
      };
    case "tcpa_robocalls":
      return {
        ...base,
        data_evento: form.data_evento,
        tipo_contato: "outro",
        estimativa_contatos: form.valor || undefined,
      };
    case "lemon_law_warranty":
      return {
        ...base,
        data_compra: form.data_evento,
        valor_produto_centavos: form.valor,
        problema: "defeito",
      };
    case "udap_deceptive_practices":
      return {
        ...base,
        data_evento: form.data_evento,
        valor_envolvido_centavos: form.valor || undefined,
        tipo_pratica: "outro",
      };
    case "dot_flights_baggage":
      return {
        ...base,
        data_evento: form.data_evento,
        valor_envolvido_centavos: form.valor || undefined,
        problema: "outro",
      };
    case "health_plan_denial":
      return {
        ...base,
        data_negativa: form.data_evento,
        tipo: "plano_saude",
      };
    default:
      return base;
  }
}

export function RequestForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [codigoAcompanhamento, setCodigoAcompanhamento] = useState<string | null>(
    null
  );
  const [previsaoEntrega, setPrevisaoEntrega] = useState<string | null>(null);

  useEffect(() => {
    const raw =
      searchParams.get("categoria")?.trim() ||
      searchParams.get("category")?.trim() ||
      "";
    const canon = normalizarCategoriaPipeline(raw);
    if (canon && (CATEGORIAS_COM_BANCO_MVP as readonly string[]).includes(canon)) {
      setForm((prev) => ({ ...prev, categoria: canon as CategoriaComBancoMvp }));
    }
  }, [searchParams]);

  const isFcra = form.categoria === "fcra_credit_reporting";

  const tituloCategoria = useMemo(
    () => CATEGORIA_LABELS[form.categoria],
    [form.categoria]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarPayload(form)),
      });
      const data = (await res.json()) as {
        erro?: string;
        codigoAcompanhamento?: string;
        previsaoEntrega?: string;
      };
      if (!res.ok) {
        setErro(data.erro ?? "Could not submit your request.");
        return;
      }
      setCodigoAcompanhamento(data.codigoAcompanhamento ?? null);
      setPrevisaoEntrega(data.previsaoEntrega ?? null);
      setEnviado(true);
      try {
        const narrativa = [
          form.empresa_reclamada && `Company: ${form.empresa_reclamada}`,
          form.state_us && `State: ${form.state_us}`,
          form.outro_detalhe?.trim(),
        ]
          .filter(Boolean)
          .join("\n");
        sessionStorage.setItem(
          CHECKOUT_CASO_KEY,
          JSON.stringify({
            descricao: narrativa.length >= 80 ? narrativa : form.outro_detalhe || narrativa,
            area: CATEGORIA_LABELS[form.categoria],
            categoryId: form.categoria,
            categoria: form.categoria,
          })
        );
      } catch {
        // sessionStorage may be unavailable
      }
    } catch {
      setErro("Network error. Please try again.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    const catQ = encodeURIComponent(form.categoria);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl text-ink">{R.successTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted">
          <p>{R.successLead}</p>
          {codigoAcompanhamento ? (
            <p className="text-base font-semibold text-ink">
              Tracking code:{" "}
              <code className="rounded bg-muted-surface px-2 py-1 font-mono text-ink">
                {codigoAcompanhamento}
              </code>
            </p>
          ) : null}
          {previsaoEntrega ? (
            <p>
              Estimated queue window:{" "}
              {new Date(previsaoEntrega).toLocaleString("en-US")}
            </p>
          ) : null}

          <div className="rounded-xl border border-ink/10 bg-muted-surface p-4">
            <p className="font-semibold text-ink">Continue to secure checkout</p>
            <p className="mt-1 text-sm text-muted">
              Category locked: {CATEGORIA_LABELS[form.categoria]}. Choose a plan — exact USD
              price before Stripe.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {PLANOS.map((p) => {
                const destaque = "destaque" in p && Boolean(p.destaque);
                return (
                  <Button key={p.id} asChild variant={destaque ? "default" : "outline"}>
                    <Link href={`/checkout?plano=${p.id}&categoria=${catQ}`}>
                      {p.nome} · ${p.preco}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href="/track">{R.trackCta}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted">{AVISO_LEGAL_TELA}</p>
      <p className="text-sm text-muted">{R.pricingNote}</p>
      <p className="text-xs text-muted">
        {R.categoriesHint} · {PRECIFICACAO.essencial.label} ${PRECIFICACAO.essencial.valor} ·{" "}
        {PRECIFICACAO.padrao.label} ${PRECIFICACAO.padrao.valor} ·{" "}
        {PRECIFICACAO.completo.label} ${PRECIFICACAO.completo.valor}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{R.fields.name}</span>
          <input
            required
            className="w-full rounded-md border px-3 py-2"
            value={form.nome_cliente}
            onChange={(e) => setForm({ ...form, nome_cliente: e.target.value })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{R.fields.email}</span>
          <input
            required
            type="email"
            className="w-full rounded-md border px-3 py-2"
            value={form.email_cliente}
            onChange={(e) => setForm({ ...form, email_cliente: e.target.value })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{R.fields.phone}</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={form.telefone_cliente}
            onChange={(e) =>
              setForm({ ...form, telefone_cliente: e.target.value })
            }
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{R.fields.state}</span>
          <select
            required
            className="w-full rounded-md border px-3 py-2"
            value={form.state_us}
            onChange={(e) => setForm({ ...form, state_us: e.target.value })}
          >
            <option value="">Select…</option>
            {US_STATES_LANCAMENTO.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">{R.fields.category}</span>
        <select
          className="w-full rounded-md border px-3 py-2"
          value={form.categoria}
          onChange={(e) =>
            setForm({
              ...form,
              categoria: e.target.value as CategoriaComBancoMvp,
            })
          }
        >
          {CATEGORIAS_COM_BANCO_MVP.map((id) => (
            <option key={id} value={id}>
              {CATEGORIA_LABELS[id]}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">{tituloCategoria}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{R.fields.company}</span>
          <input
            required
            className="w-full rounded-md border px-3 py-2"
            value={form.empresa_reclamada}
            onChange={(e) =>
              setForm({ ...form, empresa_reclamada: e.target.value })
            }
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{R.fields.eventDate}</span>
          <input
            required
            type="date"
            className="w-full rounded-md border px-3 py-2"
            value={form.data_evento}
            onChange={(e) => setForm({ ...form, data_evento: e.target.value })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{R.fields.amount}</span>
          <input
            required
            inputMode="decimal"
            placeholder="150.00"
            className="w-full rounded-md border px-3 py-2"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
          />
        </label>
        {!isFcra ? (
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Charge type</span>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={form.tipo_cobranca}
              onChange={(e) =>
                setForm({
                  ...form,
                  tipo_cobranca: e.target.value as FormState["tipo_cobranca"],
                })
              }
            >
              <option value="cartao">Card</option>
              <option value="emprestimo">Loan</option>
              <option value="assinatura">Subscription</option>
              <option value="boleto">Invoice / bill</option>
              <option value="outro">Other</option>
            </select>
          </label>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.ja_tentou_resolver_diretamente}
            onChange={(e) =>
              setForm({
                ...form,
                ja_tentou_resolver_diretamente: e.target.checked,
              })
            }
          />
          {R.fields.triedResolve}
        </label>
        {form.ja_tentou_resolver_diretamente ? (
          <label className="block space-y-1">
            <span className="font-medium">{R.fields.channel}</span>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={form.canal_tentativa}
              onChange={(e) =>
                setForm({
                  ...form,
                  canal_tentativa: e.target.value as Canal,
                })
              }
            >
              <option value="company">{R.channels.company}</option>
              <option value="cfpb">{R.channels.cfpb}</option>
              <option value="state_ag">{R.channels.state_ag}</option>
              <option value="nenhum">{R.channels.nenhum}</option>
            </select>
          </label>
        ) : null}
        {isFcra ? (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.possui_comprovante_quitacao}
              onChange={(e) =>
                setForm({
                  ...form,
                  possui_comprovante_quitacao: e.target.checked,
                })
              }
            />
            I have proof the debt was paid / settled
          </label>
        ) : (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.pagou_valor_cobrado}
              onChange={(e) =>
                setForm({ ...form, pagou_valor_cobrado: e.target.checked })
              }
            />
            I already paid the disputed amount
          </label>
        )}
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">{R.fields.details}</span>
        <textarea
          className="min-h-[80px] w-full rounded-md border px-3 py-2"
          value={form.outro_detalhe}
          onChange={(e) => setForm({ ...form, outro_detalhe: e.target.value })}
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          required
          type="checkbox"
          className="mt-1"
          checked={form.consentimento_privacidade}
          onChange={(e) =>
            setForm({ ...form, consentimento_privacidade: e.target.checked })
          }
        />
        <span>
          {R.privacyConsent}{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}

      <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
        {enviando ? R.submitting : R.submit}
      </Button>
    </form>
  );
}
