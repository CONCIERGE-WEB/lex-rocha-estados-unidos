# Registo de marca — Portal da Queixa

Checklist para preencher o formulário **Direitos do Consumidor**. Actualize quando tiver NIPC ou entidade em Portugal.

> **Signal Hub:** dorks `portal_queixa` estão **desactivados** em `scripts/gerar_dorks_portugal_v2.py` até a marca poder responder no Portal. Registo manual abaixo pode avançar; varredura automática só depois do NIPC.

## Campos do formulário

| Campo | Valor recomendado |
|-------|-------------------|
| **Nome da marca** | Direitos do Consumidor |
| **Designação social** | A preencher com entidade registada em PT (Lda./unipessoal + NIPC). Actualizar rodapé do site quando disponível. |
| **E-mail da marca** | `contacto@direitosconsumidor.com` (pt-PT; **não** usar `contato@`) |
| **Categoria** | Advogados e Solicitadores — ou Organismos de Resolução de Litígios e Provedoria |
| **Telefone** | Chamada para rede fixa nacional — número PT (virtual se necessário: Zadarma, VoIP.ms) |
| **Morada** | Morada em Portugal quando existir; até lá, escritório virtual em Lisboa se o Portal exigir |
| **Página na internet** | https://www.direitosconsumidor.com |
| **NIPC** | Bloqueador se exigir verificação plena. Pode registar sem NIPC (marca «não verificada») e actualizar depois via ePortugal.gov.pt |
| **Tem loja online?** | Sim — https://www.direitosconsumidor.com |
| **Logotipo** | Marca «Direitos do Consumidor» (ficheiro PNG, fundo claro) |
| **Nome do gestor** | Responsável legal da entidade registada |
| **Cargo do gestor** | Fundador / Diretor |

## RGPD no site (já implementado)

| Requisito | Onde |
|-----------|------|
| Política de Privacidade | `/privacidade` |
| Cookies | `/cookies` + banner (essenciais vs todos) |
| Pedidos de apagamento | `privacidade@direitosconsumidor.com` |
| Formulário com consentimento | `/contacto` (checkbox não pré-marcado) |
| Supabase em UE | Ver `DEPLOY_PT.md` — `eu-west-1` ou `eu-central-1` |

## Respostas no Portal (colagem manual)

Ver `TEMPLATE_RESPOSTAS_PT.md` — o motor Telegram (Groq) gera variações no mesmo tom; use estes textos como referência ou colagem rápida.

## Ordem sugerida

1. Registar marca **sem NIPC** se precisar de presença já.
2. Configurar e-mail `contacto@` e `privacidade@` no domínio.
3. Deploy do site (`DEPLOY_PT.md`).
4. Constituir entidade PT / NIPC quando fizer sentido fiscal.
5. Actualizar designação social no Portal e no rodapé.
