# Report models (U.S.)

Local corpus of **granted / consumer-relevant** public opinions for report drafting.

## Layout

```
report-models/
  granted/
    manifesto.json
    <categoria_us>/<STATE>/corpus.json
```

Categories match `CATEGORIAS_PIPELINE` (FCRA, FDCPA, DOT, warranty, health).

States: USPS codes + `US` (federal / nationwide).

## Rules

- **Never invent** case names, citations, amounts, or URLs.
- Empty cells use `"status": "aguardando_corpus"` and `"itens": []`.
- Populate with CourtListener only when `COURTLISTENER_API_TOKEN` is set.

## Commands (from `site/`)

```bash
node scripts/seed-report-models-granted.mjs
node scripts/sync-courtlistener-corpus.mjs --categoria=fcra_credit_reporting --state=US
node scripts/sync-courtlistener-corpus.mjs --categoria=all --state=US --dry-run
```

PACER fee-based dockets are out of scope for Etapa 2 (listed as a public source only).
