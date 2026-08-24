import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import type { Participacao } from '../types/Participacao'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'
import { calcularCreditoVitoria } from './calcularCreditoVitoria'

type LancamentoAGerar = Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>

/** Monta os lançamentos de débito/crédito do fechamento de uma partida (seções 7 a 9 de docs/regras.md). */
export function prepararLancamentosFechamentoPartida(
  participacoes: Participacao[],
  partidaId: string,
  equipeVencedoraId: string,
  valorPartidaPorCliente: number,
): LancamentoAGerar[] {
  if (valorPartidaPorCliente <= 0) return []

  const ativas = participacoes.filter((p) => p.status === 'ativo')
  const vencedores = ativas.filter((p) => p.equipeId === equipeVencedoraId)
  const perdedores = ativas.filter((p) => p.equipeId !== equipeVencedoraId)

  const debitos: LancamentoAGerar[] = perdedores.map((p) => ({
    clienteId: p.clienteId,
    partidaId,
    tipoId: TIPO_LANCAMENTO_IDS.debitoPartida,
    itemId: null,
    valor: -valorPartidaPorCliente,
    descricao: 'Cobrança de derrota',
  }))

  const creditoPorVencedor = calcularCreditoVitoria(
    perdedores.length,
    vencedores.length,
    valorPartidaPorCliente,
  )

  const creditos: LancamentoAGerar[] =
    creditoPorVencedor > 0
      ? vencedores.map((p) => ({
          clienteId: p.clienteId,
          partidaId,
          tipoId: TIPO_LANCAMENTO_IDS.creditoPartida,
          itemId: null,
          valor: creditoPorVencedor,
          descricao: 'Crédito de vitória',
        }))
      : []

  return [...debitos, ...creditos]
}
