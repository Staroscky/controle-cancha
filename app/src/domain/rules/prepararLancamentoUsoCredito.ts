import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'

type LancamentoAGerar = Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>

/** Monta o lançamento de uso de crédito: reduz o saldo de quem cedeu parte do crédito
 * para ajudar a pagar a dívida de outro membro do grupo (seção 11.2 de docs/regras.md). */
export function prepararLancamentoUsoCredito(
  clienteId: string,
  valor: number,
  descricao: string,
): LancamentoAGerar | null {
  if (valor <= 0) return null

  return {
    clienteId,
    partidaId: null,
    tipoId: TIPO_LANCAMENTO_IDS.usoCredito,
    itemId: null,
    valor: -valor,
    descricao: descricao.trim() || 'Uso de crédito',
    observacao: null,
    loteId: null,
    estornaLancamentoId: null,
  }
}
