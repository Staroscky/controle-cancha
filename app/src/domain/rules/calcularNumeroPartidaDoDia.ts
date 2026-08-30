import type { Partida } from '../types/Partida'
import { chaveDoDia } from './agruparLancamentosPorDia'

/** Calcula a posição (1-indexada) de uma partida entre as partidas do mesmo dia, pela ordem de criação. */
export function calcularNumeroPartidaDoDia(partidas: Partida[], partidaId: string): number {
  const alvo = partidas.find((p) => p.id === partidaId)
  if (!alvo) return 0

  const diaAlvo = chaveDoDia(alvo.dataHora)
  const doMesmoDia = partidas
    .filter((p) => chaveDoDia(p.dataHora) === diaAlvo)
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora))

  return doMesmoDia.findIndex((p) => p.id === partidaId) + 1
}
