import { PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
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

type EditarItemConsumoSheetProps = {
  item: ItemConsumo
  onEditar: (id: string, nome: string, valor: number) => void
}

export function EditarItemConsumoSheet({ item, onEditar }: EditarItemConsumoSheetProps) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) {
      setNome(item.nome)
      setValor(String(item.valor))
    }
    setAberto(aberto)
  }

  function handleSalvar() {
    const valorNumerico = Number(valor)

    if (!nome.trim()) {
      toast.error('Informe o nome do item.')
      return
    }

    if (Number.isNaN(valorNumerico) || valorNumerico < 0) {
      toast.error('Informe um valor válido e não negativo.')
      return
    }

    onEditar(item.id, nome.trim(), valorNumerico)
    toast.success('Item atualizado.')
    setAberto(false)
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="icon-xs" title="Editar item">
          <PencilIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar item do catálogo</SheetTitle>
          <SheetDescription>
            Itens já lançados como consumo mantêm a descrição e o valor de quando foram
            lançados.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="editar-item-nome">Nome</Label>
            <Input id="editar-item-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editar-item-valor">Valor sugerido</Label>
            <Input
              id="editar-item-valor"
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
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
