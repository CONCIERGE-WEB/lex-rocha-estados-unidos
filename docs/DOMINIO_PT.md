# Domínio Portugal — decisão (2026)

## Situação

| Domínio | Estado |
|---------|--------|
| pesquisalegal.com | **Ocupado** |
| pesquisalegal.pt | Caro / adiado |
| pesquisalegalpt.com | SEO local fraco vs `.pt` |

## Recomendação principal: **direitosconsumidor.com**

| Critério | Nota |
|----------|------|
| Intenção de pesquisa | **Alta** — alinha com «direitos do consumidor», «reclamação», «como reclamar» |
| Memorização | Boa — frase natural em PT |
| Extensão `.com` | Aceite em PT; custo menor que `.pt` |
| Marca pública | **Direitos do Consumidor** |
| Atividade (rodapé) | Especialistas em pesquisa jurídica documental (MEI) |

### Alternativas `.com` (registar se livres)

| Domínio | Potencial SEO |
|---------|----------------|
| **direitosconsumidor.com** | ⭐⭐⭐⭐⭐ |
| consumidorportugal.com | ⭐⭐⭐⭐ |
| reclamarconsumidor.com | ⭐⭐⭐⭐ |
| guiaconsumidorpt.com | ⭐⭐⭐ |
| pesquisaconsumidor.com | ⭐⭐⭐ |

## Estratégia

1. Canónico: `https://www.direitosconsumidor.com`
2. Google Search Console → país **Portugal** (mesmo com `.com`)
3. Conteúdo 100 % pt-PT, RGPD, rodapé institucional (sem PII)
4. Quando puder: registar `.pt` e redireccionar 301 para o `.com` ou inverter

## Configuração no projeto

- `signalhub_v2/config/portugal/keywords.yaml` → `cta_link`
- `lex-rocha-pt/src/lib/constants/empresa.ts` → `url` / `dominio`
