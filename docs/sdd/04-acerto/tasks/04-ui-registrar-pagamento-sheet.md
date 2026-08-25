# 04 — UI: registrar pagamento

**Status:** ✅ Concluído

`ui/components/RegistrarPagamentoSheet.tsx` — usa `Sheet`, mesmo padrão de `LancarConsumoSheet.tsx`/`ConfiguracaoPadraoSheet.tsx`.

Props sugeridas: `cliente: Cliente`, `saldo: number` (negativo — o saldo devedor), `onRegistrar: (clienteId: string, valor: number, descricao: string) => boolean` (retorno de `useAcerto().registrarPagamento`, tarefa 02), `onSugerirSaida: (clienteId: string) => void` (`useAcerto().marcarSaida`, tarefa 02).

- Ao abrir, pré-preenche `valor` com `Math.abs(saldo)` (editável, permite pagamento parcial) e `descricao` vazia (placeholder "Ex.: Pagamento em dinheiro, Pix").
- Validação ao confirmar: `valor` numérico e `> 0`, senão `toast.error` (mesma mensagem no padrão de `LancarConsumoSheet.tsx`: "Informe um valor válido (maior que zero).").
- Ao confirmar com sucesso, chama `onRegistrar`, fecha o Sheet e mostra `toast.success` com **ação** (sonner `toast.success(mensagem, { action: { label: 'Marcar saída', onClick: () => onSugerirSaida(cliente.id) } })`) — implementa a sugestão de marcar saída da seção 11.1/3.1 sem bloquear o fluxo com um `AlertDialog` à parte.
- Só é oferecido para clientes com saldo pendente (a decisão de exibir o botão/trigger fica na tarefa 05, que só monta este componente para itens de `pendencias`).

Critério de pronto: fluxo completo (pagamento total e parcial) testado manualmente antes da tarefa 05 integrar tudo na página.
