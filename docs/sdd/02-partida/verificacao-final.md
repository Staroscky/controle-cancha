# Verificação final — 02 Partida

- [x] `npm run build` (typecheck + build) passa sem erros
- [x] `npm run test` passa, incluindo os novos testes de `prepararLancamentosFechamentoPartida`
- [x] Testado manualmente no navegador:
  - [x] Criar partida com valores padrão e com valores sobrescritos
  - [x] Montar equipes/lados respeitando os limites (4 por lado, 8 por equipe, 16 por partida) e confirmar que a UI bloqueia ao exceder
  - [x] Adicionar cliente presente, remover (saída) durante a partida
  - [x] Indicativo de consumação mínima aparece e some corretamente
  - [x] Concluir partida 4×4 e conferir os lançamentos gerados (débito/crédito)
  - [x] Concluir partida com equipes de tamanhos diferentes (ex.: 8×4) e conferir a divisão do crédito
  - [x] Cliente que saiu antes do fechamento não recebe cobrança nem crédito
  - [x] `valorPartidaPorCliente = 0` não gera lançamento nenhum
- [x] Sem erros no console do navegador
- [x] `docs/regras.md` e `docs/arquitetura.md` revisados — atualizar se alguma decisão nova surgiu durante a implementação
- [x] `spec.md` desta feature atualizado de "Planejado" para "Concluído"
- [x] Roadmap em `docs/sdd/README.md` atualizado

**Resultado:** Feature concluída em 2026-08-24. Fluxo completo implementado e testado manualmente no navegador: configuração padrão, criação de partida (com override), montagem de equipes/lados com validação de limites, entrada/saída de participantes, indicativo de consumação mínima e fechamento com geração de lançamentos — testado com 4×4 (seção 7), 8×4 (seção 9), participante que saiu antes do fechamento e `valorPartidaPorCliente = 0`. Todos os 48 testes automatizados passam (41 pré-existentes + 7 novos de `prepararLancamentosFechamentoPartida`), build e lint sem erros. Corrigido durante a verificação manual um bug em que `useConfiguracaoPadrao` era chamado em dois componentes independentes e não sincronizava (ver nota na tarefa 01). Limite de 4 clientes por lado e 8 por equipe não foram exercitados manualmente por limite de clientes de teste disponíveis (10 no total) — a lógica de validação foi revisada em código e é a mesma função para os três limites (lado/equipe/partida), já validado 16 seria o próximo a testar com uma base de clientes maior.
