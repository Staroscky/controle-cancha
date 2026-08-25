# 02 — Hook de acerto

**Status:** ✅ Concluído

`ui/hooks/useAcerto.ts`: encapsula o saldo consolidado e o registro de pagamento, seguindo o mesmo padrão de `useClientes`/`useConsumo` (a UI só chama o hook, nunca os repos diretamente).

- Expõe `clientes` (via `clientesRepo.listarClientes()`) e `lancamentos` (via `lancamentosRepo.listarLancamentos()`).
- Deriva `pendencias` e `emDia`: para cada cliente, calcula o saldo com `calcularSaldo(lancamentos, cliente.id)` (já implementada) e separa em duas listas — saldo ≠ 0 vai para `pendencias`, saldo = 0 vai para `emDia` (seção 14.1). Cada item carrega o cliente e o saldo já calculado, para a UI não recalcular.
- `extratoDoCliente(clienteId)`: retorna os lançamentos daquele cliente (`lancamentosRepo.listarLancamentosPorCliente`) — o agrupamento por partida é responsabilidade da UI (tarefa 03), igual ao agrupamento por equipe já feito em `HistoricoPartidas.tsx`.
- `registrarPagamento(clienteId, valor, descricao)`: chama `prepararLancamentoPagamento` (tarefa 01); se retornar não-nulo, persiste via `lancamentosRepo.adicionarLancamento` e recarrega. Retorna um booleano indicando se o lançamento foi criado (permite a UI decidir se mostra a sugestão de marcar saída).
- `marcarSaida(clienteId)`: chama `clientesRepo.definirPresencaCliente(clienteId, false)` e recarrega — reaproveitado pela sugestão pós-pagamento (tarefa 04).

Critério de pronto: hook usado pela UI das tarefas seguintes, sem nenhum componente de `ui/` importando `clientesRepo` ou `lancamentosRepo` diretamente para o fluxo de acerto.
