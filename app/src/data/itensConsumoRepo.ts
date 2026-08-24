import type { ItemConsumo } from '../domain/types/ItemConsumo'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:itensConsumo'

export function listarItensConsumo(): ItemConsumo[] {
  return getItem<ItemConsumo[]>(CHAVE, [])
}

export function adicionarItemConsumo(nome: string, valor: number): ItemConsumo {
  const item: ItemConsumo = { id: crypto.randomUUID(), nome, valor }
  setItem(CHAVE, [...listarItensConsumo(), item])
  return item
}
