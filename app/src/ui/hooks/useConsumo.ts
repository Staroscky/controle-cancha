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

  const cadastrarItem = useCallback((nome: string, valor: number) => {
    const item = adicionarItemConsumo(nome, valor)
    setItens(listarItensConsumoOrdenados())
    return item
  }, [])

  const editarItem = useCallback((id: string, nome: string, valor: number) => {
    editarItemConsumo(id, nome, valor)
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
  }
}
