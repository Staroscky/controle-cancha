import { describe, expect, it } from 'vitest'
import { calcularConsumoRealNaPartida } from '@/domain/rules/calcularConsumoRealNaPartida'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

function criarLancamento(overrides: Partial<LancamentoFinanceiro> = {}): LancamentoFinanceiro {
  return {
    id: crypto.randomUUID(),
    clienteId: 'cliente-1',
    partidaId: 'partida-1',
    tipoId: TIPO_LANCAMENTO_IDS.consumo,
    itemId: null,
    valor: 0,
    descricao: '',
    observacao: null,
    loteId: null,
    estornaLancamentoId: null,
    criadoEm: new Date(0).toISOString(),
    ...overrides,
  }
}

describe('calcularConsumoRealNaPartida', () => {
  it('retorna 0 quando não há lançamentos', () => {
    expect(calcularConsumoRealNaPartida([], 'cliente-1', 'partida-1')).toBe(0)
  })

  it('soma o valor absoluto dos lançamentos de consumo do cliente na partida', () => {
    const lancamentos = [criarLancamento({ valor: -6 }), criarLancamento({ valor: -2 })]
    expect(calcularConsumoRealNaPartida(lancamentos, 'cliente-1', 'partida-1')).toBe(8)
  })

  it.each([
    ['tipo diferente de Consumo', { tipoId: TIPO_LANCAMENTO_IDS.creditoPartida, valor: 6 }],
    ['cliente diferente', { clienteId: 'outro-cliente', valor: -6 }],
    ['partida diferente', { partidaId: 'outra-partida', valor: -6 }],
  ])('ignora lançamento com %s', (_descricao, overrides) => {
    const lancamentos = [criarLancamento(overrides)]
    expect(calcularConsumoRealNaPartida(lancamentos, 'cliente-1', 'partida-1')).toBe(0)
  })
})
