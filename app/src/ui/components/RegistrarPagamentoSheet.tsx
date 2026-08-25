import { useState } from 'react'
import { toast } from 'sonner'
import type { Cliente } from '@/domain/types/Cliente'
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

type RegistrarPagamentoSheetProps = {
  cliente: Cliente
  saldo: number
  onRegistrar: (clienteId: string, valor: number, descricao: string) => boolean
  onSugerirSaida: (clienteId: string) => void
}

export function RegistrarPagamentoSheet({
  cliente,
  saldo,
  onRegistrar,
  onSugerirSaida,
}: RegistrarPagamentoSheetProps) {
  const [aberto, setAberto] = useState(false)
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) {
      setValor(String(Math.abs(saldo)))
      setDescricao('')
    }
    setAberto(aberto)
  }

  function handleConfirmar() {
    const valorNumerico = Number(valor)

    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }

    const registrado = onRegistrar(cliente.id, valorNumerico, descricao)
    if (!registrado) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }

    setAberto(false)
    toast.success(`Pagamento de ${cliente.nome} registrado.`, {
      action: {
        label: 'Marcar saída',
        onClick: () => onSugerirSaida(cliente.id),
      },
    })
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button size="sm">Registrar pagamento</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Registrar pagamento — {cliente.nome}</SheetTitle>
          <SheetDescription>
            Valor sugerido é o saldo devedor. Pode ser editado para um pagamento parcial.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="pagamento-valor">Valor</Label>
            <Input
              id="pagamento-valor"
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pagamento-descricao">Descrição</Label>
            <Input
              id="pagamento-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Pagamento em dinheiro, Pix"
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleConfirmar}>Confirmar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
