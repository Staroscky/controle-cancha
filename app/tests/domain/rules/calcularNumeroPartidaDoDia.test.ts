import { describe, expect, it } from 'vitest'
import { calcularNumeroPartidaDoDia } from '@/domain/rules/calcularNumeroPartidaDoDia'
import type { Partida } from '@/domain/types/Partida'

function criarPartida(id: string, dataHora: string): Partida {
  return {
    id,
    dataHora,
    equipeVencedoraId: null,
    status: 'concluida',
    valorMinimoConsumacao: 0,
    valorPartidaPorCliente: 0,
    conjuntoId: null,
  }
}

describe('calcularNumeroPartidaDoDia', () => {
  it('numera sequencialmente as partidas do mesmo dia pela ordem de criação', () => {
    const partidas = [
      criarPartida('p1', '2026-08-29T10:00:00.000Z'),
      criarPartida('p2', '2026-08-29T11:00:00.000Z'),
      criarPartida('p3', '2026-08-29T12:00:00.000Z'),
    ]

    expect(calcularNumeroPartidaDoDia(partidas, 'p1')).toBe(1)
    expect(calcularNumeroPartidaDoDia(partidas, 'p2')).toBe(2)
    expect(calcularNumeroPartidaDoDia(partidas, 'p3')).toBe(3)
  })

  it('reinicia a contagem em dias diferentes', () => {
    const partidas = [
      criarPartida('p1', '2026-08-28T15:00:00.000Z'),
      criarPartida('p2', '2026-08-29T15:00:00.000Z'),
      criarPartida('p3', '2026-08-29T16:00:00.000Z'),
    ]

    expect(calcularNumeroPartidaDoDia(partidas, 'p1')).toBe(1)
    expect(calcularNumeroPartidaDoDia(partidas, 'p2')).toBe(1)
    expect(calcularNumeroPartidaDoDia(partidas, 'p3')).toBe(2)
  })

  it('partida inexistente retorna 0', () => {
    expect(calcularNumeroPartidaDoDia([], 'inexistente')).toBe(0)
  })
})
