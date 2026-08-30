import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'

export function calcularSaldo(lancamentos: LancamentoFinanceiro[], clienteId: string): number {
  const soma = lancamentos
    .filter((l) => l.clienteId === clienteId)
    .reduce((soma, l) => soma + l.valor, 0)
  // Soma de vários lançamentos em ponto flutuante pode deixar ruído nas casas bem além do
  // centavo (ex.: 0.1 + 0.2 = 0.30000000000000004) — arredonda pra exibir e comparar saldo
  // de forma confiável.
  return Math.round(soma * 100) / 100
}
