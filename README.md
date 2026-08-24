# Controle de Bocha

Controle de partidas, consumo e acerto de contas para partidas de bocha. App 100% client-side (sem backend), com persistência em LocalStorage e suporte a uso offline via PWA.

Documentação: [`docs/arquitetura.md`](docs/arquitetura.md) e [`docs/regras.md`](docs/regras.md).

## Como rodar localmente

O código do app fica na pasta `app/`.

```bash
cd app
npm install
npm run dev
```

Acesse http://localhost:5173.

### Outros comandos (dentro de `app/`)

```bash
npm run build       # typecheck + build de produção em app/dist
npm run preview     # serve o build de produção localmente
npm run lint         # roda o oxlint
npm run test         # roda os testes unitários (Vitest) uma vez
npm run test:watch   # roda os testes em modo watch
```

Requisitos: Node.js 20+.
