# Propriedade intelectual — SignalHub

**Operador:** Direitos do Consumidor (dados legais da entidade — preencher localmente)  
**Todos os direitos reservados** — ver [LICENSE](./LICENSE).

O repositório Git público contém **apenas** código operacional genérico, compliance, licença e planos comerciais.  
**Não versionar** materiais que terceiros possam copiar e reutilizar.

---

## Arquivos somente locais (nunca no Git)

| Artefato | Caminho local |
|----------|----------------|
| Queries de varredura | `signalhub_v2/config/lex/dorks.yaml` · `.../zairyx/dorks.yaml` · `.../portugal/dorks.yaml` |
| Taxonomia / keywords | `signalhub_v2/config/lex/keywords.yaml` · `.../zairyx/keywords.yaml` · `.../portugal/keywords.yaml` |
| Prompts Groq | `signalhub_v2/config/lex/prompts.yaml` · `.../zairyx/prompts.yaml` · `.../portugal/prompts.yaml` |
| Master prompt PT | `private/prompts/portugal-groq.ip.yaml` → copiar para `config/portugal/prompts.yaml` |
| Site PT | `lex-rocha-pt/` (marca **Direitos do Consumidor**, domínio **direitosconsumidor.com**) |
| Bot Telegram PT | `signalhub_v2/portugal/.env` |
| Prompts Cursor / estratégia | pasta `private/` na raiz (criar localmente) |
| Documentos PhD/MBA/DBA | `private/docs/` (mover os `.md` estratégicos para cá) |
| CCMEI e credenciais | `.env`, `CCMEI*.pdf` |

---

## Primeira instalação (copiar exemplos)

```powershell
cd signalhub_v2\config\lex
copy dorks.yaml.example dorks.yaml
copy keywords.yaml.example keywords.yaml
copy prompts.yaml.example prompts.yaml
# Edite os três com seu conteúdo real (confidencial)

cd ..\zairyx
copy dorks.yaml.example dorks.yaml
copy keywords.yaml.example keywords.yaml
copy prompts.yaml.example prompts.yaml

cd ..\portugal
copy dorks.yaml.example dorks.yaml
copy keywords.yaml.example keywords.yaml
copy prompts.yaml.example prompts.yaml
```

Na raiz do projeto, crie `private\docs\` e mantenha lá:

- Prompts Cursor (PhD/MBA/DBA, SignalHub detecção)
- Análises de mercado, roadmaps, modelos de projeto
- Qualquer playbook reutilizável

---

## O que permanece público (repositório)

- Motor `signalhub_v2` (sem prompts/keywords embutidos)
- `COMPLIANCE.md`, `LICENSE`, `PLANOS_E_PRECOS.md`
- Arquivos `*.example` (estrutura vazia, sem estratégia)
- Testes com fixtures mínimas em `tests/fixtures/`

---

## Histórico Git

Versões antigas no GitHub podem ainda conter conteúdo removido. Após rotação de queries/keywords, solicite limpeza de histórico (`git filter-repo`) se necessário.
