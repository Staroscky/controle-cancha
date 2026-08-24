# 07 — Testes unitários

**Status:** ✅ Concluído

Testes para `prepararLancamentosFechamentoPartida` (tarefa 05) em `tests/domain/rules/`, seguindo a mesma convenção da feature 01 (parametrizados com `it.each`, import via alias `@/...`):

- Partida 4×4 com valor R$ 6 (exemplo da seção 7 de `regras.md`) — 4 débitos de -6, 4 créditos de +6.
- Partida 8×4 (exemplo da seção 9) — 4 débitos de -6, 8 créditos de +3.
- `valorPartidaPorCliente = 0` — lista vazia.
- Participante com status `saiu` não entra na divisão nem gera lançamento (seção 3).
- Time vencedor ou perdedor vazio (edge case, ex.: todos os perdedores saíram antes do fechamento).

Critério de pronto: `npm run test` e `npm run build` passam.
