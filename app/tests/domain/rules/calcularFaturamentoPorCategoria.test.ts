import { describe, expect, it } from 'vitest'
import { calcularFaturamentoPorCategoria } from '@/domain/rules/calcularFaturamentoPorCategoria'
import type { CategoriaConsumo } from '@/domain/types/CategoriaConsumo'
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

const BEBIDAS: CategoriaConsumo = { id: 'cat-bebidas', nome: 'Bebidas', icone: '🍺' }
const CERVEJA: ItemConsumo = { id: 'item-cerveja', nome: 'Cerveja', valor: 10, categoriaId: BEBIDAS.id }
const AVULSO: ItemConsumo = { id: 'item-avulso', nome: 'Sem categoria', valor: 5, categoriaId: null }

describe('calcularFaturamentoPorCategoria', () => {
  it('retorna lista vazia quando não há consumo', () => {
    expect(calcularFaturamentoPorCategoria([], [CERVEJA], [BEBIDAS])).toEqual([])
  })

  it('soma o faturamento pela categoria do item e ordena do maior para o menor', () => {
    const lancamentos = [
      criarLancamento({ itemId: CERVEJA.id, valor: -10 }),
      criarLancamento({ itemId: AVULSO.id, valor: -30 }),
    ]
    const resultado = calcularFaturamentoPorCategoria(lancamentos, [CERVEJA, AVULSO], [BEBIDAS])
    expect(resultado).toEqual([
      { categoriaId: null, nome: 'Sem categoria', faturamento: 30 },
      { categoriaId: BEBIDAS.id, nome: 'Bebidas', faturamento: 10 },
    ])
  })

  it('agrupa itens sem categoria e lançamentos avulsos (sem itemId) em "Sem categoria"', () => {
    const lancamentos = [
      criarLancamento({ itemId: AVULSO.id, valor: -5 }),
      criarLancamento({ itemId: null, valor: -3 }),
    ]
    const resultado = calcularFaturamentoPorCategoria(lancamentos, [AVULSO], [])
    expect(resultado).toEqual([{ categoriaId: null, nome: 'Sem categoria', faturamento: 8 }])
  })

  it('ignora lançamentos que não são de Consumo', () => {
    const lancamentos = [criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.debitoPartida, valor: -20 })]
    expect(calcularFaturamentoPorCategoria(lancamentos, [], [])).toEqual([])
  })
})
