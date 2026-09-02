import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'
import { lancamentoEstaCorrigido } from './lancamentoEstaCorrigido'

export type ConsumoAgrupado = {
  chave: string
  rotulo: string
  valorTotal: number
}

type GrupoInterno = {
  descricao: string
  quantidade: number
  valorTotal: number
  dividido: boolean
}

/**
 * Agrupa os lançamentos de Consumo ativos (não estornados/corrigidos, seção 11.3 de
 * docs/regras.md) pro formato "quantidade × item" da comanda consolidada (seção 06) — mas só pra
 * unidades cheias (mesmo itemId, ou descrição + valor quando avulso). Um item dividido (`loteId`
 * preenchido, seção 10) fica na sua própria linha, com a fração original ("1/N <item>") intacta,
 * sem se misturar com outras divisões nem com unidades cheias do mesmo item: "quantidade" e preço
 * unitário não fazem sentido pra uma fração, e somar isso mascararia o valor real de cada divisão —
 * é assim que uma comanda de bar real mantém a rachadinha visível pro cliente conferir.
 */
export function agruparConsumoPorItem(
  lancamentos: LancamentoFinanceiro[],
  todosLancamentos: LancamentoFinanceiro[],
): ConsumoAgrupado[] {
  const ativos = lancamentos.filter(
    (l) =>
      l.tipoId === TIPO_LANCAMENTO_IDS.consumo &&
      !l.estornaLancamentoId &&
      !lancamentoEstaCorrigido(l, todosLancamentos),
  )

  const grupos = new Map<string, GrupoInterno>()
  for (const lancamento of ativos) {
    if (lancamento.loteId) {
      grupos.set(`dividido:${lancamento.id}`, {
        descricao: lancamento.descricao,
        quantidade: 1,
        valorTotal: lancamento.valor,
        dividido: true,
      })
      continue
    }

    const chave = lancamento.itemId ?? `avulso:${lancamento.descricao}:${lancamento.valor}`
    const grupo = grupos.get(chave)
    if (grupo) {
      grupo.quantidade += 1
      grupo.valorTotal += lancamento.valor
    } else {
      grupos.set(chave, {
        descricao: lancamento.descricao,
        quantidade: 1,
        valorTotal: lancamento.valor,
        dividido: false,
      })
    }
  }

  return [...grupos.entries()].map(([chave, grupo]) => ({
    chave,
    rotulo: grupo.dividido ? grupo.descricao : `${grupo.quantidade}× ${grupo.descricao}`,
    valorTotal: grupo.valorTotal,
  }))
}
