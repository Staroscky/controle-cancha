export type LancamentoFinanceiro = {
  id: string
  clienteId: string
  partidaId: string | null
  tipoId: string
  itemId: string | null
  valor: number
  descricao: string
  observacao?: string | null
  /** Correlaciona os N lançamentos de Consumo gerados por uma mesma divisão (rateio). */
  loteId?: string | null
  /** Preenchido só no lançamento de estorno: id do lançamento original que ele reverte. */
  estornaLancamentoId?: string | null
  criadoEm: string
}
