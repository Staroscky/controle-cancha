import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { listarParticipacoesPorPartida } from '@/data/participacoesRepo'
import { chaveDoDia } from '@/domain/rules/agruparLancamentosPorDia'
import { agruparPartidasPorDia, type GrupoPartidasPorDia } from '@/domain/rules/agruparPartidasPorDia'
import { calcularNumeroPartidaDoDia } from '@/domain/rules/calcularNumeroPartidaDoDia'
import type { Cliente } from '@/domain/types/Cliente'
import { EQUIPES } from '@/domain/types/Equipe'
import type { Partida } from '@/domain/types/Partida'
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

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })
const formatoDia = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

function ehHoje(data: string) {
  return data === chaveDoDia(new Date().toISOString())
}

function rotuloDoDia(grupo: GrupoPartidasPorDia) {
  return ehHoje(grupo.data) ? 'Hoje' : formatoDia.format(new Date(grupo.partidas[0].dataHora))
}

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
  const [expandidaId, setExpandidaId] = useState<string | null>(null)
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

  // O dia de Hoje fica sempre aberto, mostrando as partidas mais recentes; os demais dias
  // começam fechados e só expandem quando o usuário clica no cabeçalho.
  function diaEstaExpandido(data: string) {
    return ehHoje(data) || diasExpandidos.has(data)
  }

  function handleCriarComParticipantes(partidaId: string) {
    const { adicionados, ignorados } = onCriarComParticipantes(partidaId)

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

  function handleLimparHistorico() {
    onLimparHistorico()
    setExpandidaId(null)
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
                As {historico.length} partida(s) do histórico somem dessa lista. Os créditos e
                débitos já lançados continuam valendo no saldo dos clientes — essa ação só limpa
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
          const hoje = ehHoje(grupo.data)
          const expandidoDia = diaEstaExpandido(grupo.data)

          return (
            <div key={grupo.data} className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-1.5 text-left disabled:cursor-default"
                onClick={() => toggleDia(grupo.data)}
                disabled={hoje}
              >
                {!hoje &&
                  (expandidoDia ? (
                    <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  ))}
                <span className="text-sm font-medium">{rotuloDoDia(grupo)}</span>
                <span className="text-xs text-muted-foreground">
                  · {grupo.partidas.length} partida(s)
                </span>
              </button>

              {expandidoDia && (
                <div className="space-y-2">
                  {grupo.partidas.map((partida) => {
                    const equipeVencedora = EQUIPES.find((e) => e.id === partida.equipeVencedoraId)
                    const participantes = listarParticipacoesPorPartida(partida.id).filter(
                      (p) => p.status === 'ativo',
                    )
                    const numeroDoDia = calcularNumeroPartidaDoDia(todasPartidas, partida.id)
                    const expandida = expandidaId === partida.id

                    return (
                      <div key={partida.id} className="rounded-md border text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                          <button
                            type="button"
                            className="flex flex-1 items-center gap-1.5 text-left"
                            onClick={() => setExpandidaId(expandida ? null : partida.id)}
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
                                    {equipeVencedora?.nome === 'Azul' ? '🔵' : '🟡'}{' '}
                                    {equipeVencedora?.nome} venceu
                                  </>
                                )}
                              </span>
                              <span className="text-muted-foreground">
                                {' '}
                                · {formatoHora.format(new Date(partida.dataHora))} ·{' '}
                                {participantes.length} participantes ·{' '}
                                {formatoMoeda.format(partida.valorPartidaPorCliente)}
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
                              partidaAtivaExiste
                                ? 'Conclua a partida em andamento antes de criar outra'
                                : undefined
                            }
                            onClick={() => handleCriarComParticipantes(partida.id)}
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
                                    {equipe.nome === 'Azul' ? '🔵' : '🟡'} {equipe.nome} (
                                    {daEquipe.length})
                                  </p>
                                  {daEquipe.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                      Nenhum participante.
                                    </p>
                                  ) : (
                                    <ul className="space-y-1">
                                      {daEquipe.map((p) => {
                                        const cliente = clientes.find((c) => c.id === p.clienteId)
                                        return (
                                          <li
                                            key={p.id}
                                            className="rounded-md bg-muted px-2 py-1 text-xs"
                                          >
                                            {cliente?.nome ?? 'Cliente removido'}
                                            {p.lado && (
                                              <span className="text-muted-foreground">
                                                {' '}
                                                · {p.lado}
                                              </span>
                                            )}
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
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
