import type { Partida } from '../types/Partida'
import { chaveDoDia } from './agruparLancamentosPorDia'

export type PartidasPorPeriodo = {
  hoje: Partida[]
  anteriores: Partida[]
}

/** Separa partidas em "hoje" (o Atual) e "dias anteriores" (o Histórico). */
export function separarPartidasPorPeriodo(partidas: Partida[]): PartidasPorPeriodo {
  const hojeChave = chaveDoDia(new Date().toISOString())
  const hoje: Partida[] = []
  const anteriores: Partida[] = []

  for (const partida of partidas) {
    if (chaveDoDia(partida.dataHora) === hojeChave) {
      hoje.push(partida)
    } else {
      anteriores.push(partida)
    }
  }

  return { hoje, anteriores }
}
