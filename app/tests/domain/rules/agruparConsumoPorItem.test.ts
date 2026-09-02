import { describe, expect, it } from 'vitest'
import { agruparConsumoPorItem } from '@/domain/rules/agruparConsumoPorItem'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

function criarLancamento(overrides: Partial<LancamentoFinanceiro> = {}): LancamentoFinanceiro {
  return {
    id: crypto.randomUUID(),
    clienteId: 'cliente-1',
    partidaId: null,
    tipoId: TIPO_LANCAMENTO_IDS.consumo,
    itemId: null,
    valor: 0,
    descricao: '',
    observacao: null,
    loteId: null,
    estornaLancamentoId: null,
    criadoEm: new Date(0).toISOString(),
    ...overrides,
  }
}

const CERVEJA_ID = 'item-cerveja'

describe('agruparConsumoPorItem', () => {
  it('retorna lista vazia quando não há consumo', () => {
    expect(agruparConsumoPorItem([], [])).toEqual([])
  })

  it('agrupa unidades cheias do mesmo item, somando quantidade e valor total', () => {
    const lancamentos = [
      criarLancamento({ itemId: CERVEJA_ID, descricao: 'Cerveja', valor: -6 }),
      criarLancamento({ itemId: CERVEJA_ID, descricao: 'Cerveja', valor: -6 }),
    ]
    expect(agruparConsumoPorItem(lancamentos, lancamentos)).toEqual([
      { chave: CERVEJA_ID, rotulo: '2× Cerveja', valorTotal: -12 },
    ])
  })

  it('agrupa lançamento avulso (sem itemId) por descrição + valor unitário', () => {
    const lancamentos = [criarLancamento({ itemId: null, descricao: 'Água de coco', valor: -8 })]
    expect(agruparConsumoPorItem(lancamentos, lancamentos)).toEqual([
      { chave: 'avulso:Água de coco:-8', rotulo: '1× Água de coco', valorTotal: -8 },
    ])
  })

  it('um item dividido mantém a fração original, sem virar "quantidade ×"', () => {
    const lancamentos = [
      criarLancamento({
        id: 'div-1',
        itemId: CERVEJA_ID,
        descricao: '1/2 Cerveja',
        valor: -3,
        loteId: 'lote-1',
      }),
    ]
    expect(agruparConsumoPorItem(lancamentos, lancamentos)).toEqual([
      { chave: 'dividido:div-1', rotulo: '1/2 Cerveja', valorTotal: -3 },
    ])
  })

  it('duas divisões diferentes do mesmo item não se misturam nem com a unidade cheia', () => {
    const cheia = criarLancamento({ id: 'cheia', itemId: CERVEJA_ID, descricao: 'Cerveja', valor: -6 })
    const divisao1 = criarLancamento({
      id: 'div-1',
      itemId: CERVEJA_ID,
      descricao: '1/2 Cerveja',
      valor: -3,
      loteId: 'lote-1',
    })
    const divisao2 = criarLancamento({
      id: 'div-2',
      itemId: CERVEJA_ID,
      descricao: '1/3 Cerveja',
      valor: -2,
      loteId: 'lote-2',
    })
    const lancamentos = [cheia, divisao1, divisao2]

    expect(agruparConsumoPorItem(lancamentos, lancamentos)).toEqual([
      { chave: CERVEJA_ID, rotulo: '1× Cerveja', valorTotal: -6 },
      { chave: 'dividido:div-1', rotulo: '1/2 Cerveja', valorTotal: -3 },
      { chave: 'dividido:div-2', rotulo: '1/3 Cerveja', valorTotal: -2 },
    ])
  })

  it('exclui um consumo corrigido (estornado) e o próprio estorno do agrupamento', () => {
    const original = criarLancamento({ id: 'original', itemId: CERVEJA_ID, descricao: 'Cerveja', valor: -6 })
    const estorno = criarLancamento({
      id: 'estorno',
      itemId: CERVEJA_ID,
      descricao: 'Estorno: Cerveja',
      valor: 6,
      estornaLancamentoId: 'original',
    })
    const correcao = criarLancamento({ id: 'correcao', itemId: CERVEJA_ID, descricao: 'Cerveja', valor: -7 })
    const todos = [original, estorno, correcao]

    expect(agruparConsumoPorItem(todos, todos)).toEqual([{ chave: CERVEJA_ID, rotulo: '1× Cerveja', valorTotal: -7 }])
  })

  it('ignora lançamentos que não são de Consumo', () => {
    const lancamentos = [criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.debitoPartida, valor: -20 })]
    expect(agruparConsumoPorItem(lancamentos, lancamentos)).toEqual([])
  })
})
