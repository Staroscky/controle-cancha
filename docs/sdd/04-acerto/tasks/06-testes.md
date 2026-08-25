# 06 — Testes unitários

**Status:** ✅ Concluído

Testes para `prepararLancamentoPagamento` (tarefa 01) em `tests/domain/rules/`, seguindo a mesma convenção das features anteriores (import via alias `@/...`):

- `valor > 0` → retorna o lançamento com `tipoId = TIPO_LANCAMENTO_IDS.pagamento`, `partidaId = null`, `itemId = null`, `valor` igual ao recebido (positivo, sem inverter sinal).
- `valor <= 0` (zero e negativo) → retorna `null`.
- `descricao` com espaços nas pontas → gravada com `trim()`.
- `descricao` vazia (ou só espaços) → cai no padrão `"Pagamento"`.

Critério de pronto: `npm run test` e `npm run build` passam.
