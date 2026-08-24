export type Lado = 'Cima' | 'Baixo' | null
export type StatusParticipacao = 'ativo' | 'saiu'

export type Participacao = {
  id: string
  clienteId: string
  partidaId: string
  equipeId: string
  lado: Lado
  entrada: string
  saida: string | null
  status: StatusParticipacao
}
