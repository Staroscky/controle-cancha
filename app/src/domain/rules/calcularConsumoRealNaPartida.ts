import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'
import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'

export function calcularConsumoRealNaPartida(
  lancamentos: LancamentoFinanceiro[],
  clienteId: string,
  partidaId: string,
): number {
  return lancamentos
    .filter(
      (l) =>
        l.clienteId === clienteId &&
        l.partidaId === partidaId &&
        l.tipoId === TIPO_LANCAMENTO_IDS.consumo,
    )
    .reduce((soma, l) => soma + Math.abs(l.valor), 0)
}
