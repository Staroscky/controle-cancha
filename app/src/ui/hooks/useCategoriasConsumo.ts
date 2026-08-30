import { useCallback, useState } from 'react'
import {
  adicionarCategoriaConsumo,
  editarCategoriaConsumo,
  listarCategoriasConsumoOrdenadas,
  removerCategoriaConsumo,
} from '@/data/categoriasConsumoRepo'
import { desvincularCategoriaDosItens } from '@/data/itensConsumoRepo'
import type { CategoriaConsumo } from '@/domain/types/CategoriaConsumo'

export function useCategoriasConsumo() {
  const [categorias, setCategorias] = useState<CategoriaConsumo[]>(() =>
    listarCategoriasConsumoOrdenadas(),
  )

  const cadastrarCategoria = useCallback((nome: string, icone: string) => {
    const categoria = adicionarCategoriaConsumo(nome, icone)
    setCategorias(listarCategoriasConsumoOrdenadas())
    return categoria
  }, [])

  const editarCategoria = useCallback((id: string, nome: string, icone: string) => {
    editarCategoriaConsumo(id, nome, icone)
    setCategorias(listarCategoriasConsumoOrdenadas())
  }, [])

  const removerCategoria = useCallback((id: string) => {
    removerCategoriaConsumo(id)
    desvincularCategoriaDosItens(id)
    setCategorias(listarCategoriasConsumoOrdenadas())
  }, [])

  return {
    categorias,
    cadastrarCategoria,
    editarCategoria,
    removerCategoria,
  }
}
