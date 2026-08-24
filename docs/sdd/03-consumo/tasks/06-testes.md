# 06 — Testes unitários

**Status:** ✅ Concluído

Testes para `prepararLancamentosConsumo` (tarefa 01) em `tests/domain/rules/`, seguindo a mesma convenção das features 01/02 (parametrizados com `it.each` quando fizer sentido, import via alias `@/...`):

- 1 cliente selecionado → 1 lançamento, `descricao` sem prefixo, `valor = -valorTotal`.
- 3 clientes selecionados → 3 lançamentos, `descricao = "1/3 <item>"`, `valor = -(valorTotal / 3)` cada.
- `clienteIds` vazio → lista vazia.
- `valorTotal <= 0` → lista vazia.
- `obterPartidaIdDoCliente` retornando um id para alguns clientes e `null` para outros — cada lançamento reflete o `partidaId` correspondente (cobre o caso de cliente ativo em partida e cliente só consumindo, seção 10 de `regras.md`).

Critério de pronto: `npm run test` e `npm run build` passam.
