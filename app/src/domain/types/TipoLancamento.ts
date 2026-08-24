export type TipoLancamentoNome = 'Consumo' | 'Crédito partida' | 'Débito partida' | 'Pagamento'

export type TipoLancamento = {
  id: string
  nome: TipoLancamentoNome
}

export const TIPO_LANCAMENTO_IDS = {
  consumo: 'consumo',
  creditoPartida: 'credito-partida',
  debitoPartida: 'debito-partida',
  pagamento: 'pagamento',
} as const

export const TIPOS_LANCAMENTO: TipoLancamento[] = [
  { id: TIPO_LANCAMENTO_IDS.consumo, nome: 'Consumo' },
  { id: TIPO_LANCAMENTO_IDS.creditoPartida, nome: 'Crédito partida' },
  { id: TIPO_LANCAMENTO_IDS.debitoPartida, nome: 'Débito partida' },
  { id: TIPO_LANCAMENTO_IDS.pagamento, nome: 'Pagamento' },
]

