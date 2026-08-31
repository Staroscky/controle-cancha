import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { listarParticipacoesPorPartida } from '@/data/participacoesRepo'
import { calcularNumeroPartidaDoDia } from '@/domain/rules/calcularNumeroPartidaDoDia'
import type { Cliente } from '@/domain/types/Cliente'
import { EQUIPES } from '@/domain/types/Equipe'
import type { Partida } from '@/domain/types/Partida'
import { Button } from '@/ui/components/ui/button'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })

type ResultadoCriarComParticipantes = {
  partida: Partida | null
  adicionados: number
  ignorados: number
}

type ItemPartidaProps = {
  partida: Partida
  todasPartidas: Partida[]
  clientes: Cliente[]
  partidaAtivaExiste: boolean
  onCriarComParticipantes: (partidaId: string) => ResultadoCriarComParticipantes
}

export function ItemPartida({
  partida,
  todasPartidas,
  clientes,
  partidaAtivaExiste,
  onCriarComParticipantes,
}: ItemPartidaProps) {
  const [expandida, setExpandida] = useState(false)

  const equipeVencedora = EQUIPES.find((e) => e.id === partida.equipeVencedoraId)
  const participantes = listarParticipacoesPorPartida(partida.id).filter((p) => p.status === 'ativo')
  const numeroDoDia = calcularNumeroPartidaDoDia(todasPartidas, partida.id)

  function handleCriarComParticipantes() {
    const { adicionados, ignorados } = onCriarComParticipantes(partida.id)

    if (adicionados === 0) {
      toast.error('Nenhum participante dessa partida está presente agora.')
      return
    }

    toast.success(
      ignorados > 0
        ? `Partida criada com ${adicionados} participante(s). ${ignorados} de fora por estarem ausentes.`
        : `Partida criada com ${adicionados} participante(s).`,
    )
  }

  return (
    <div className="rounded-md border text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 text-left"
          onClick={() => setExpandida(!expandida)}
        >
          {expandida ? (
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span>
            <span className="font-medium">
              #{numeroDoDia} ·{' '}
              {partida.status === 'desistencia' ? (
                'Desistência'
              ) : (
                <>
                  {equipeVencedora?.nome === 'Azul' ? '🔵' : '🟡'} {equipeVencedora?.nome} venceu
                </>
              )}
            </span>
            <span className="text-muted-foreground">
              {' '}
              · {formatoHora.format(new Date(partida.dataHora))} · {participantes.length}{' '}
              participantes · {formatoMoeda.format(partida.valorPartidaPorCliente)}
              /cliente
            </span>
          </span>
        </button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={partidaAtivaExiste}
          title={
            partidaAtivaExiste ? 'Conclua a partida em andamento antes de criar outra' : undefined
          }
          onClick={handleCriarComParticipantes}
        >
          Nova partida com estes participantes
        </Button>
      </div>

      {expandida && (
        <div className="grid gap-3 border-t p-3 sm:grid-cols-2">
          {EQUIPES.map((equipe) => {
            const daEquipe = participantes.filter((p) => p.equipeId === equipe.id)
            return (
              <div key={equipe.id} className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {equipe.nome === 'Azul' ? '🔵' : '🟡'} {equipe.nome} ({daEquipe.length})
                </p>
                {daEquipe.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum participante.</p>
                ) : (
                  <ul className="space-y-1">
                    {daEquipe.map((p) => {
                      const cliente = clientes.find((c) => c.id === p.clienteId)
                      return (
                        <li key={p.id} className="rounded-md bg-muted px-2 py-1 text-xs">
                          {cliente?.nome ?? 'Cliente removido'}
                          {p.lado && <span className="text-muted-foreground"> · {p.lado}</span>}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
