import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'

export type ResumoFinanceiro = {
  faturamentoConsumo: number
  recebidoEmCaixa: number
  quantidadeVendas: number
  ticketMedio: number
}

function arredondar(valor: number): number {
  // `|| 0` normaliza -0 (ex.: soma de valores que se cancelam) para 0.
  return Math.round(valor * 100) / 100 || 0
}

/**
 * Resume o movimento financeiro de um período. Consumo é a única receita real do estabelecimento
 * — Débito partida / Crédito partida (seção 7 de docs/regras.md) é dinheiro transferido entre os
 * próprios clientes (perdedor paga, vencedor recebe o mesmo total dividido) e por isso se anula no
 * agregado, então fica fora daqui. Estornos têm o mesmo tipoId do lançamento original com o valor
 * invertido, então já se cancelam nas somas abaixo.
 */
export function calcularResumoFinanceiro(lancamentos: LancamentoFinanceiro[]): ResumoFinanceiro {
  const consumo = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.consumo)
  const faturamentoConsumo = -consumo.reduce((soma, l) => soma + l.valor, 0)
  const recebidoEmCaixa = lancamentos
    .filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.pagamento)
    .reduce((soma, l) => soma + l.valor, 0)

  // Cada compra (dividida ou não, seção 10) conta como uma venda, não uma por participante.
  // Uma compra que foi estornada depois não conta (o estorno tem o mesmo tipoId e aponta pra ela
  // via estornaLancamentoId, então não basta olhar o sinal do valor).
  const idsEstornados = new Set(consumo.map((l) => l.estornaLancamentoId).filter(Boolean))
  const quantidadeVendas = new Set(
    consumo.filter((l) => l.valor < 0 && !idsEstornados.has(l.id)).map((l) => l.loteId ?? l.id),
  ).size

  return {
    faturamentoConsumo: arredondar(faturamentoConsumo),
    recebidoEmCaixa: arredondar(recebidoEmCaixa),
    quantidadeVendas,
    ticketMedio: quantidadeVendas > 0 ? arredondar(faturamentoConsumo / quantidadeVendas) : 0,
  }
}
