# Verificação final — 03 Consumo

- [x] `npm run build` (typecheck + build) passa sem erros
- [x] `npm run test` passa, incluindo os novos testes de `prepararLancamentosConsumo`
- [x] Testado manualmente no navegador:
  - [x] Cadastrar item no catálogo e lançar consumo selecionando-o
  - [x] Lançar item avulso (descrição + valor digitados na hora)
  - [x] Selecionar 1 cliente — lançamento único, `descricao` sem prefixo, valor cheio
  - [x] Selecionar 3 clientes — 3 lançamentos "1/3 &lt;item&gt;", valor dividido
  - [x] Lançar consumo para um cliente ativo na partida em andamento — lançamento sai com `partidaId` preenchido e o indicativo de consumação mínima na aba Partida reage
  - [x] Lançar consumo para um cliente sem partida ativa (ou que já saiu/terminou) — lançamento sai com `partidaId` nulo
  - [x] Só clientes presentes aparecem na lista de seleção
- [x] Sem erros no console do navegador
- [x] `docs/regras.md` e `docs/arquitetura.md` revisados — nenhuma decisão nova além do já descrito nessas seções
- [x] `spec.md` desta feature atualizado de "Planejado" para "Concluído"
- [x] Roadmap em `docs/sdd/README.md` atualizado

**Resultado:** Feature implementada conforme planejado, sem desvios das tarefas. `prepararLancamentosConsumo` (domain) e `useConsumo` (hook) seguem exatamente os padrões de `prepararLancamentosFechamentoPartida`/`usePartidaAtiva`. Testado manualmente: item de catálogo cadastrado (Cerveja, R$12) e lançado para 1 cliente presente (saldo caiu R$28→R$16); item avulso (Petisco, R$30) lançado para 3 clientes presentes gerando "1/3 Petisco" de -R$10 cada; verificado via localStorage que o lançamento do cliente ativo em partida em andamento saiu com `partidaId` preenchido e os demais (fora da partida) com `partidaId: null`; indicativo de consumação mínima na aba Partida deixou de mostrar o badge "faltam" para o cliente assim que seu consumo na partida superou o mínimo. Nenhum erro no console.
