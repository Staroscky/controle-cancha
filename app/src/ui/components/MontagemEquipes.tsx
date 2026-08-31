import { ArrowLeftRight, UserPlus, XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { calcularIndicativoConsumacaoAcumulado } from '@/domain/rules/calcularIndicativoConsumacaoAcumulado'
import type { Cliente } from '@/domain/types/Cliente'
import { EQUIPES } from '@/domain/types/Equipe'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import type { Lado, Participacao } from '@/domain/types/Participacao'
import type { Partida } from '@/domain/types/Partida'
import { ConcluirPartidaMenu } from '@/ui/components/ConcluirPartidaMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/ui/alert-dialog'
import { Badge } from '@/ui/components/ui/badge'
import { Button } from '@/ui/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/ui/sheet'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const LADOS: Array<{ valor: Lado; rotulo: string }> = [
  { valor: null, rotulo: 'Sem lado' },
  { valor: 'Cima', rotulo: 'Cima' },
  { valor: 'Baixo', rotulo: 'Baixo' },
]
function validarNovoParticipante(
  participacoesAtivas: Array<Pick<Participacao, 'equipeId' | 'lado'>>,
  equipeId: string,
  equipeNome: string,
  lado: Lado,
): string | null {
  if (participacoesAtivas.length >= 16) {
    return 'A partida já atingiu o limite de 16 clientes.'
  }

  const naEquipe = participacoesAtivas.filter((p) => p.equipeId === equipeId)
  if (naEquipe.length >= 8) {
    return `A equipe ${equipeNome} já atingiu o limite de 8 clientes.`
  }

  if (lado) {
    const noLado = naEquipe.filter((p) => p.lado === lado)
    if (noLado.length >= 4) {
      return `O lado ${lado} da equipe ${equipeNome} já atingiu o limite de 4 clientes.`
    }
  }

  return null
}

type MontagemEquipesProps = {
  participacoes: Participacao[]
  todasParticipacoes: Participacao[]
  todasPartidas: Partida[]
  clientes: Cliente[]
  lancamentos: LancamentoFinanceiro[]
  onAdicionar: (clienteId: string, equipeId: string, lado: Lado) => void
  onRemover: (participacaoId: string) => void
  onInverterEquipes: () => void
  onConcluir: (equipeVencedoraId: string) => void
  onDesistir: () => void
}

export function MontagemEquipes({
  participacoes,
  todasParticipacoes,
  todasPartidas,
  clientes,
  lancamentos,
  onAdicionar,
  onRemover,
  onInverterEquipes,
  onConcluir,
  onDesistir,
}: MontagemEquipesProps) {
  const participacoesAtivas = participacoes.filter((p) => p.status === 'ativo')
  const clientesDisponiveis = clientes.filter(
    (c) => c.presente && !participacoesAtivas.some((p) => p.clienteId === c.id),
  )

  const [aberto, setAberto] = useState(false)
  const [clienteIds, setClienteIds] = useState<string[]>([])
  const [equipeId, setEquipeId] = useState(EQUIPES[0].id)
  const [lado, setLado] = useState<Lado>(null)
  const [participacaoParaRemover, setParticipacaoParaRemover] = useState<Participacao | null>(
    null,
  )

  function alternarCliente(id: string) {
    setClienteIds((atual) =>
      atual.includes(id) ? atual.filter((clienteId) => clienteId !== id) : [...atual, id],
    )
  }

  function handleAdicionar() {
    if (clienteIds.length === 0) {
      toast.error('Selecione ao menos um cliente.')
      return
    }

    const equipeNome = EQUIPES.find((e) => e.id === equipeId)?.nome ?? equipeId
    const participacoesSimuladas: Array<Pick<Participacao, 'equipeId' | 'lado'>> = [
      ...participacoesAtivas,
    ]
    let adicionados = 0

    for (const clienteId of clienteIds) {
      const motivo = validarNovoParticipante(participacoesSimuladas, equipeId, equipeNome, lado)
      if (motivo) {
        toast.error(motivo)
        break
      }

      onAdicionar(clienteId, equipeId, lado)
      participacoesSimuladas.push({ equipeId, lado })
      adicionados += 1
    }

    if (adicionados > 0) {
      toast.success(
        adicionados === 1 ? 'Participante adicionado.' : `${adicionados} participantes adicionados.`,
      )
      setClienteIds((atual) => atual.slice(adicionados))
      setLado(null)
    }
  }

  function handleConfirmarRemocao() {
    if (!participacaoParaRemover) return
    onRemover(participacaoParaRemover.id)
    toast.success('Participante removido da partida.')
    setParticipacaoParaRemover(null)
  }

  const clienteParaRemover = participacaoParaRemover
    ? clientes.find((c) => c.id === participacaoParaRemover.clienteId)
    : undefined

  function handleInverterEquipes() {
    onInverterEquipes()
    toast.success('Equipes invertidas.')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Equipes</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={participacoesAtivas.length === 0}
            onClick={handleInverterEquipes}
          >
              <ArrowLeftRight />
            Inverter equipes
          </Button>
          <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger asChild>
              <Button size="sm">
                <UserPlus />
                Adicionar participante
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Adicionar participante</SheetTitle>
                <SheetDescription>
                  Só clientes presentes no estabelecimento podem ser adicionados à partida.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Clientes</span>
                    {clienteIds.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {clienteIds.length} selecionado{clienteIds.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1">
                    {clientesDisponiveis.map((cliente) => (
                      <label
                        key={cliente.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          className="size-4 shrink-0 accent-primary"
                          checked={clienteIds.includes(cliente.id)}
                          onChange={() => alternarCliente(cliente.id)}
                        />
                        {cliente.nome}
                      </label>
                    ))}
                    {clientesDisponiveis.length === 0 && (
                      <p className="px-2 py-1.5 text-xs text-muted-foreground">
                        Nenhum cliente presente disponível para adicionar.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium">Equipe</span>
                  <div className="flex gap-2">
                    {EQUIPES.map((equipe) => (
                      <Button
                        key={equipe.id}
                        type="button"
                        variant={equipeId === equipe.id ? 'default' : 'outline'}
                        onClick={() => setEquipeId(equipe.id)}
                        className="flex-1"
                      >
                        {equipe.nome === 'Azul' ? '🔵' : '🟡'} {equipe.nome}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-medium">Lado (opcional)</span>
                  <div className="flex gap-2">
                    {LADOS.map((opcao) => (
                      <Button
                        key={opcao.rotulo}
                        type="button"
                        variant={lado === opcao.valor ? 'default' : 'outline'}
                        onClick={() => setLado(opcao.valor)}
                        className="flex-1"
                      >
                        {opcao.rotulo}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button onClick={handleAdicionar}>Adicionar</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <ConcluirPartidaMenu onConcluir={onConcluir} onDesistir={onDesistir} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EQUIPES.map((equipe) => {
          const daEquipe = participacoesAtivas.filter((p) => p.equipeId === equipe.id)
          return (
            <div key={equipe.id} className="rounded-lg border bg-muted/20 p-3">
              <div className="mb-3 flex items-center justify-between text-sm font-medium">
                <span>
                  {equipe.nome === 'Azul' ? '🔵' : '🟡'} {equipe.nome}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {daEquipe.length}/8
                </span>
              </div>
              <div className="space-y-3">
                {LADOS.map((opcao) => {
                  const noLado = daEquipe.filter((p) => p.lado === opcao.valor)
                  if (noLado.length === 0) return null
                  return (
                    <div key={opcao.rotulo} className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        {opcao.rotulo}
                        {opcao.valor && ` (${noLado.length}/4)`}
                      </p>
                      <ul className="space-y-1.5">
                        {noLado.map((participacao) => {
                          const cliente = clientes.find((c) => c.id === participacao.clienteId)
                          const indicativo = calcularIndicativoConsumacaoAcumulado(
                            lancamentos,
                            todasParticipacoes,
                            todasPartidas,
                            participacao.clienteId,
                          )
                          return (
                            <li
                              key={participacao.id}
                              className="flex items-center justify-between gap-2 rounded-md bg-muted px-2 py-1 text-sm"
                            >
                              <span className="flex flex-1 items-center gap-1.5">
                                {cliente?.nome ?? 'Cliente removido'}
                                {indicativo > 0 && (
                                  <Badge variant="outline">
                                    faltam {formatoMoeda.format(indicativo)}
                                  </Badge>
                                )}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setParticipacaoParaRemover(participacao)}
                                title="Remover da partida"
                              >
                                <XIcon />
                              </Button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
                {daEquipe.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum participante ainda.</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog
        open={!!participacaoParaRemover}
        onOpenChange={(open) => !open && setParticipacaoParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover participante?</AlertDialogTitle>
            <AlertDialogDescription>
              {clienteParaRemover?.nome ?? 'Este cliente'} sairá da partida, mantendo o status
              financeiro atual. Se a equipe dele perder depois, ele não receberá cobrança nem
              crédito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarRemocao}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
