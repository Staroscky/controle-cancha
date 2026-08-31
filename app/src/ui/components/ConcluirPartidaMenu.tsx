import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EQUIPES } from '@/domain/types/Equipe'
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
import { Button } from '@/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu'

type Acao = { tipo: 'concluir'; equipeId: string } | { tipo: 'desistir' }

type ConcluirPartidaMenuProps = {
  onConcluir: (equipeVencedoraId: string) => void
  onDesistir: () => void
}

export function ConcluirPartidaMenu({ onConcluir, onDesistir }: ConcluirPartidaMenuProps) {
  const [acao, setAcao] = useState<Acao | null>(null)

  function handleConfirmar() {
    if (!acao) return
    if (acao.tipo === 'desistir') {
      onDesistir()
      toast.success('Partida encerrada por desistência.')
    } else {
      const equipe = EQUIPES.find((e) => e.id === acao.equipeId)
      onConcluir(acao.equipeId)
      toast.success(`Partida concluída — ${equipe?.nome} venceu.`)
    }
    setAcao(null)
  }

  const equipeEscolhida =
    acao?.tipo === 'concluir' ? EQUIPES.find((e) => e.id === acao.equipeId) : undefined

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">
            Concluir
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {EQUIPES.map((equipe) => (
            <DropdownMenuItem
              key={equipe.id}
              onSelect={() => setAcao({ tipo: 'concluir', equipeId: equipe.id })}
            >
              {equipe.nome === 'Azul' ? '🔵' : '🟡'} {equipe.nome} venceu
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setAcao({ tipo: 'desistir' })}>
            Desistência
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!acao} onOpenChange={(open) => !open && setAcao(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {acao?.tipo === 'desistir' ? 'Encerrar por desistência?' : 'Concluir partida?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {acao?.tipo === 'desistir'
                ? 'Use quando os jogadores abandonarem a partida sem chegar a um resultado. A partida é encerrada sem equipe vencedora e sem gerar cobrança de derrota nem crédito de vitória para ninguém. Essa ação não pode ser desfeita.'
                : `${equipeEscolhida?.nome} vence. O sistema vai gerar a cobrança de derrota para cada perdedor ativo e dividir o crédito de vitória entre os vencedores ativos. Essa ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={acao?.tipo === 'desistir' ? 'destructive' : 'default'}
              onClick={handleConfirmar}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
