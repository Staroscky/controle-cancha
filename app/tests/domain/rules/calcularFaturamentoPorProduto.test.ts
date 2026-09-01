import { describe, expect, it } from 'vitest'
import { calcularFaturamentoPorProduto } from '@/domain/rules/calcularFaturamentoPorProduto'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
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
    criadoEm: new Date(0).toISOString(),
    ...overrides,
  }
}

const CERVEJA: ItemConsumo = { id: 'item-cerveja', nome: 'Cerveja', valor: 10, categoriaId: null }
const AGUA: ItemConsumo = { id: 'item-agua', nome: 'Água', valor: 5, categoriaId: null }

describe('calcularFaturamentoPorProduto', () => {
  it('retorna lista vazia quando não há consumo', () => {
    expect(calcularFaturamentoPorProduto([], [CERVEJA])).toEqual([])
  })

  it('soma o faturamento por item e ordena do maior para o menor', () => {
    const lancamentos = [
      criarLancamento({ itemId: CERVEJA.id, valor: -10 }),
      criarLancamento({ itemId: CERVEJA.id, valor: -10 }),
      criarLancamento({ itemId: AGUA.id, valor: -5 }),
    ]
    const resultado = calcularFaturamentoPorProduto(lancamentos, [CERVEJA, AGUA])
    expect(resultado).toEqual([
      { itemId: CERVEJA.id, nome: 'Cerveja', faturamento: 20, vendas: 2 },
      { itemId: AGUA.id, nome: 'Água', faturamento: 5, vendas: 1 },
    ])
  })

  it('um estorno cancela a venda original e o item some do ranking', () => {
    const lancamentos = [
      criarLancamento({ itemId: CERVEJA.id, valor: -10 }),
      criarLancamento({ itemId: CERVEJA.id, valor: 10, estornaLancamentoId: 'x' }),
    ]
    expect(calcularFaturamentoPorProduto(lancamentos, [CERVEJA])).toEqual([])
  })

  it('estorno parcial: a venda estornada não conta, mas as outras vendas do mesmo produto continuam', () => {
    const lancamentos = [
      criarLancamento({ itemId: CERVEJA.id, valor: -10 }),
      criarLancamento({ itemId: CERVEJA.id, valor: -10, id: 'venda-2' }),
      criarLancamento({ itemId: CERVEJA.id, valor: 10, estornaLancamentoId: 'venda-2' }),
    ]
    const resultado = calcularFaturamentoPorProduto(lancamentos, [CERVEJA])
    expect(resultado).toEqual([{ itemId: CERVEJA.id, nome: 'Cerveja', faturamento: 10, vendas: 1 }])
  })

  it('um item dividido entre vários clientes (mesmo loteId) conta como uma única venda', () => {
    const lancamentos = [
      criarLancamento({ itemId: CERVEJA.id, valor: -5, loteId: 'lote-1', clienteId: 'a' }),
      criarLancamento({ itemId: CERVEJA.id, valor: -5, loteId: 'lote-1', clienteId: 'b' }),
    ]
    const resultado = calcularFaturamentoPorProduto(lancamentos, [CERVEJA])
    expect(resultado).toEqual([{ itemId: CERVEJA.id, nome: 'Cerveja', faturamento: 10, vendas: 1 }])
  })

  it('agrupa lançamentos avulsos (sem itemId) pela descrição', () => {
    const lancamentos = [criarLancamento({ itemId: null, descricao: 'Água de coco', valor: -8 })]
    const resultado = calcularFaturamentoPorProduto(lancamentos, [])
    expect(resultado).toEqual([{ itemId: null, nome: 'Água de coco', faturamento: 8, vendas: 1 }])
  })

  it('ignora lançamentos que não são de Consumo', () => {
    const lancamentos = [criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.debitoPartida, valor: -20 })]
    expect(calcularFaturamentoPorProduto(lancamentos, [])).toEqual([])
  })
})
