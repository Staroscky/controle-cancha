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

type ConfiguracaoPadraoSheetProps = {
  configuracao: ConfiguracaoPadrao
  onAtualizar: (valores: {
    valorMinimoConsumacao: number
    valorPartidaPorCliente: number
  }) => void
}

export function ConfiguracaoPadraoSheet({
  configuracao,
  onAtualizar,
}: ConfiguracaoPadraoSheetProps) {
  const [aberto, setAberto] = useState(false)
  const [valorMinimoConsumacao, setValorMinimoConsumacao] = useState('')
  const [valorPartidaPorCliente, setValorPartidaPorCliente] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) {
      setValorMinimoConsumacao(String(configuracao.valorMinimoConsumacao))
      setValorPartidaPorCliente(String(configuracao.valorPartidaPorCliente))
    }
    setAberto(aberto)
  }

  function handleSalvar() {
    const minimo = Number(valorMinimoConsumacao)
    const porCliente = Number(valorPartidaPorCliente)

    if (Number.isNaN(minimo) || Number.isNaN(porCliente) || minimo < 0 || porCliente < 0) {
      toast.error('Informe valores válidos e não negativos.')
      return
    }

    onAtualizar({ valorMinimoConsumacao: minimo, valorPartidaPorCliente: porCliente })
    toast.success('Configuração padrão atualizada.')
    setAberto(false)
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button variant="outline">Configuração padrão</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configuração padrão</SheetTitle>
          <SheetDescription>
            Valores usados para pré-preencher novas partidas. Cada partida pode sobrescrever
            esses valores.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="valor-minimo-consumacao">Valor mínimo de consumação</Label>
            <Input
              id="valor-minimo-consumacao"
              type="number"
              min={0}
              step="0.01"
              value={valorMinimoConsumacao}
              onChange={(e) => setValorMinimoConsumacao(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="valor-partida-por-cliente">Valor da partida por cliente</Label>
            <Input
              id="valor-partida-por-cliente"
              type="number"
              min={0}
              step="0.01"
              value={valorPartidaPorCliente}
              onChange={(e) => setValorPartidaPorCliente(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSalvar}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
