# Verificação final — 04 Acerto

- [x] `npm run build` (typecheck + build) passa sem erros
- [x] `npm run test` passa, incluindo os novos testes de `prepararLancamentoPagamento`
- [x] Testado manualmente no navegador:
  - [x] Cliente com saldo negativo aparece em **Pendências**; cliente com saldo zero aparece em **Em dia**
  - [x] Cliente com saldo positivo (crédito) aparece em **Pendências**, mas sem o botão "Registrar pagamento"
  - [x] Cliente ausente com saldo pendente continua aparecendo em Pendências (independe de presença)
  - [x] Ver extrato de um cliente com lançamentos de mais de uma partida — todos aparecem numa lista única, do mais recente para o mais antigo, sem agrupar por partida
  - [x] Registrar pagamento parcial — saldo reduz mas cliente continua em Pendências
  - [x] Registrar pagamento total (valor sugerido) — saldo zera e cliente migra para Em dia
  - [x] Toast de pagamento com ação "Marcar saída" marca o cliente como ausente ao clicar
  - [x] Registrar pagamento sem clicar na sugestão — cliente continua presente
- [x] Sem erros no console do navegador
- [x] `docs/regras.md` e `docs/arquitetura.md` revisados — nenhuma decisão nova além do já descrito nessas seções
- [x] `spec.md` desta feature atualizado de "Planejado" para "Concluído"
- [x] Roadmap em `docs/sdd/README.md` atualizado
