import type { Partida } from '../types/Partida'
import { chaveDoDia } from './agruparLancamentosPorDia'

export type GrupoPartidasPorDia = {
  data: string
  partidas: Partida[]
}

/** Agrupa partidas por dia, preservando a ordem recebida dentro de cada grupo. */
export function agruparPartidasPorDia(partidas: Partida[]): GrupoPartidasPorDia[] {
  const grupos = new Map<string, Partida[]>()
  for (const partida of partidas) {
    const chave = chaveDoDia(partida.dataHora)
    const grupo = grupos.get(chave)
    if (grupo) {
      grupo.push(partida)
    } else {
      grupos.set(chave, [partida])
    }
  }
  return [...grupos.entries()].map(([data, itens]) => ({ data, partidas: itens }))
}
