import { useState } from 'react'
import { toast } from 'sonner'
import type { ConfiguracaoPadrao } from '@/domain/types/ConfiguracaoPadrao'
import { Button } from '@/ui/components/ui/button'
import { Input } from '@/ui/components/ui/input'
import { Label } from '@/ui/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/ui/sheet'

type CriarPartidaSheetProps = {
  configuracaoPadrao: ConfiguracaoPadrao
  onCriar: (valores: { valorMinimoConsumacao: number; valorPartidaPorCliente: number }) => void
}

export function CriarPartidaSheet({ configuracaoPadrao, onCriar }: CriarPartidaSheetProps) {
  const [aberto, setAberto] = useState(false)
  const [valorMinimoConsumacao, setValorMinimoConsumacao] = useState('')
  const [valorPartidaPorCliente, setValorPartidaPorCliente] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) {
      setValorMinimoConsumacao(String(configuracaoPadrao.valorMinimoConsumacao))
      setValorPartidaPorCliente(String(configuracaoPadrao.valorPartidaPorCliente))
    }
    setAberto(aberto)
  }

  function handleCriar() {
    const minimo = Number(valorMinimoConsumacao)
    const porCliente = Number(valorPartidaPorCliente)

    if (Number.isNaN(minimo) || Number.isNaN(porCliente) || minimo < 0 || porCliente < 0) {
      toast.error('Informe valores válidos e não negativos.')
      return
    }

    onCriar({ valorMinimoConsumacao: minimo, valorPartidaPorCliente: porCliente })
    toast.success('Partida criada.')
    setAberto(false)
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button>Nova partida</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova partida</SheetTitle>
          <SheetDescription>
            Pré-preenchido com a configuração padrão. Ajuste se essa partida usar valores
            diferentes.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="nova-partida-minimo">Valor mínimo de consumação</Label>
            <Input
              id="nova-partida-minimo"
              type="number"
              min={0}
              step="0.01"
              value={valorMinimoConsumacao}
              onChange={(e) => setValorMinimoConsumacao(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nova-partida-por-cliente">Valor da partida por cliente</Label>
            <Input
              id="nova-partida-por-cliente"
              type="number"
              min={0}
              step="0.01"
              value={valorPartidaPorCliente}
              onChange={(e) => setValorPartidaPorCliente(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleCriar}>Criar partida</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
