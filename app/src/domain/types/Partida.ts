export type StatusPartida = 'em_andamento' | 'concluida' | 'desistencia'

export type Partida = {
  id: string
  dataHora: string
  equipeVencedoraId: string | null
  status: StatusPartida
  valorMinimoConsumacao: number
  valorPartidaPorCliente: number
  conjuntoId: string | null
}
