# Site PT — executar em local

## Forma mais simples

Na **raiz do monorepo**:

```powershell
cd "e:\.projetos\000Inteligência_Resolutiva"
.\lexrocha-us.ps1
```

Ou duplo clique em **`lexrocha-us.bat`** (nesta pasta).

Abre o browser em http://localhost:3010 e mantém o servidor a correr.

Menu com outros subprojetos: `.\lexrocha-us.ps1 -Modo menu`

## PowerShell (caminho directo)

```powershell
cd "e:\.projetos\000Inteligência_Resolutiva\lex-rocha-pt"
npm run dev
```

**Atenção:** o disco é `e:\.projetos\` (com **pro**), não `e:\.jetos\`.

## Erros comuns

| Mensagem | O que fazer |
|----------|-------------|
| `Cannot find path 'E:\.jetos\...'` | Corrigir para `.projetos` |
| `EADDRINUSE :::3010` | Já há um `npm run dev` activo — use o browser ou feche a outra janela com Ctrl+C |
| Página em branco | Aguardar «Ready» no terminal e actualizar (F5) |
| `__webpack_modules__[moduleId] is not a function` | Parar servidor (Ctrl+C), depois `npm run dev:fresh` ou apagar pasta `.next` e `npm run dev` |
| Site sem cores / links colados (só texto simples) | HTML antigo no browser — após `dev:fresh`, use **Ctrl+F5** (recarregar sem cache) |

## Páginas

- http://localhost:3010/
- http://localhost:3010/privacidade
- http://localhost:3010/cookies
- http://localhost:3010/termos
- http://localhost:3010/contacto
