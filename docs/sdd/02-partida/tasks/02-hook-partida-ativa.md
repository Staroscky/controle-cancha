# 02 — Hook de partida ativa

**Status:** 📝 Planejado

`ui/hooks/usePartidaAtiva.ts`: encapsula a partida "em andamento" atual (se houver) e suas participações.

- Deriva de `partidasRepo.listarPartidas()` a partida mais recente com `status: 'em_andamento'`, se existir.
- `criar(valores?)` — cria partida usando `configuracaoRepo` como padrão, permite sobrescrever os dois valores antes de criar.
- Expõe `participacoes` (via `participacoesRepo.listarParticipacoesPorPartida`).

Critério de pronto: hook usado pela UI da tarefa seguinte, sem a UI acessar `partidasRepo`/`participacoesRepo` diretamente.
