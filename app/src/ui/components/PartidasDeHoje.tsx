import type { Cliente } from '@/domain/types/Cliente'
import type { Partida } from '@/domain/types/Partida'
import { ItemPartida } from '@/ui/components/ItemPartida'

type ResultadoCriarComParticipantes = {
  partida: Partida | null
  adicionados: number
  ignorados: number
}

type PartidasDeHojeProps = {
  partidas: Partida[]
  todasPartidas: Partida[]
  clientes: Cliente[]
  partidaAtivaExiste: boolean
  onCriarComParticipantes: (partidaId: string) => ResultadoCriarComParticipantes
}

export function PartidasDeHoje({
  partidas,
  todasPartidas,
  clientes,
  partidaAtivaExiste,
  onCriarComParticipantes,
}: PartidasDeHojeProps) {
  if (partidas.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Partidas de hoje</h3>
      <div className="space-y-2">
        {partidas.map((partida) => (
          <ItemPartida
            key={partida.id}
            partida={partida}
            todasPartidas={todasPartidas}
            clientes={clientes}
            partidaAtivaExiste={partidaAtivaExiste}
            onCriarComParticipantes={onCriarComParticipantes}
          />
        ))}
      </div>
    </div>
  )
}
