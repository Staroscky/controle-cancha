# 02 — Hook de consumo

**Status:** ✅ Concluído

`ui/hooks/useConsumo.ts`: encapsula o catálogo de itens e o lançamento de consumo, seguindo o mesmo padrão de `useClientes`/`usePartidaAtiva` (a UI só chama o hook, nunca os repos diretamente).

- Expõe `itens` (via `itensConsumoRepo.listarItensConsumo()`).
- `cadastrarItem(nome, valor)` — chama `itensConsumoRepo.adicionarItemConsumo` e recarrega `itens`.
- `lancar(descricaoItem, valorTotal, itemId, clienteIds)`:
  1. Resolve a partida ativa do estabelecimento: `partidasRepo.listarPartidas().find(p => p.status === 'em_andamento')` (mesma lógica já usada em `usePartidaAtiva`).
  2. Se existir, busca as participações **ativas** dessa partida via `participacoesRepo.listarParticipacoesPorPartida`.
  3. Monta `obterPartidaIdDoCliente(clienteId)`: retorna o id da partida ativa se o cliente tiver participação ativa nela, senão `null`.
  4. Chama `prepararLancamentosConsumo` (tarefa 01) com esses dados.
  5. Persiste cada lançamento retornado via `lancamentosRepo.adicionarLancamento`.

Critério de pronto: hook usado pela UI das tarefas seguintes, sem nenhum componente de `ui/` importando `itensConsumoRepo`, `lancamentosRepo`, `partidasRepo` ou `participacoesRepo` diretamente para o fluxo de consumo.
