export type EquipeNome = 'Azul' | 'Amarela'

export type Equipe = {
  id: string
  nome: EquipeNome
}

export const EQUIPE_IDS = {
  azul: 'azul',
  amarela: 'amarela',
} as const

export const EQUIPES: Equipe[] = [
  { id: EQUIPE_IDS.azul, nome: 'Azul' },
  { id: EQUIPE_IDS.amarela, nome: 'Amarela' },
]

