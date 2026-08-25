# Verificação final — 04 Acerto

- [x] `npm run build` (typecheck + build) passa sem erros
- [x] `npm run test` passa, incluindo os novos testes de `prepararLancamentoPagamento`
- [x] Testado manualmente no navegador:
  - [x] Cliente com saldo negativo aparece em **Pendências**; cliente com saldo zero aparece em **Em dia**
  - [x] Cliente com saldo positivo (crédito) aparece em **Pendências**, mas sem o botão "Registrar pagamento"
  - [x] Cliente ausente com saldo pendente continua aparecendo em Pendências (independe de presença)
  - [x] Ver extrato de um cliente com lançamentos de mais de uma partida — todos aparecem numa lista única, do mais antigo para o mais recente, sem agrupar por partida
  - [x] Registrar pagamento parcial — saldo reduz mas cliente continua em Pendências
  - [x] Registrar pagamento total (valor sugerido) — saldo zera e cliente migra para Em dia
  - [x] Toast de pagamento com ação "Marcar saída" marca o cliente como ausente ao clicar
  - [x] Registrar pagamento sem clicar na sugestão — cliente continua presente
- [x] Sem erros no console do navegador
- [x] `docs/regras.md` e `docs/arquitetura.md` revisados — nenhuma decisão nova além do já descrito nessas seções
- [x] `spec.md` desta feature atualizado de "Planejado" para "Concluído"
- [x] Roadmap em `docs/sdd/README.md` atualizado

## Verificação — redesenho Comandas (task 07)

- [x] `npm run build` e `npm run test` passam, incluindo os novos testes de `prepararLancamentosPagamentoGrupo` e `alocarPagamentoGrupo`
- [x] Testado manualmente no navegador:
  - [x] Aba aparece com o rótulo "Comandas"
  - [x] Um grupo formado na Aba Clientes (arrastar um cliente sobre outro) aparece agrupado no bloco "Presentes" de Comandas
  - [x] Cliente/grupo começa recolhido, sem mostrar saldo
  - [x] Expandir um cliente/grupo revela o saldo; expandir outro recolhe o anterior (só um expandido por vez na tela)
  - [x] "Pagar grupo" abre revisão com **um único campo de valor** (sugerido = soma das dívidas), sem campo por pessoa
  - [x] Valor igual à soma quita todos os membros do grupo, cada um com seu próprio lançamento e extrato corretos
  - [x] Valor menor que a soma abate de quem deve mais para quem deve menos, deixando quem deve menos com pagamento parcial ou de fora (revisão mostra "paga" / "fica devendo" por pessoa)
  - [x] Cliente ausente com saldo pendente aparece só dentro do dropdown "Outras pendências", fechado por padrão
  - [x] Dropdown "Outras pendências" não aparece quando não há ausente com saldo pendente
  - [x] Drawer de "Pagar grupo" é largo o bastante para a linha "fica devendo" não quebrar de forma estranha
  - [x] Extrato do cliente lista os lançamentos do mais antigo para o mais recente
  - [x] Valor no extrato mantém vermelho (débito) / verde (crédito); um ícone por tipo (recibo p/ Consumo, troféu p/ Crédito e Débito partida, dinheiro p/ Pagamento) identifica de onde veio cada lançamento
- [x] Sem erros no console do navegador
