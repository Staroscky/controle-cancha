import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'

type LancamentoAGerar = Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Monta os lançamentos de consumo divididos entre os clientes selecionados (seção 10 de docs/regras.md). */
export function prepararLancamentosConsumo(
  clienteIds: string[],
  descricaoItem: string,
  valorTotal: number,
  itemId: string | null,
  obterPartidaIdDoCliente: (clienteId: string) => string | null,
): LancamentoAGerar[] {
  if (clienteIds.length === 0 || valorTotal <= 0) return []

  const quantidade = clienteIds.length
  const descricao = quantidade === 1 ? descricaoItem : `1/${quantidade} ${descricaoItem}`
  const valor = -(valorTotal / quantidade)
  // Item dividido não deixa óbvio o valor total pago — a observação registra isso automaticamente.
  const observacao = quantidade > 1 ? `Valor original: ${formatoMoeda.format(valorTotal)}` : null

  return clienteIds.map((clienteId) => ({
    clienteId,
    partidaId: obterPartidaIdDoCliente(clienteId),
    tipoId: TIPO_LANCAMENTO_IDS.consumo,
    itemId,
    valor,
    descricao,
    observacao,
  }))
}
