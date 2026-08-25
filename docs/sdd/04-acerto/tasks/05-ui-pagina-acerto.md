# 05 — UI: aba Acerto

**Status:** ✅ Concluído

Substituir o placeholder de `ui/pages/AcertoPage.tsx` pela tela real, montando o hook `useAcerto` (tarefa 02) com os componentes das tarefas 03 e 04, no mesmo formato de `ClientesPage.tsx`/`PartidaPage.tsx` (título + seções).

- Duas seções, nessa ordem: **Pendências** (`useAcerto().pendencias`) e **Em dia** (`useAcerto().emDia`) — títulos exatamente esses, seção 14.1.
- Cada linha mostra: nome do cliente, saldo formatado (vermelho se negativo, verde se positivo — mesmo padrão de `ClientesPage.tsx`) e o botão "Ver extrato" (abre `ExtratoClienteDialog`, tarefa 03). O botão "Registrar pagamento" (abre `RegistrarPagamentoSheet`, tarefa 04) só aparece quando `saldo < 0` (cliente devedor) — pendências com saldo positivo (crédito do cliente) não recebem pagamento, só mostram o saldo e o extrato (seção 11.1: pagamento é quitação de saldo devedor).
- Estado vazio: mensagem quando não há nenhum cliente cadastrado; mensagem separada quando `pendencias` está vazia ("Nenhuma pendência — todo mundo em dia.").
- Sem filtro por presença — a seção 14.1 é explícita que pendência/em dia independe de o cliente estar presente ou ausente.

Critério de pronto: `npm run build` passa; fluxo completo testado manualmente no navegador (cliente com saldo negativo aparece em Pendências com botão de pagamento → cliente com saldo positivo aparece em Pendências sem botão de pagamento → abrir extrato confere os lançamentos em ordem cronológica → registrar pagamento parcial reduz o saldo mas mantém em Pendências → registrar o restante move o cliente para Em dia → toast de pagamento com ação "Marcar saída" funciona).
