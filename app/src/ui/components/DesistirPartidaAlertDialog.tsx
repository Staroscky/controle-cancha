import { useState } from 'react'
import { toast } from 'sonner'
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

type DesistirPartidaAlertDialogProps = {
  onDesistir: () => void
}

export function DesistirPartidaAlertDialog({ onDesistir }: DesistirPartidaAlertDialogProps) {
  const [aberto, setAberto] = useState(false)

  function handleDesistir() {
    onDesistir()
    toast.success('Partida encerrada por desistência.')
    setAberto(false)
  }

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Desistência</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Encerrar por desistência?</AlertDialogTitle>
          <AlertDialogDescription>
            Use quando os jogadores abandonarem a partida sem chegar a um resultado. A partida é
            encerrada sem equipe vencedora e sem gerar cobrança de derrota nem crédito de vitória
            para ninguém. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDesistir}>
            Confirmar desistência
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
