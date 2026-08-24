# 04 — UI: indicativo de consumação mínima

**Status:** 📝 Planejado

Na lista de participantes ativos da partida, exibir "faltam R$ X para o mínimo" usando `calcularIndicativoConsumacao` (já implementada em `domain/rules`) — só exibição, não é lançamento nem é persistido (seção 7 de `regras.md`).

Critério de pronto: indicativo some quando o cliente atinge o mínimo (testar lançando consumo manualmente via `lancamentosRepo` em uma sessão de teste, já que a tela de consumo é a feature 03).
