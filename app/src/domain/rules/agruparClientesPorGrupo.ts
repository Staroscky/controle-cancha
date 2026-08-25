import type { Cliente } from '../types/Cliente'
import type { Grupo } from '../types/Grupo'

export type Bloco = {
  grupoId?: string
  nome?: string
  membros: Cliente[]
}

export function agruparClientesPorGrupo(clientes: Cliente[], grupos: Grupo[]): Bloco[] {
  const porGrupo = new Map<string, Cliente[]>()
  const solo: Bloco[] = []

  for (const cliente of clientes) {
    if (!cliente.grupoId) {
      solo.push({ membros: [cliente] })
      continue
    }
    const membros = porGrupo.get(cliente.grupoId) ?? []
    membros.push(cliente)
    porGrupo.set(cliente.grupoId, membros)
  }

  const agrupados: Bloco[] = Array.from(porGrupo.entries()).map(([grupoId, membros]) => ({
    grupoId,
    nome: grupos.find((g) => g.id === grupoId)?.nome,
    membros,
  }))

  return [...agrupados, ...solo]
}
