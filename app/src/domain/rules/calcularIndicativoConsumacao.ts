import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { calcularConsumoRealNaPartida } from './calcularConsumoRealNaPartida'

/** Retorna o valor que falta para bater o mínimo, ou 0 se já foi atingido (nenhum indicativo a exibir). */
export function calcularIndicativoConsumacao(
  lancamentos: LancamentoFinanceiro[],
  clienteId: string,
  partidaId: string,
  valorMinimoConsumacao: number,
): number {
  if (valorMinimoConsumacao <= 0) return 0

  const consumoReal = calcularConsumoRealNaPartida(lancamentos, clienteId, partidaId)
  const faltante = valorMinimoConsumacao - consumoReal
  return faltante > 0 ? faltante : 0
}
