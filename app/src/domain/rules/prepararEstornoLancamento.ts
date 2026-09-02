import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'

type LancamentoAGerar = Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>

/** Monta o estorno de um lançamento existente — nunca edita nem exclui o original (seção 11.3 de docs/regras.md). */
export function prepararEstornoLancamento(original: LancamentoFinanceiro): LancamentoAGerar {
  return {
    clienteId: original.clienteId,
    partidaId: original.partidaId,
    tipoId: original.tipoId,
    itemId: original.itemId,
    loteId: original.loteId,
    valor: -original.valor,
    descricao: `Estorno: ${original.descricao}`,
    observacao: original.observacao,
    estornaLancamentoId: original.id,
  }
}
