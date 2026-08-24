import type { Grupo } from '../domain/types/Grupo'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:grupos'

export function listarGrupos(): Grupo[] {
  return getItem<Grupo[]>(CHAVE, [])
}

export function criarGrupo(nome?: string): Grupo {
  const grupos = listarGrupos()
  const grupo: Grupo = { id: crypto.randomUUID(), nome }
  setItem(CHAVE, [...grupos, grupo])
  return grupo
}

export function renomearGrupo(id: string, nome: string): void {
  const grupos = listarGrupos().map((g) => (g.id === id ? { ...g, nome } : g))
  setItem(CHAVE, grupos)
}

export function removerGrupo(id: string): void {
  const grupos = listarGrupos().filter((g) => g.id !== id)
  setItem(CHAVE, grupos)
}
