# 03 — UI: extrato do cliente

**Status:** ✅ Concluído

`ui/components/ExtratoClienteDialog.tsx` — usa `Dialog` (não `Sheet`), conforme a tabela de `arquitetura.md` seção 5 ("ver extrato de um cliente" → `Dialog`).

Props sugeridas: `cliente: Cliente`, `lancamentos: LancamentoFinanceiro[]` (já filtrados para aquele cliente, vindos de `useAcerto().extratoDoCliente`), disparado por um botão "Ver extrato" no item da lista (tarefas 05).

- Lista simples, sem agrupar por partida: todos os lançamentos do cliente ordenados do mais recente para o mais antigo (por `criadoEm`) — decisão revista após uso real: agrupar por partida adicionava ruído sem ajudar a conferir o extrato.
- Cada lançamento na lista mostra: `descricao`, `valor` formatado (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, destacado em vermelho se negativo / verde se positivo, mesmo padrão de `ClientesPage.tsx`) e a data/hora (`criadoEm`, `Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })`, mesmo formatador de `HistoricoPartidas.tsx`).
- Rodapé do `Dialog` mostra o saldo total do cliente (soma de todos os `valor`, ou reaproveita `calcularSaldo` passando só os lançamentos recebidos).
- Estado vazio: mensagem quando o cliente não tem nenhum lançamento.

Critério de pronto: componente puro de apresentação, sem dependência de `partidasRepo`, pronto para ser montado pela tarefa 05.
