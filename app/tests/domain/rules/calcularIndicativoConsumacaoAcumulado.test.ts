import { describe, expect, it } from 'vitest'
import { calcularIndicativoConsumacaoAcumulado } from '@/domain/rules/calcularIndicativoConsumacaoAcumulado'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import type { Participacao } from '@/domain/types/Participacao'
import type { Partida } from '@/domain/types/Partida'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

const CLIENTE_1 = 'cliente-1'

function criarPartida(id: string, valorMinimoConsumacao: number): Partida {
  return {
    id,
    dataHora: new Date(0).toISOString(),
    equipeVencedoraId: null,
    status: 'concluida',
    valorMinimoConsumacao,
    valorPartidaPorCliente: 0,
    conjuntoId: null,
  }
}

function criarParticipacao(clienteId: string, partidaId: string): Participacao {
  return {
    id: crypto.randomUUID(),
    clienteId,
    partidaId,
    equipeId: 'azul',
    lado: null,
    entrada: new Date(0).toISOString(),
    saida: null,
    status: 'ativo',
  }
}

function criarLancamentoConsumo(clienteId: string, partidaId: string, valorConsumido: number): LancamentoFinanceiro {
  return {
    id: crypto.randomUUID(),
    clienteId,
    partidaId,
    tipoId: TIPO_LANCAMENTO_IDS.consumo,
    itemId: null,
    valor: -valorConsumido,
    descricao: '',
    criadoEm: new Date(0).toISOString(),
  }
}

describe('calcularIndicativoConsumacaoAcumulado', () => {
  it('soma o mínimo de todas as partidas em que o cliente participou (3 partidas de R$5 = R$15)', () => {
    const partidas = [
      criarPartida('partida-1', 5),
      criarPartida('partida-2', 5),
      criarPartida('partida-3', 5),
    ]
    const participacoes = [
      criarParticipacao(CLIENTE_1, 'partida-1'),
      criarParticipacao(CLIENTE_1, 'partida-2'),
      criarParticipacao(CLIENTE_1, 'partida-3'),
    ]

    const indicativo = calcularIndicativoConsumacaoAcumulado([], participacoes, partidas, CLIENTE_1)

    expect(indicativo).toBe(15)
  })

  it('desconta o consumo real vinculado a qualquer uma das partidas do total mínimo', () => {
    const partidas = [criarPartida('partida-1', 5), criarPartida('partida-2', 5)]
    const participacoes = [
      criarParticipacao(CLIENTE_1, 'partida-1'),
      criarParticipacao(CLIENTE_1, 'partida-2'),
    ]
    const lancamentos = [
      criarLancamentoConsumo(CLIENTE_1, 'partida-1', 4),
      criarLancamentoConsumo(CLIENTE_1, 'partida-2', 3),
    ]

    const indicativo = calcularIndicativoConsumacaoAcumulado(
      lancamentos,
      participacoes,
      partidas,
      CLIENTE_1,
    )

    expect(indicativo).toBe(3)
  })

  it('retorna 0 quando o consumo acumulado já bateu ou passou do mínimo acumulado', () => {
    const partidas = [criarPartida('partida-1', 5), criarPartida('partida-2', 5)]
    const participacoes = [
      criarParticipacao(CLIENTE_1, 'partida-1'),
      criarParticipacao(CLIENTE_1, 'partida-2'),
    ]
    const lancamentos = [criarLancamentoConsumo(CLIENTE_1, 'partida-1', 20)]

    const indicativo = calcularIndicativoConsumacaoAcumulado(
      lancamentos,
      participacoes,
      partidas,
      CLIENTE_1,
    )

    expect(indicativo).toBe(0)
  })

  it('ignora partidas e consumo de outros clientes', () => {
    const partidas = [criarPartida('partida-1', 5)]
    const participacoes = [
      criarParticipacao(CLIENTE_1, 'partida-1'),
      criarParticipacao('outro-cliente', 'partida-1'),
    ]
    const lancamentos = [criarLancamentoConsumo('outro-cliente', 'partida-1', 100)]

    const indicativo = calcularIndicativoConsumacaoAcumulado(
      lancamentos,
      participacoes,
      partidas,
      CLIENTE_1,
    )

    expect(indicativo).toBe(5)
  })

  it('não conta a mesma partida duas vezes quando há mais de uma participação nela', () => {
    const partidas = [criarPartida('partida-1', 5)]
    const participacoes = [
      criarParticipacao(CLIENTE_1, 'partida-1'),
      criarParticipacao(CLIENTE_1, 'partida-1'),
    ]

    const indicativo = calcularIndicativoConsumacaoAcumulado([], participacoes, partidas, CLIENTE_1)

    expect(indicativo).toBe(5)
  })

  it('retorna 0 quando o cliente não participou de nenhuma partida', () => {
    expect(calcularIndicativoConsumacaoAcumulado([], [], [], CLIENTE_1)).toBe(0)
  })

  it('retorna 0 quando o mínimo acumulado é 0 (todas as partidas com mínimo 0)', () => {
    const partidas = [criarPartida('partida-1', 0)]
    const participacoes = [criarParticipacao(CLIENTE_1, 'partida-1')]

    expect(calcularIndicativoConsumacaoAcumulado([], participacoes, partidas, CLIENTE_1)).toBe(0)
  })
})
