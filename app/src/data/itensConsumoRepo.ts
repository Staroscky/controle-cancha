import type { ItemConsumo } from '../domain/types/ItemConsumo'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:itensConsumo'

export function listarItensConsumo(): ItemConsumo[] {
  return getItem<ItemConsumo[]>(CHAVE, [])
}

export function listarItensConsumoOrdenados(): ItemConsumo[] {
  return listarItensConsumo().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function adicionarItemConsumo(nome: string, valor: number, categoriaId: string | null): ItemConsumo {
  const item: ItemConsumo = { id: crypto.randomUUID(), nome, valor, categoriaId }
  setItem(CHAVE, [...listarItensConsumo(), item])
  return item
}

export function editarItemConsumo(id: string, nome: string, valor: number, categoriaId: string | null): void {
  const itens = listarItensConsumo().map((i) => (i.id === id ? { ...i, nome, valor, categoriaId } : i))
  setItem(CHAVE, itens)
}

export function removerItemConsumo(id: string): void {
  setItem(CHAVE, listarItensConsumo().filter((i) => i.id !== id))
}

export function desvincularCategoriaDosItens(categoriaId: string): void {
  const itens = listarItensConsumo().map((i) =>
    i.categoriaId === categoriaId ? { ...i, categoriaId: null } : i,
  )
  setItem(CHAVE, itens)
}
