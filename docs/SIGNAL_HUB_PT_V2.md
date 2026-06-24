# Signal Hub Portugal v2

Integração de **11 canais activos** e **~48 dorks** no motor `signalhub_v2`. **Portal da Queixa** fica fora dos dorks até haver NIPC (sem conversão lá = ruído).

## Arquitectura

| Componente | Ficheiro |
|------------|----------|
| Bot produção | `signalhub_v2/portugal/bot.py` |
| Dorks multi-fonte | `config/portugal/dorks.yaml` (local, gitignored) |
| Keywords / 10 categorias | `config/portugal/keywords.yaml` |
| R1/R2/R3 referência | `config/portugal/categorias_resposta.yaml.example` |
| Prompts Groq | `config/portugal/prompts.yaml` ← `private/prompts/portugal-groq.ip.yaml` |

O script descarregado `signal_hub_portugal_v2.py` pode ser **importado** para `dorks.yaml`; o Telegram e o Groq continuam no `SignalHubEngine`.

## Canais cobertos (v2)

| Canal | Dorks (exemplo) |
|-------|-----------------|
| ~~Portal da Queixa~~ | *off até NIPC* — ver `gerar_dorks_portugal_v2.py` |
| Reddit r/portugal | 7+ (+ subreddit directo) |
| Reddit r/financaspessoaispt | 3+ |
| DECO Proteste | 2 |
| Trustpilot PT | 4+ |
| Reguladores (ANACOM, consumidor.gov.pt, ERSE) | 3+ |
| Blogs jurídicos | 6 |
| Fóruns (Zwame, etc.) | 3+ |
| Google Reviews | 2 |
| Facebook grupos | 4 |
| LinkedIn | 1 |
| Notícias (Público, DN, Observador) | 3+ |

**10 categorias** em `keywords.yaml.example`: cancelamento, cobrança indevida, produto não entregue, burla, saúde/seguro, telecom, banco, energia, habitação, e-commerce (+ logística/CTT).

## Instalação (VPS ou local)

```powershell
cd e:\.projetos\000Inteligência_Resolutiva\signalhub_v2
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

cd config\portugal
copy keywords.yaml.example keywords.yaml
copy prompts.yaml.example prompts.yaml
cd ..\..
python scripts\gerar_dorks_portugal_v2.py
# Se já tiver dorks.yaml antigo, apague ou mescle antes de gerar

copy ..\..\private\prompts\portugal-groq.ip.yaml config\portugal\prompts.yaml
# Edite portugal\.env (TELEGRAM, GROQ)
```

### Importar o seu `signal_hub_portugal_v2.py` dos Downloads

```powershell
python scripts\importar_signal_hub_v2.py --ficheiro "%USERPROFILE%\Downloads\signal_hub_portugal_v2.py"
```

Ou copie o ficheiro para `signalhub_v2/portugal/signal_hub_portugal_v2.py` e:

```powershell
python scripts\importar_signal_hub_v2.py
```

## Comandos

```powershell
python portugal/bot.py detectar      # TELEGRAM_CHAT_ID
python portugal/bot.py teste-live    # mock → Telegram
python portugal/bot.py scan          # varredura sem alertas (vê canal + score)
python portugal/bot.py               # produção (loop dorks)
```

Variáveis em `portugal/.env` (não `TELEGRAM_TOKEN` solto no shell — use os nomes do `.env.example`):

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `GROQ_API_KEY`
- `SCAN_INTERVAL_SECONDS` (opcional, default 300)

## requirements_signal_hub_pt.txt

Se o ficheiro dos Downloads listar pacotes extra, instale **por cima** de `requirements.txt` do hub:

```powershell
pip install -r requirements.txt
pip install -r requirements_signal_hub_pt.txt
```

Pacotes base já incluídos: `httpx`, `pyyaml`, `python-dotenv`, `duckduckgo-search`.

## Site e CTA

Alertas devem apontar para **https://www.direitosconsumidor.com** (`cta_link` em `keywords.yaml`).
