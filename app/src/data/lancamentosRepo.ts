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

export function removerLancamentosDoCliente(clienteId: string): void {
  setItem(CHAVE, listarLancamentos().filter((l) => l.clienteId !== clienteId))
}
