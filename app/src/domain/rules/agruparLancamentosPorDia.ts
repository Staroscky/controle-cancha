import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'

export type GrupoLancamentosPorDia = {
  data: string
  lancamentos: LancamentoFinanceiro[]
  saldoAnterior: number
  saldoDoDia: number
}

export function chaveDoDia(criadoEm: string): string {
  const data = new Date(criadoEm)
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/**
 * Agrupa lançamentos por dia (ordem crescente). Cada grupo traz o saldo acumulado até o início
 * do dia (`saldoAnterior`) e até o fim do dia (`saldoDoDia`), como num extrato bancário.
 */
export function agruparLancamentosPorDia(lancamentos: LancamentoFinanceiro[]): GrupoLancamentosPorDia[] {
  const ordenados = [...lancamentos].sort((a, b) => {
    if (a.criadoEm < b.criadoEm) return -1
    if (a.criadoEm > b.criadoEm) return 1
    return 0
  })

  const grupos = new Map<string, LancamentoFinanceiro[]>()
  for (const lancamento of ordenados) {
    const chave = chaveDoDia(lancamento.criadoEm)
    const grupo = grupos.get(chave)
    if (grupo) {
      grupo.push(lancamento)
    } else {
      grupos.set(chave, [lancamento])
    }
  }

  let saldoAcumulado = 0
  return [...grupos.entries()].map(([data, itens]) => {
    const saldoAnterior = saldoAcumulado
    saldoAcumulado += itens.reduce((soma, l) => soma + l.valor, 0)
    return {
      data,
      lancamentos: itens,
      saldoAnterior,
      saldoDoDia: saldoAcumulado,
    }
  })
}
