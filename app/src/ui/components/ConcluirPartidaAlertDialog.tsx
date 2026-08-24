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
  AlertDialogTrigger,
} from '@/ui/components/ui/alert-dialog'
import { Button } from '@/ui/components/ui/button'

type ConcluirPartidaAlertDialogProps = {
  onConcluir: (equipeVencedoraId: string) => void
}

export function ConcluirPartidaAlertDialog({ onConcluir }: ConcluirPartidaAlertDialogProps) {
  const [aberto, setAberto] = useState(false)
  const [equipeVencedoraId, setEquipeVencedoraId] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) setEquipeVencedoraId('')
    setAberto(aberto)
  }

  function handleConcluir() {
    if (!equipeVencedoraId) return
    const equipe = EQUIPES.find((e) => e.id === equipeVencedoraId)
    onConcluir(equipeVencedoraId)
    toast.success(`Partida concluída — ${equipe?.nome} venceu.`)
    setAberto(false)
  }

  return (
    <AlertDialog open={aberto} onOpenChange={abrir}>
      <AlertDialogTrigger asChild>
        <Button>Concluir partida</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Concluir partida</AlertDialogTitle>
          <AlertDialogDescription>
            Escolha a equipe vencedora. O sistema vai gerar a cobrança de derrota para cada
            perdedor ativo e dividir o crédito de vitória entre os vencedores ativos. Essa ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 px-4">
          {EQUIPES.map((equipe) => (
            <Button
              key={equipe.id}
              type="button"
              variant={equipeVencedoraId === equipe.id ? 'default' : 'outline'}
              onClick={() => setEquipeVencedoraId(equipe.id)}
              className="flex-1"
            >
              {equipe.nome === 'Azul' ? '🔵' : '🟡'} {equipe.nome}
            </Button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConcluir} disabled={!equipeVencedoraId}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
