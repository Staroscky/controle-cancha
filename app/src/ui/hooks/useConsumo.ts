import { useCallback, useState } from 'react'
import {
  adicionarItemConsumo,
  editarItemConsumo,
  listarItensConsumoOrdenados,
  removerItemConsumo,
} from '@/data/itensConsumoRepo'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'

export function useConsumo() {
  const [itens, setItens] = useState<ItemConsumo[]>(() => listarItensConsumoOrdenados())

  const recarregarItens = useCallback(() => {
    setItens(listarItensConsumoOrdenados())
  }, [])

  const cadastrarItem = useCallback((nome: string, valor: number, categoriaId: string | null) => {
    const item = adicionarItemConsumo(nome, valor, categoriaId)
    setItens(listarItensConsumoOrdenados())
    return item
  }, [])

  const editarItem = useCallback((id: string, nome: string, valor: number, categoriaId: string | null) => {
    editarItemConsumo(id, nome, valor, categoriaId)
    setItens(listarItensConsumoOrdenados())
  }, [])

  const removerItem = useCallback((id: string) => {
    removerItemConsumo(id)
    setItens(listarItensConsumoOrdenados())
  }, [])

  return {
    itens,
    cadastrarItem,
    editarItem,
    removerItem,
    recarregarItens,
  }
}
