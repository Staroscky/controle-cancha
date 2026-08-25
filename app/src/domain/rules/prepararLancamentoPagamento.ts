import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'

type LancamentoAGerar = Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>

/** Monta o lançamento de pagamento (acerto geral do cliente, seção 11.1 de docs/regras.md). */
export function prepararLancamentoPagamento(
  clienteId: string,
  valor: number,
  descricao: string,
): LancamentoAGerar | null {
  if (valor <= 0) return null

  return {
    clienteId,
    partidaId: null,
    tipoId: TIPO_LANCAMENTO_IDS.pagamento,
    itemId: null,
    valor,
    descricao: descricao.trim() || 'Pagamento',
  }
}
