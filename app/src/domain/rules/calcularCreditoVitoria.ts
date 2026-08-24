/** Crédito de vitória recebido por cada vencedor ativo (seção 7 de docs/regras.md). */
export function calcularCreditoVitoria(
  quantidadePerdedoresAtivos: number,
  quantidadeVencedoresAtivos: number,
  valorPartidaPorCliente: number,
): number {
  if (quantidadeVencedoresAtivos === 0) return 0

  const creditoTotalDaPartida = quantidadePerdedoresAtivos * valorPartidaPorCliente
  return creditoTotalDaPartida / quantidadeVencedoresAtivos
}
