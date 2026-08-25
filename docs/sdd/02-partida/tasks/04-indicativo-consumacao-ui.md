# 04 — UI: indicativo de consumação mínima

**Status:** ✅ Concluído

Na lista de participantes ativos da partida, exibir "faltam R$ X para o mínimo" usando `calcularIndicativoConsumacao` (já implementada em `domain/rules`) — só exibição, não é lançamento nem é persistido (seção 7 de `regras.md`).

Critério de pronto: indicativo some quando o cliente atinge o mínimo (testar lançando consumo manualmente via `lancamentosRepo` em uma sessão de teste, já que a tela de consumo é a feature 03).

---

**Atualização (feedback de uso real, pós-04-acerto):** `calcularIndicativoConsumacao` (mínimo de uma única partida) foi substituída por `calcularIndicativoConsumacaoAcumulado` — o mínimo agora soma o valor de **todas as partidas em que o cliente participou** (ex.: 3 partidas de R$ 5 = mínimo acumulado de R$ 15), comparado com o consumo real vinculado a essas mesmas partidas. Continua exibido só na tela de Partida (`MontagemEquipes.tsx`), que agora recebe `todasParticipacoes`/`todasPartidas` além das da partida ativa. Ver seção 7 de `regras.md` (atualizada) e `domain/rules/calcularIndicativoConsumacaoAcumulado.ts`.
