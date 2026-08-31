import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { agruparPartidasPorDia } from '@/domain/rules/agruparPartidasPorDia'
import type { Cliente } from '@/domain/types/Cliente'
import type { Partida } from '@/domain/types/Partida'
import { ItemPartida } from '@/ui/components/ItemPartida'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/components/ui/alert-dialog'
import { Button } from '@/ui/components/ui/button'

const formatoDia = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

type ResultadoCriarComParticipantes = {
  partida: Partida | null
  adicionados: number
  ignorados: number
}

type HistoricoPartidasProps = {
  historico: Partida[]
  todasPartidas: Partida[]
  clientes: Cliente[]
  partidaAtivaExiste: boolean
  onCriarComParticipantes: (partidaId: string) => ResultadoCriarComParticipantes
  onLimparHistorico: () => void
}

export function HistoricoPartidas({
  historico,
  todasPartidas,
  clientes,
  partidaAtivaExiste,
  onCriarComParticipantes,
  onLimparHistorico,
}: HistoricoPartidasProps) {
  const [diasExpandidos, setDiasExpandidos] = useState<Set<string>>(() => new Set())

  if (historico.length === 0) return null

  function toggleDia(data: string) {
    setDiasExpandidos((prev) => {
      const proximo = new Set(prev)
      if (proximo.has(data)) {
        proximo.delete(data)
      } else {
        proximo.add(data)
      }
      return proximo
    })
  }

  function handleLimparHistorico() {
    onLimparHistorico()
    toast.success('Histórico de partidas limpo.')
  }

  const grupos = agruparPartidasPorDia(historico)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Histórico de partidas</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              Limpar histórico
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar histórico de partidas?</AlertDialogTitle>
              <AlertDialogDescription>
                As {historico.length} partida(s) de dias anteriores somem dessa lista. Os créditos
                e débitos já lançados continuam valendo no saldo dos clientes — essa ação só limpa
                o histórico, não desfaz cobrança nenhuma.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleLimparHistorico}>
                Limpar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-3">
        {grupos.map((grupo) => {
          const expandidoDia = diasExpandidos.has(grupo.data)

          return (
            <div key={grupo.data} className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-1.5 text-left"
                onClick={() => toggleDia(grupo.data)}
              >
                {expandidoDia ? (
                  <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {formatoDia.format(new Date(grupo.partidas[0].dataHora))}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {grupo.partidas.length} partida(s)
                </span>
              </button>

              {expandidoDia && (
                <div className="space-y-2">
                  {grupo.partidas.map((partida) => (
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
