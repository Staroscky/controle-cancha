import { calcularPlacarDoDia } from '@/domain/rules/calcularPlacarDoDia'
import type { Partida } from '@/domain/types/Partida'
import { cn } from '@/ui/lib/utils'

type PlacarDoDiaProps = {
  todasPartidas: Partida[]
}

export function PlacarDoDia({ todasPartidas }: PlacarDoDiaProps) {
  const { azul, amarela } = calcularPlacarDoDia(todasPartidas)

  if (azul === 0 && amarela === 0) return null

  const azulNaFrente = azul > amarela
  const amarelaNaFrente = amarela > azul

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3">
      <span className="text-sm font-medium text-muted-foreground">🔵 Azul</span>

      <div className="flex items-center gap-4">
        <span
          className={cn(
            'text-3xl font-bold tabular-nums',
            azulNaFrente ? 'text-blue-600' : 'text-muted-foreground',
          )}
        >
          {azul}
        </span>
        <span className="text-xs font-medium text-muted-foreground">Placar de hoje</span>
        <span
          className={cn(
            'text-3xl font-bold tabular-nums',
            amarelaNaFrente ? 'text-amber-600' : 'text-muted-foreground',
          )}
        >
          {amarela}
        </span>
      </div>

      <span className="text-sm font-medium text-muted-foreground">Amarela 🟡</span>
    </div>
  )
}
