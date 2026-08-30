import type { CategoriaConsumo } from '../domain/types/CategoriaConsumo'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:categoriasConsumo'

export function listarCategoriasConsumo(): CategoriaConsumo[] {
  return getItem<CategoriaConsumo[]>(CHAVE, [])
}

export function listarCategoriasConsumoOrdenadas(): CategoriaConsumo[] {
  return listarCategoriasConsumo().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function adicionarCategoriaConsumo(nome: string, icone: string): CategoriaConsumo {
  const categoria: CategoriaConsumo = { id: crypto.randomUUID(), nome, icone }
  setItem(CHAVE, [...listarCategoriasConsumo(), categoria])
  return categoria
}

export function editarCategoriaConsumo(id: string, nome: string, icone: string): void {
  const categorias = listarCategoriasConsumo().map((c) => (c.id === id ? { ...c, nome, icone } : c))
  setItem(CHAVE, categorias)
}

export function removerCategoriaConsumo(id: string): void {
  setItem(CHAVE, listarCategoriasConsumo().filter((c) => c.id !== id))
}
