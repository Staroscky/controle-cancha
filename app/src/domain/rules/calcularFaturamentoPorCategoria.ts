import type { CategoriaConsumo } from '../types/CategoriaConsumo'
import type { ItemConsumo } from '../types/ItemConsumo'
import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'

export type FaturamentoCategoria = {
  categoriaId: string | null
  nome: string
  faturamento: number
}

/** Faturamento de Consumo agrupado por categoria (seção 10 de docs/regras.md). Itens sem
 * categoria e lançamentos avulsos (sem itemId) caem em "Sem categoria". */
export function calcularFaturamentoPorCategoria(
  lancamentos: LancamentoFinanceiro[],
  itensConsumo: ItemConsumo[],
  categoriasConsumo: CategoriaConsumo[],
): FaturamentoCategoria[] {
  const categoriaDoItem = new Map(itensConsumo.map((i) => [i.id, i.categoriaId]))
  const nomeDaCategoria = new Map(categoriasConsumo.map((c) => [c.id, c.nome]))
  const consumo = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.consumo)

  const somas = new Map<string | null, number>()
  for (const l of consumo) {
    const categoriaId = l.itemId ? (categoriaDoItem.get(l.itemId) ?? null) : null
    somas.set(categoriaId, (somas.get(categoriaId) ?? 0) - l.valor)
  }

  return [...somas.entries()]
    .map(([categoriaId, faturamento]) => ({
      categoriaId,
      nome: categoriaId ? (nomeDaCategoria.get(categoriaId) ?? 'Categoria removida') : 'Sem categoria',
      faturamento: Math.round(faturamento * 100) / 100,
    }))
    .filter((c) => c.faturamento > 0.001)
    .sort((a, b) => b.faturamento - a.faturamento)
}
