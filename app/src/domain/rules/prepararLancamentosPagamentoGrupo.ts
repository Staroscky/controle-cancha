import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { prepararLancamentoPagamento } from './prepararLancamentoPagamento'

type LancamentoAGerar = Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>

export type ItemPagamentoGrupo = {
  clienteId: string
  valor: number
}

/** Monta um lançamento de pagamento por membro do grupo, a partir de uma única revisão (seção 11.1 de docs/regras.md). */
export function prepararLancamentosPagamentoGrupo(
  itens: ItemPagamentoGrupo[],
  descricao: string,
): LancamentoAGerar[] {
  return itens
    .map((item) => prepararLancamentoPagamento(item.clienteId, item.valor, descricao))
    .filter((lancamento): lancamento is LancamentoAGerar => lancamento !== null)
}
