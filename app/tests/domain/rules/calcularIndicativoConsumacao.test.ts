import { describe, expect, it } from 'vitest'
import { calcularIndicativoConsumacao } from '@/domain/rules/calcularIndicativoConsumacao'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

function criarLancamentoConsumo(valorConsumido: number): LancamentoFinanceiro {
  return {
    id: crypto.randomUUID(),
    clienteId: 'cliente-1',
    partidaId: 'partida-1',
    tipoId: TIPO_LANCAMENTO_IDS.consumo,
    itemId: null,
    valor: -valorConsumido,
    descricao: '',
    criadoEm: new Date(0).toISOString(),
  }
}

describe('calcularIndicativoConsumacao', () => {
  it.each([
    [0, 6, 6],
    [2, 6, 4],
    [6, 6, 0],
    [9, 6, 0],
    [0, 0, 0],
    [2, 0, 0],
  ])(
    'com consumo real de %d e mínimo de %d, o indicativo é %d',
    (consumoReal, valorMinimo, esperado) => {
      const lancamentos = consumoReal > 0 ? [criarLancamentoConsumo(consumoReal)] : []
      expect(calcularIndicativoConsumacao(lancamentos, 'cliente-1', 'partida-1', valorMinimo)).toBe(
        esperado,
      )
    },
  )

  it('não exibe indicativo quando o valor mínimo é negativo', () => {
    expect(calcularIndicativoConsumacao([], 'cliente-1', 'partida-1', -5)).toBe(0)
  })

  it('considera apenas o consumo da partida e do cliente informados', () => {
    const lancamentos = [
      criarLancamentoConsumo(2),
      { ...criarLancamentoConsumo(100), partidaId: 'outra-partida' },
      { ...criarLancamentoConsumo(100), clienteId: 'outro-cliente' },
    ]
    expect(calcularIndicativoConsumacao(lancamentos, 'cliente-1', 'partida-1', 6)).toBe(4)
  })
})
