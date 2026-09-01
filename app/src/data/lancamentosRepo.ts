import type { LancamentoFinanceiro } from '../domain/types/LancamentoFinanceiro'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:lancamentos'

export function listarLancamentos(): LancamentoFinanceiro[] {
  return getItem<LancamentoFinanceiro[]>(CHAVE, [])
}

export function listarLancamentosPorCliente(clienteId: string): LancamentoFinanceiro[] {
  return listarLancamentos().filter((l) => l.clienteId === clienteId)
}

export function listarLancamentosPorPartida(partidaId: string): LancamentoFinanceiro[] {
  return listarLancamentos().filter((l) => l.partidaId === partidaId)
}

export function listarLancamentosPorLote(loteId: string): LancamentoFinanceiro[] {
  return listarLancamentos().filter((l) => l.loteId === loteId)
}

/** Apaga o histórico financeiro de um cliente (seção 11 de docs/regras.md). Só remove os
 * lançamentos dele — se algum era de um item dividido com outros clientes (loteId), a parte dos
 * outros continua intacta. */
export function removerLancamentosDoCliente(clienteId: string): void {
  setItem(CHAVE, listarLancamentos().filter((l) => l.clienteId !== clienteId))
}

export function adicionarLancamento(
  lancamento: Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>,
): LancamentoFinanceiro {
  const novo: LancamentoFinanceiro = {
    ...lancamento,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  }
  setItem(CHAVE, [...listarLancamentos(), novo])
  return novo
}
