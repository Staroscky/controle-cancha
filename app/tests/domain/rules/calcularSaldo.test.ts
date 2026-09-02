import { describe, expect, it } from 'vitest'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'

function criarLancamento(overrides: Partial<LancamentoFinanceiro> = {}): LancamentoFinanceiro {
  return {
    id: crypto.randomUUID(),
    clienteId: 'cliente-1',
    partidaId: null,
    tipoId: 'consumo',
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

describe('calcularSaldo', () => {
  it('retorna 0 quando não há lançamentos', () => {
    expect(calcularSaldo([], 'cliente-1')).toBe(0)
  })

  it('retorna 0 quando nenhum lançamento pertence ao cliente', () => {
    const lancamentos = [criarLancamento({ clienteId: 'outro-cliente', valor: -10 })]
    expect(calcularSaldo(lancamentos, 'cliente-1')).toBe(0)
  })

  it.each([
    [[-6], -6],
    [[-6, 3], -3],
    [[-6, -6, 6], -6],
    [[15, -5, -5], 5],
    [[0, 0], 0],
  ])('soma os valores %j do cliente e retorna %d', (valores, esperado) => {
    const lancamentos = valores.map((valor) => criarLancamento({ valor }))
    expect(calcularSaldo(lancamentos, 'cliente-1')).toBe(esperado)
  })

  it('ignora lançamentos de outros clientes na soma', () => {
    const lancamentos = [
      criarLancamento({ clienteId: 'cliente-1', valor: -6 }),
      criarLancamento({ clienteId: 'cliente-2', valor: 100 }),
    ]
    expect(calcularSaldo(lancamentos, 'cliente-1')).toBe(-6)
  })
})
