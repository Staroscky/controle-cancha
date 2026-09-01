import type { ItemConsumo } from '../types/ItemConsumo'
import type { LancamentoFinanceiro } from '../types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '../types/TipoLancamento'
import { descricaoSemPrefixoDeRateio } from './descricaoSemPrefixoDeRateio'

export type FaturamentoProduto = {
  itemId: string | null
  nome: string
  faturamento: number
  vendas: number
}

type GrupoProduto = {
  itemId: string | null
  nome: string
  faturamento: number
  lotesVendidos: Set<string>
}

/** Ranking de produtos por faturamento (seção 10 de docs/regras.md): agrupa os lançamentos de
 * Consumo pelo item do catálogo (ou pela descrição, quando lançado avulso) e soma o valor cobrado,
 * já líquido de estornos (mesmo tipoId, valor com sinal oposto, então se cancelam na soma). Uma
 * compra dividida entre vários clientes gera um lançamento por pessoa (mesmo loteId) — cada lote
 * conta como uma única venda, não uma por participante. */
export function calcularFaturamentoPorProduto(
  lancamentos: LancamentoFinanceiro[],
  itensConsumo: ItemConsumo[],
): FaturamentoProduto[] {
  const nomeDoItem = new Map(itensConsumo.map((i) => [i.id, i.nome]))
  const consumo = lancamentos.filter((l) => l.tipoId === TIPO_LANCAMENTO_IDS.consumo)
  // Uma compra estornada não conta como venda (o estorno tem o mesmo tipoId e aponta pra ela via
  // estornaLancamentoId), mesmo que o grupo continue com faturamento de outras compras não estornadas.
  const idsEstornados = new Set(consumo.map((l) => l.estornaLancamentoId).filter(Boolean))

  const grupos = new Map<string, GrupoProduto>()
  for (const l of consumo) {
    const nomeLimpo = descricaoSemPrefixoDeRateio(l.descricao)
    const chave = l.itemId ?? `avulso:${nomeLimpo}`
    let grupo = grupos.get(chave)
    if (!grupo) {
      grupo = {
        itemId: l.itemId,
        nome: l.itemId ? (nomeDoItem.get(l.itemId) ?? 'Item removido') : nomeLimpo,
        faturamento: 0,
        lotesVendidos: new Set(),
      }
      grupos.set(chave, grupo)
    }
    grupo.faturamento -= l.valor
    if (l.valor < 0 && !idsEstornados.has(l.id)) grupo.lotesVendidos.add(l.loteId ?? l.id)
  }

  return [...grupos.values()]
    .map((g) => ({
      itemId: g.itemId,
      nome: g.nome,
      faturamento: Math.round(g.faturamento * 100) / 100,
      vendas: g.lotesVendidos.size,
    }))
    .filter((g) => g.faturamento > 0.001)
    .sort((a, b) => b.faturamento - a.faturamento)
}
