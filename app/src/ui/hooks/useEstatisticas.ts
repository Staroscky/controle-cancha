import { useMemo, useState } from 'react'
import { listarCategoriasConsumoOrdenadas } from '@/data/categoriasConsumoRepo'
import { listarItensConsumoOrdenados } from '@/data/itensConsumoRepo'
import { listarLancamentos } from '@/data/lancamentosRepo'
import { calcularFaturamentoPorCategoria } from '@/domain/rules/calcularFaturamentoPorCategoria'
import { calcularFaturamentoPorProduto } from '@/domain/rules/calcularFaturamentoPorProduto'
import { calcularResumoFinanceiro } from '@/domain/rules/calcularResumoFinanceiro'
import {
  filtrarLancamentosPorPeriodo,
  type PeriodoEstatisticas,
} from '@/domain/rules/filtrarLancamentosPorPeriodo'

export function useEstatisticas() {
  const [periodo, setPeriodo] = useState<PeriodoEstatisticas>('hoje')

  const [lancamentos] = useState(() => listarLancamentos())
  const [itensConsumo] = useState(() => listarItensConsumoOrdenados())
  const [categoriasConsumo] = useState(() => listarCategoriasConsumoOrdenadas())

  const lancamentosDoPeriodo = useMemo(
    () => filtrarLancamentosPorPeriodo(lancamentos, periodo),
    [lancamentos, periodo],
  )

  const resumo = useMemo(() => calcularResumoFinanceiro(lancamentosDoPeriodo), [lancamentosDoPeriodo])

  const produtos = useMemo(
    () => calcularFaturamentoPorProduto(lancamentosDoPeriodo, itensConsumo),
    [lancamentosDoPeriodo, itensConsumo],
  )

  const categorias = useMemo(
    () => calcularFaturamentoPorCategoria(lancamentosDoPeriodo, itensConsumo, categoriasConsumo),
    [lancamentosDoPeriodo, itensConsumo, categoriasConsumo],
  )

  return { periodo, setPeriodo, resumo, produtos, categorias }
}
