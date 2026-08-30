import { useState } from 'react'
import { toast } from 'sonner'
import { ICONE_CATEGORIA_PADRAO, IconeCategoriaPicker } from '@/ui/components/CategoriaIcon'
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

type NovaCategoriaConsumoSheetProps = {
  onCadastrar: (nome: string, icone: string) => void
}

export function NovaCategoriaConsumoSheet({ onCadastrar }: NovaCategoriaConsumoSheetProps) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState(ICONE_CATEGORIA_PADRAO)

  function abrir(aberto: boolean) {
    if (aberto) {
      setNome('')
      setIcone(ICONE_CATEGORIA_PADRAO)
    }
    setAberto(aberto)
  }

  function handleCadastrar() {
    if (!nome.trim()) {
      toast.error('Informe o nome da categoria.')
      return
    }

    onCadastrar(nome.trim(), icone)
    toast.success('Categoria cadastrada.')
    setAberto(false)
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button>Nova categoria</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova categoria</SheetTitle>
          <SheetDescription>
            Categorias (bebidas, petiscos, lanches...) organizam o catálogo e agrupam os itens na
            hora de lançar consumo.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="nova-categoria-nome">Nome</Label>
            <Input
              id="nova-categoria-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">Ícone</span>
            <IconeCategoriaPicker value={icone} onValueChange={setIcone} />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleCadastrar}>Cadastrar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
