import type { ItemPagamentoGrupo } from './prepararLancamentosPagamentoGrupo'

export type SaldoDevedor = {
  clienteId: string
  valorDevido: number
}

/**
 * Distribui um valor único pago pelo grupo entre os devedores, abatendo primeiro de quem deve
 * mais para quem deve menos. Se o valor não cobrir todo mundo, quem deve menos fica com o
 * lançamento parcial ou de fora (seção 11.1 de docs/regras.md).
 */
export function alocarPagamentoGrupo(
  devedores: SaldoDevedor[],
  valorPago: number,
): ItemPagamentoGrupo[] {
  if (valorPago <= 0) return []

  const ordenados = [...devedores].sort((a, b) => b.valorDevido - a.valorDevido)

  let restante = valorPago
  const itens: ItemPagamentoGrupo[] = []

  for (const devedor of ordenados) {
    if (restante <= 0) break
    if (devedor.valorDevido <= 0) continue

    const valor = Math.min(restante, devedor.valorDevido)
    itens.push({ clienteId: devedor.clienteId, valor })
    restante -= valor
  }

  return itens
}
