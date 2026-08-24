import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'

export function calcularSaldo(lancamentos: LancamentoFinanceiro[], clienteId: string): number {
  return lancamentos
    .filter((l) => l.clienteId === clienteId)
    .reduce((soma, l) => soma + l.valor, 0)
}
