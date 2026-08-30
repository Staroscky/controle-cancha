export type LancamentoFinanceiro = {
  id: string
  clienteId: string
  partidaId: string | null
  tipoId: string
  itemId: string | null
  valor: number
  descricao: string
  observacao?: string | null
  criadoEm: string
}
