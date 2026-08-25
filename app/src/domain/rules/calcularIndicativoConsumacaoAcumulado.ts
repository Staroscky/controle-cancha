import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import type { Participacao } from '../types/Participacao'
import type { Partida } from '../types/Partida'
import { calcularConsumoRealNaPartida } from './calcularConsumoRealNaPartida'

/**
 * Soma o mínimo de consumação de todas as partidas em que o cliente participou e compara
 * com o consumo real vinculado a essas partidas (seção 7 de docs/regras.md).
 */
export function calcularIndicativoConsumacaoAcumulado(
  lancamentos: LancamentoFinanceiro[],
  participacoes: Participacao[],
  partidas: Partida[],
  clienteId: string,
): number {
  const partidaIds = [
    ...new Set(participacoes.filter((p) => p.clienteId === clienteId).map((p) => p.partidaId)),
  ]

  const minimoTotal = partidas
    .filter((p) => partidaIds.includes(p.id))
    .reduce((soma, p) => soma + p.valorMinimoConsumacao, 0)

  if (minimoTotal <= 0) return 0

  const consumoReal = partidaIds.reduce(
    (soma, partidaId) => soma + calcularConsumoRealNaPartida(lancamentos, clienteId, partidaId),
    0,
  )

  const faltante = minimoTotal - consumoReal
  return faltante > 0 ? faltante : 0
}
