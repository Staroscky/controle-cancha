# 05 — Regra de fechamento de partida

**Status:** ✅ Concluído

Falta uma peça de domínio: dado o conjunto de participações ativas de uma partida e a equipe vencedora, decidir quais lançamentos gerar. `calcularCreditoVitoria` já calcula o valor por vencedor — falta a função que separa participações ativas em vencedores/perdedores e monta a lista de lançamentos a persistir.

- `domain/rules/prepararLancamentosFechamentoPartida.ts` (nome sugerido): recebe participações ativas + equipe vencedora + valores da partida, retorna a lista de `Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>` a criar (débito por perdedor, crédito por vencedor). Não persiste nada — função pura, testável isolada, igual às outras regras.
- Se `valorPartidaPorCliente` for 0, retorna lista vazia (seção 12).
- A orquestração que chama essa função e persiste via `lancamentosRepo.adicionarLancamento` + `partidasRepo.concluirPartida` fica no hook da UI (tarefa 06), não em `domain/rules` (regra pura não conhece `data/`).

Critério de pronto: coberto por testes unitários (tarefa 07) antes de ser usado pela UI.
