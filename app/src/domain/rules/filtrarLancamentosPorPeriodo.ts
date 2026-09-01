import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { chaveDoDia } from './agruparLancamentosPorDia'

export type PeriodoEstatisticas = 'hoje' | '7dias' | '30dias' | 'tudo'

/** Filtra lançamentos para a página de Estatísticas: 'hoje' compara pelo dia local (mesma regra
 * do extrato, ver chaveDoDia); os demais períodos usam uma janela corrida de dias a partir de agora. */
export function filtrarLancamentosPorPeriodo(
  lancamentos: LancamentoFinanceiro[],
  periodo: PeriodoEstatisticas,
  agora: Date = new Date(),
): LancamentoFinanceiro[] {
  if (periodo === 'tudo') return lancamentos

  if (periodo === 'hoje') {
    const hoje = chaveDoDia(agora.toISOString())
    return lancamentos.filter((l) => chaveDoDia(l.criadoEm) === hoje)
  }

  const dias = periodo === '7dias' ? 7 : 30
  const limite = new Date(agora)
  limite.setDate(limite.getDate() - dias)
  return lancamentos.filter((l) => new Date(l.criadoEm) >= limite)
}
