import { describe, expect, it } from 'vitest'
import { calcularCreditoVitoria } from '@/domain/rules/calcularCreditoVitoria'

describe('calcularCreditoVitoria', () => {
  it.each([
    // perdedores, vencedores, valorPartidaPorCliente, créditoEsperado
    [4, 4, 6, 6], // seção 7 de docs/regras.md: partida 4x4
    [4, 8, 6, 3], // seção 9 de docs/regras.md: 4 perdedores x 8 vencedores
    [1, 1, 6, 6],
    [0, 4, 6, 0], // sem perdedores, sem crédito a distribuir
    [4, 4, 0, 0], // valor da partida zerado
  ])(
    'com %d perdedor(es), %d vencedor(es) e valor de %d, o crédito por vencedor é %d',
    (perdedores, vencedores, valorPartida, esperado) => {
      expect(calcularCreditoVitoria(perdedores, vencedores, valorPartida)).toBe(esperado)
    },
  )

  it('retorna 0 quando não há vencedores ativos, evitando divisão por zero', () => {
    expect(calcularCreditoVitoria(4, 0, 6)).toBe(0)
  })
})
