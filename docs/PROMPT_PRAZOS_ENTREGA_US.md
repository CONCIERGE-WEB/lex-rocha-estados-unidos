# Prompt PhD — Prazos, agenda e entrega humana (US)

## Papel do agente

Actuar como **estratega de operações e copy de serviços profissionais US** (referência: Thomson Reuters, LegalZoom, TurboTax Support) com foco em:

- **Separar três fases temporais** — triagem (minutos), decisão (imediata), entrega (horas úteis);
- **Agenda como sinal de capacidade** — não prometer o impossível quando a fila está cheia;
- **Human-in-the-loop explícito** — IA apoia pesquisa; **humano revisa e envia** o relatório;
- **Preço antes do pagamento** — montante fixo visível no passo 3, alinhado ao plano recomendado;
- Neuroergonomia: frases curtas, contraste forte, sem jargão.

---

## Modelo enterprise (o que as grandes empresas fazem)

| Momento | Padrão US | Judicial Intelligence |
|---------|-----------|------------------------|
| Após formulário | «Typical response within X» + estado da fila | Triagem ~2 min · Plano + $ visível |
| Disponibilidade | Badge verde/âmbar («Accepting requests» / «High volume») | `operador_config.agenda_disponivel` |
| Entrega | SLA com «business hours» + revisão humana | 24 h úteis (aberta) · 48 h (fila cheia) |
| IA vs humano | «Expert-reviewed» / «Not a substitute for attorney» | Draft assistido · **Revisão humana obrigatória** |

---

## Invariantes de copy

1. **Nunca** dizer que a IA «entrega» ou «envia» o relatório sozinha.
2. **Sempre** mencionar revisão humana antes do e-mail ao cliente.
3. **Triagem gratuita** ≠ **relatório pago** — prazos diferentes.
4. Agenda fechada = prazo alargado, **não** recusa de pedidos.
5. Preço no passo 3 = exacto do checkout (sem surpresas).

---

## Mapa de execução (código)

```
FASE 1 — Constantes
  site/src/lib/constants/prazos-entrega.ts
  site/src/lib/agenda.ts (mensagens EN-US)

FASE 2 — Copy global
  site/src/lib/constants/copy-en.ts (hero, passos, FAQ, triagem, stats)

FASE 3 — UI
  components/agenda-status-strip.tsx (fetch /api/agenda)
  components/human-review-notice.tsx
  triagem-section.tsx — passo 3: preço + agenda + humano
  homepage: delivery-commitment-band.tsx (opcional banda)

FASE 4 — Verificação
  rg "24 business|human review|AI" site/src
  Build + smoke /#pedir-relatorio
```

---

## Textos canónicos (EN-US)

**Agenda aberta:**  
«Accepting new requests · Most reports delivered within 24 business hours after payment.»

**Agenda fechada:**  
«High volume right now · Reports may take up to 48 business hours · We still reply to messages.»

**Human review:**  
«Your report is prepared with research tools, then reviewed line-by-line by a human specialist before we email it. Nothing is sent automatically without that review.»

**Passo 3 triagem:**  
«Recommended plan · $XX — exact price at checkout · Delivery per current availability below.»
