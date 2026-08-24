# 06 — UI: conclusão da partida

**Status:** ✅ Concluído

`AlertDialog` (ação importante e definitiva, seção 5 de `arquitetura.md`) para escolher a equipe vencedora e confirmar o fechamento.

Ao confirmar:

1. Chama `prepararLancamentosFechamentoPartida` (tarefa 05) com as participações ativas.
2. Persiste cada lançamento via `lancamentosRepo.adicionarLancamento`.
3. Marca a partida como concluída via `partidasRepo.concluirPartida`.
4. `Toast` de confirmação com o resumo (ex.: "Partida concluída — Azul venceu").

Critério de pronto: testado manualmente com times de tamanhos diferentes (replicar o exemplo 8×4 da seção 9 de `regras.md`) e conferir os lançamentos gerados (ex.: via extrato, quando a feature 04 existir, ou inspecionando o LocalStorage nesta etapa).
