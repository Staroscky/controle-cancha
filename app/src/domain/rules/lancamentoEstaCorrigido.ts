import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'

/** true quando algum outro lançamento estorna este (seção 11.3 de docs/regras.md) — só a linha mais atual de uma cadeia de correção pode ser corrigida de novo. */
export function lancamentoEstaCorrigido(lancamento: LancamentoFinanceiro, todos: LancamentoFinanceiro[]): boolean {
  return todos.some((l) => l.estornaLancamentoId === lancamento.id)
}
