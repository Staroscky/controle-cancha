# 08 — Testes unitários

**Status:** ✅ Concluído

- Vitest configurado em `vite.config.ts` (via `defineConfig` de `vitest/config`, reaproveitando alias `@` e plugins). Scripts `npm run test` / `npm run test:watch`.
- Um arquivo de teste por regra, em `tests/domain/rules/` na raiz do projeto — **fora** de `src/`, espelhando a estrutura de `src/domain/rules/` (ver seção 2.1 de `arquitetura.md`). Correção feita depois de uma primeira versão que colocava os testes ao lado do código-fonte.
- Testes parametrizados com `it.each`, importando o código de produção pelo alias `@/...` (nunca caminho relativo cruzando de `tests/` para `src/`).
- `tsconfig.app.json` inclui `"tests"` além de `"src"` para o typecheck cobrir os testes.

Critério de pronto: `npm run test` (41 testes / 5 arquivos) e `npm run build` passam.
