import { describe, expect, it } from 'vitest'
import { prepararLancamentosFechamentoPartida } from '@/domain/rules/prepararLancamentosFechamentoPartida'
import type { Participacao, StatusParticipacao } from '@/domain/types/Participacao'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

const PARTIDA_ID = 'partida-1'
const AZUL = 'azul'
const AMARELA = 'amarela'

function criarParticipacao(overrides: Partial<Participacao> = {}): Participacao {
  return {
    id: crypto.randomUUID(),
    clienteId: crypto.randomUUID(),
    partidaId: PARTIDA_ID,
    equipeId: AZUL,
    lado: null,
    entrada: new Date(0).toISOString(),
    saida: null,
    status: 'ativo',
    ...overrides,
  }
}

function criarTime(equipeId: string, quantidade: number, status: StatusParticipacao = 'ativo'): Participacao[] {
  return Array.from({ length: quantidade }, () => criarParticipacao({ equipeId, status }))
}

describe('prepararLancamentosFechamentoPartida', () => {
  it('partida 4x4 com valor R$ 6 gera 4 débitos de -6 e 4 créditos de +6 (seção 7)', () => {
    const participacoes = [...criarTime(AZUL, 4), ...criarTime(AMARELA, 4)]

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 6, 1)

    const debitos = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.debitoPartida)
    const creditos = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.creditoPartida)

    expect(debitos).toHaveLength(4)
    expect(debitos.every((l) => l.valor === -6 && l.partidaId === PARTIDA_ID)).toBe(true)
    expect(creditos).toHaveLength(4)
    expect(creditos.every((l) => l.valor === 6 && l.partidaId === PARTIDA_ID)).toBe(true)
  })

  it('partida 8x4 (8 vencedores x 4 perdedores) gera 4 débitos de -6 e 8 créditos de +3 (seção 9)', () => {
    const participacoes = [...criarTime(AZUL, 8), ...criarTime(AMARELA, 4)]

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 6, 1)

    const debitos = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.debitoPartida)
    const creditos = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.creditoPartida)

    expect(debitos).toHaveLength(4)
    expect(debitos.every((l) => l.valor === -6)).toBe(true)
    expect(creditos).toHaveLength(8)
    expect(creditos.every((l) => l.valor === 3)).toBe(true)
  })

  it('valorPartidaPorCliente = 0 não gera nenhum lançamento (seção 12)', () => {
    const participacoes = [...criarTime(AZUL, 4), ...criarTime(AMARELA, 4)]

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 0, 1)

    expect(lancamentos).toEqual([])
  })

  it('participante com status "saiu" não entra na divisão nem gera lançamento (seção 3)', () => {
    const participacoes = [
      ...criarTime(AZUL, 3),
      criarParticipacao({ equipeId: AZUL, status: 'saiu' }),
      ...criarTime(AMARELA, 4),
    ]

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 6, 1)

    const creditos = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.creditoPartida)
    expect(creditos).toHaveLength(3)
  })

  it('perdedor que saiu antes do fechamento não gera débito nem entra no crédito total', () => {
    const participacoes = [
      ...criarTime(AZUL, 4),
      ...criarTime(AMARELA, 3),
      criarParticipacao({ equipeId: AMARELA, status: 'saiu' }),
    ]

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 6, 1)

    const debitos = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.debitoPartida)
    const creditos = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.creditoPartida)
    expect(debitos).toHaveLength(3)
    expect(creditos.every((l) => l.valor === 18 / 4)).toBe(true)
  })

  it('time perdedor vazio: sem débitos e sem créditos (nada a distribuir)', () => {
    const participacoes = criarTime(AZUL, 4)

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 6, 1)

    expect(lancamentos).toEqual([])
  })

  it('time vencedor vazio: perdedores ainda geram débito, mas nenhum crédito é distribuído', () => {
    const participacoes = criarTime(AMARELA, 4)

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 6, 1)

    expect(lancamentos).toHaveLength(4)
    expect(lancamentos.every((l) => l.tipoId === TIPO_LANCAMENTO_IDS.debitoPartida && l.valor === -6)).toBe(
      true,
    )
  })

  it('débito e crédito recebem observação automática com o número da partida do dia', () => {
    const participacoes = [...criarTime(AZUL, 4), ...criarTime(AMARELA, 4)]

    const lancamentos = prepararLancamentosFechamentoPartida(participacoes, PARTIDA_ID, AZUL, 6, 3)

    expect(lancamentos.every((l) => l.observacao === 'Partida #3')).toBe(true)
  })
})
