import type { Partida } from '../domain/types/Partida'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:partidas'

export function listarPartidas(): Partida[] {
  return getItem<Partida[]>(CHAVE, [])
}

export function buscarPartidaPorId(id: string): Partida | undefined {
  return listarPartidas().find((p) => p.id === id)
}

export function criarPartida(valores: {
  valorMinimoConsumacao: number
  valorPartidaPorCliente: number
  conjuntoId?: string | null
}): Partida {
  const partida: Partida = {
    id: crypto.randomUUID(),
    dataHora: new Date().toISOString(),
    equipeVencedoraId: null,
    status: 'em_andamento',
    valorMinimoConsumacao: valores.valorMinimoConsumacao,
    valorPartidaPorCliente: valores.valorPartidaPorCliente,
    conjuntoId: valores.conjuntoId ?? null,
  }
  setItem(CHAVE, [...listarPartidas(), partida])
  return partida
}

export function concluirPartida(id: string, equipeVencedoraId: string): void {
  const partidas = listarPartidas().map((p) =>
    p.id === id ? { ...p, status: 'concluida' as const, equipeVencedoraId } : p,
  )
  setItem(CHAVE, partidas)
}
