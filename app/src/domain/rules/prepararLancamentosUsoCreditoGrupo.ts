import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { prepararLancamentoUsoCredito } from './prepararLancamentoUsoCredito'
import type { ItemPagamentoGrupo } from './prepararLancamentosPagamentoGrupo'

type LancamentoAGerar = Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>

/** Monta um lançamento de uso de crédito por membro do grupo que cedeu parte do saldo
 * positivo para ajudar a pagar a dívida de outro membro (seção 11.2 de docs/regras.md). */
export function prepararLancamentosUsoCreditoGrupo(
  itens: ItemPagamentoGrupo[],
  descricao: string,
): LancamentoAGerar[] {
  return itens
    .map((item) => prepararLancamentoUsoCredito(item.clienteId, item.valor, descricao))
    .filter((lancamento): lancamento is LancamentoAGerar => lancamento !== null)
}
