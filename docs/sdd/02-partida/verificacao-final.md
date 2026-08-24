# Verificação final — 02 Partida

- [ ] `npm run build` (typecheck + build) passa sem erros
- [ ] `npm run test` passa, incluindo os novos testes de `prepararLancamentosFechamentoPartida`
- [ ] Testado manualmente no navegador:
  - [ ] Criar partida com valores padrão e com valores sobrescritos
  - [ ] Montar equipes/lados respeitando os limites (4 por lado, 8 por equipe, 16 por partida) e confirmar que a UI bloqueia ao exceder
  - [ ] Adicionar cliente presente, remover (saída) durante a partida
  - [ ] Indicativo de consumação mínima aparece e some corretamente
  - [ ] Concluir partida 4×4 e conferir os lançamentos gerados (débito/crédito)
  - [ ] Concluir partida com equipes de tamanhos diferentes (ex.: 8×4) e conferir a divisão do crédito
  - [ ] Cliente que saiu antes do fechamento não recebe cobrança nem crédito
  - [ ] `valorPartidaPorCliente = 0` não gera lançamento nenhum
- [ ] Sem erros no console do navegador
- [ ] `docs/regras.md` e `docs/arquitetura.md` revisados — atualizar se alguma decisão nova surgiu durante a implementação
- [ ] `spec.md` desta feature atualizado de "Planejado" para "Concluído"
- [ ] Roadmap em `docs/sdd/README.md` atualizado

**Resultado:** _preencher ao concluir a feature._
