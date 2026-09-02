import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  agruparLancamentosPorDia,
  agruparLancamentosPorDiaComHoje,
  chaveDoDia,
} from '@/domain/rules/agruparLancamentosPorDia'
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

describe('agruparLancamentosPorDia', () => {
  it('retorna lista vazia quando não há lançamentos', () => {
    expect(agruparLancamentosPorDia([])).toEqual([])
  })

  it('agrupa lançamentos do mesmo dia em um único grupo com o saldo somado', () => {
    const lancamentos = [
      criarLancamento({ valor: -10, criadoEm: '2026-08-25T10:00:00.000Z' }),
      criarLancamento({ valor: -5, criadoEm: '2026-08-25T18:00:00.000Z' }),
    ]

    const grupos = agruparLancamentosPorDia(lancamentos)

    expect(grupos).toHaveLength(1)
    expect(grupos[0].lancamentos).toHaveLength(2)
    expect(grupos[0].saldoAnterior).toBe(0)
    expect(grupos[0].saldoDoDia).toBe(-15)
  })

  it('separa lançamentos de dias diferentes em grupos distintos, acumulando o saldo do dia anterior', () => {
    const lancamentos = [
      criarLancamento({ valor: 20, criadoEm: '2026-08-26T10:00:00.000Z' }),
      criarLancamento({ valor: -10, criadoEm: '2026-08-25T10:00:00.000Z' }),
    ]

    const grupos = agruparLancamentosPorDia(lancamentos)

    expect(grupos).toHaveLength(2)
    expect(grupos[0].saldoAnterior).toBe(0)
    expect(grupos[0].saldoDoDia).toBe(-10)
    expect(grupos[1].saldoAnterior).toBe(-10)
    expect(grupos[1].saldoDoDia).toBe(10)
  })

  it('mantém a ordem dos lançamentos dentro do grupo do mais antigo para o mais recente', () => {
    const primeiro = criarLancamento({ descricao: 'primeiro', criadoEm: '2026-08-25T09:00:00.000Z' })
    const segundo = criarLancamento({ descricao: 'segundo', criadoEm: '2026-08-25T20:00:00.000Z' })

    const grupos = agruparLancamentosPorDia([segundo, primeiro])

    expect(grupos[0].lancamentos.map((l) => l.descricao)).toEqual(['primeiro', 'segundo'])
  })
})

describe('agruparLancamentosPorDiaComHoje', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T12:00:00.000'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('injeta um grupo vazio de hoje quando o último grupo real não é de hoje', () => {
    const lancamentos = [criarLancamento({ valor: -10, criadoEm: '2026-08-25T10:00:00.000' })]

    const grupos = agruparLancamentosPorDiaComHoje(lancamentos, -10)

    expect(grupos).toHaveLength(2)
    expect(grupos[1]).toEqual({ data: '2026-08-26', lancamentos: [], saldoAnterior: -10, saldoDoDia: -10 })
  })

  it('injeta um grupo vazio de hoje mesmo sem nenhum lançamento', () => {
    const grupos = agruparLancamentosPorDiaComHoje([], 0)

    expect(grupos).toEqual([{ data: '2026-08-26', lancamentos: [], saldoAnterior: 0, saldoDoDia: 0 }])
  })

  it('não injeta grupo extra quando já há lançamentos hoje', () => {
    const lancamentos = [criarLancamento({ valor: -10, criadoEm: '2026-08-26T10:00:00.000' })]

    const grupos = agruparLancamentosPorDiaComHoje(lancamentos, -10)

    expect(grupos).toHaveLength(1)
    expect(grupos[0].data).toBe('2026-08-26')
  })
})

describe('chaveDoDia', () => {
  it('retorna a chave yyyy-mm-dd no fuso local, ignorando o horário', () => {
    const chave = chaveDoDia('2026-08-25T09:00:00.000')
    expect(chave).toBe('2026-08-25')
  })

  it('gera a mesma chave para horários diferentes do mesmo dia', () => {
    expect(chaveDoDia('2026-08-25T00:00:00.000')).toBe(chaveDoDia('2026-08-25T23:59:59.000'))
  })
})
