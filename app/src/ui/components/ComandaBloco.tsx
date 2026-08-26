import { ChevronRight } from 'lucide-react'
import type { Bloco } from '@/domain/rules/agruparClientesPorGrupo'

type ComandaBlocoProps = {
  bloco: Bloco
  onAbrir: (bloco: Bloco) => void
}

export function ComandaBloco({ bloco, onAbrir }: ComandaBlocoProps) {
  return (
    <button
      type="button"
      onClick={() => onAbrir(bloco)}
      className="flex w-full items-center justify-between gap-2 rounded-md border p-3 text-left"
    >
      <span className="flex flex-col">
        <span className="font-medium">{bloco.grupoId ? bloco.nome || 'Grupo' : bloco.membros[0].nome}</span>
        {bloco.grupoId && (
          <span className="text-xs text-muted-foreground">
            {bloco.membros.map((m) => m.nome).join(', ')}
          </span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}
