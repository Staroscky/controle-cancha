import { useState } from 'react'
import { toast } from 'sonner'
import type { CategoriaConsumo } from '@/domain/types/CategoriaConsumo'
import { CategoriaIcon } from '@/ui/components/CategoriaIcon'
import { Button } from '@/ui/components/ui/button'
import { Combobox } from '@/ui/components/ui/combobox'
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

type NovoItemConsumoSheetProps = {
  categorias: CategoriaConsumo[]
  onCadastrar: (nome: string, valor: number, categoriaId: string | null) => void
}

export function NovoItemConsumoSheet({ categorias, onCadastrar }: NovoItemConsumoSheetProps) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [categoriaId, setCategoriaId] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) {
      setNome('')
      setValor('')
      setCategoriaId('')
    }
    setAberto(aberto)
  }

  function handleCadastrar() {
    const valorNumerico = Number(valor)

    if (!nome.trim()) {
      toast.error('Informe o nome do item.')
      return
    }

    if (Number.isNaN(valorNumerico) || valorNumerico < 0) {
      toast.error('Informe um valor válido e não negativo.')
      return
    }

    onCadastrar(nome.trim(), valorNumerico, categoriaId || null)
    toast.success('Item cadastrado no catálogo.')
    setAberto(false)
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button>Novo item</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Novo item do catálogo</SheetTitle>
          <SheetDescription>
            Cadastre um item com valor sugerido para agilizar o lançamento de consumo.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="novo-item-nome">Nome</Label>
            <Input id="novo-item-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="novo-item-valor">Valor sugerido</Label>
            <Input
              id="novo-item-valor"
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="novo-item-categoria">Categoria</Label>
            <Combobox
              id="novo-item-categoria"
              value={categoriaId}
              onValueChange={setCategoriaId}
              options={categorias.map((categoria) => ({
                value: categoria.id,
                label: categoria.nome,
                icon: <CategoriaIcon icone={categoria.icone} className="size-4" />,
              }))}
              placeholder="Sem categoria"
              searchPlaceholder="Filtrar categoria..."
              emptyText="Nenhuma categoria cadastrada."
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleCadastrar}>Cadastrar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
