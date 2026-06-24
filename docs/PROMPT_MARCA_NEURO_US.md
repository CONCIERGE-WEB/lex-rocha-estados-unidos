# Prompt PhD — Adaptação neurocomportamental global PT → EUA

## Papel do agente

Actuar como **estratega de marca aplicada à persuasão ética transcultural** com foco em:
- semiótica que o público **reconhece ao olhar** (não tradução literal de cores);
- psicologia das cores em disputas de consumo;
- continuidade da **lógica** neurocomportamental (confiança → acção → prova);
- IP confidencial (prompts Groq, templates R1/R2/R3, keywords);
- **nunca** alterar `pt-consumidores`.

---

## Diagnóstico — o que o português reconhece (PT)

| Elemento | Codificação cultural | Efeito neurocomportamental |
|----------|---------------------|----------------------------|
| **Azulejo** (grelha 2×2) | Património nacional, casa, Estado | Familiaridade → confiança imediata |
| **Caravela** (dourado `#9A6B1F`) | Descoberta, valor histórico | CTA quente sem alarme vermelho |
| **Pergaminho** (`#F5F1E8`) | Arquivo, folio legal, idade 40+ | Autenticidade documental europeia |
| **Azulejo teal** (`#1A5F7A`) | Mediterrâneo institucional | Calma perante conflito |
| **Serif no corpo** (Literata) | Tradição ibérica de leitura jurídica | Gravitas |
| **hero-grid 48px** | Padrão de azulejo subliminar | Pertencimento cultural |

**Conclusão:** Renomear `azulejo` → `trust` **sem mudar o símbolo** mantém identidade portuguesa disfarçada. **Não serve para EUA.**

---

## Objectivo — o que o americano reconhece (US)

| Elemento US | Codificação cultural | Efeito neurocomportamental |
|-------------|---------------------|----------------------------|
| **Consumer Shield** (escudo + linhas + ✓) | Protecção, FTC, seguros, LegalZoom | «Estou protegido» — não «estou em casa» |
| **Legal pad lines** (hero) | Bloco de notas jurídico, formulários gov | Trabalho sério, processo claro |
| **Institutional blue** (`#1D4ED8`) | Bancos, governo, serviços legais US | Confiança digital familiar |
| **Verified green** (`#059669`) | Aprovação, TurboTax, «you're covered» | Caminho correcto / decisão segura |
| **Cool white** (`#F8FAFC`) | Serviços profissionais US | Clareza, não nostalgia |
| **Libre Baskerville + Source Sans** | Escritórios de advocacia US modernos | Autoridade + legibilidade screen-first |
| **CTA blue** (não dourado português) | Padrão US de botão primário | Acção sem estranhamento cultural |

---

## Invariantes neurocomportamentais (mantidos)

1. **Separar confiança de acção** — duas cores distintas, nunca uma só.
2. **Um elemento visual «diferente»** — no PT: 1 tile dourado; no US: ✓ verde no escudo.
3. **Reduzir ansiedade** — paleta dessaturada; sem vermelho alarmista.
4. **Prova documental** — `cite-block` com margem esquerda (metáfora de citação legal universal).
5. **Preço visível antes do pagamento** — cor `verify` nos montantes.

---

## Mapa de execução

```
FASE 1 — Tokens CSS (tailwind + globals)
  ink, paper, folio, trust, action, verify, cite, mist
  hero-grid → legal pad lines (NOT tile grid)

FASE 2 — Marca
  logo-mark.svg → Consumer Shield
  logo.svg, logo-mark-on-ink.svg
  logo-mark.tsx, favicon via layout metadata

FASE 3 — Tipografia US
  Libre Baskerville (display) + Source Sans 3 (body)

FASE 4 — Copy + checkout US
  Sem NIF, NFS-e, RGPD, DL 24/2014
  ZIP opcional, USD, Stripe en-US

FASE 5 — IP confidencial
  private/prompts/usa-groq.ip.yaml
  signalhub/config/usa/prompts.yaml + keywords.yaml
  docs/TEMPLATE_RESPOSTAS_US.md

FASE 6 — Remover vestígios PT
  Apagar portugal-groq.ip.yaml
  Zero referências azulejo/caravela/pergaminho no código US
```

---

## Protocolos Groq US (R1/R2/R3)

| Fase | PT | US |
|------|----|----|
| R1 | «Olá» + empatia pt-PT | «Hi» + direct empathy en-US |
| R2 | Lei 24/96, 15 dias, ANACOM | FTC Act, 30 days, FCC/CFPB |
| R3 | €29-59, direitosconsumidor.com | $29-59, judicialintelligence.com |
| Proibido | DECO, DGSI, Portal da Queixa | BBB portals, court databases, attorneys |

Ver: `private/prompts/usa-groq.ip.yaml`, `docs/TEMPLATE_RESPOSTAS_US.md`

---

## Validação

```powershell
cd "E:\.projetos\Judicial Intelligence\site"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "test"
npm run build

# Sem vestígios PT na marca
rg -i "azulejo|caravela|pergaminho|NIF|RGPD|portugal-groq" site/src
```

---

## Execução

Adaptação aplicada em `Judicial Intelligence/` — repositório canónico US.
