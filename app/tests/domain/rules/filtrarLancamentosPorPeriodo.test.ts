import { describe, expect, it } from 'vitest'
import { filtrarLancamentosPorPeriodo } from '@/domain/rules/filtrarLancamentosPorPeriodo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'

const AGORA = new Date('2026-08-31T15:00:00.000Z')

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
    criadoEm: AGORA.toISOString(),
    ...overrides,
  }
}

describe('filtrarLancamentosPorPeriodo', () => {
  it('"tudo" retorna todos os lançamentos sem filtrar', () => {
    const lancamentos = [
      criarLancamento({ criadoEm: '2020-01-01T00:00:00.000Z' }),
      criarLancamento({ criadoEm: AGORA.toISOString() }),
    ]
    expect(filtrarLancamentosPorPeriodo(lancamentos, 'tudo', AGORA)).toHaveLength(2)
  })

  it('"hoje" mantém só os lançamentos do mesmo dia local de agora', () => {
    const deHoje = criarLancamento({ criadoEm: AGORA.toISOString(), descricao: 'hoje' })
    const deOntem = criarLancamento({ criadoEm: '2026-08-30T15:00:00.000Z', descricao: 'ontem' })

    const filtrados = filtrarLancamentosPorPeriodo([deHoje, deOntem], 'hoje', AGORA)

    expect(filtrados.map((l) => l.descricao)).toEqual(['hoje'])
  })

  it('"7dias" inclui lançamentos dos últimos 7 dias e exclui os mais antigos', () => {
    const dentro = criarLancamento({ criadoEm: '2026-08-25T15:00:00.000Z', descricao: 'dentro' })
    const fora = criarLancamento({ criadoEm: '2026-08-20T15:00:00.000Z', descricao: 'fora' })

    const filtrados = filtrarLancamentosPorPeriodo([dentro, fora], '7dias', AGORA)

    expect(filtrados.map((l) => l.descricao)).toEqual(['dentro'])
  })

  it('"30dias" inclui lançamentos dos últimos 30 dias e exclui os mais antigos', () => {
    const dentro = criarLancamento({ criadoEm: '2026-08-05T15:00:00.000Z', descricao: 'dentro' })
    const fora = criarLancamento({ criadoEm: '2026-07-01T15:00:00.000Z', descricao: 'fora' })

    const filtrados = filtrarLancamentosPorPeriodo([dentro, fora], '30dias', AGORA)

    expect(filtrados.map((l) => l.descricao)).toEqual(['dentro'])
  })
})
