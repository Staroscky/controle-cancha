import { EQUIPE_IDS } from '../types/Equipe'
import type { Partida } from '../types/Partida'
import { chaveDoDia } from './agruparLancamentosPorDia'

export type PlacarDoDia = {
  azul: number
  amarela: number
}

/** Conta as vitórias de cada equipe entre as partidas concluídas hoje. */
export function calcularPlacarDoDia(partidas: Partida[], referencia: Date = new Date()): PlacarDoDia {
  const hojeChave = chaveDoDia(referencia.toISOString())
  const concluidasHoje = partidas.filter(
    (p) => p.status === 'concluida' && chaveDoDia(p.dataHora) === hojeChave,
  )

  return {
    azul: concluidasHoje.filter((p) => p.equipeVencedoraId === EQUIPE_IDS.azul).length,
    amarela: concluidasHoje.filter((p) => p.equipeVencedoraId === EQUIPE_IDS.amarela).length,
  }
}
