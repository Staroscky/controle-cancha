import { useState } from 'react'
import { toast } from 'sonner'
import type { Cliente } from '@/domain/types/Cliente'
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

const SELECT_CLASSNAME =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30'

type Origem = 'catalogo' | 'avulso'

type LancarConsumoSheetProps = {
  itens: ItemConsumo[]
  clientes: Cliente[]
  onLancar: (descricao: string, valor: number, itemId: string | null, clienteIds: string[]) => void
}

export function LancarConsumoSheet({ itens, clientes, onLancar }: LancarConsumoSheetProps) {
  const clientesPresentes = clientes.filter((c) => c.presente)

  const [aberto, setAberto] = useState(false)
  const [origem, setOrigem] = useState<Origem>('catalogo')
  const [itemId, setItemId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [clienteIds, setClienteIds] = useState<string[]>([])

  function abrir(aberto: boolean) {
    if (aberto) {
      setOrigem('catalogo')
      setItemId('')
      setDescricao('')
      setValor('')
      setClienteIds([])
    }
    setAberto(aberto)
  }

  function handleSelecionarOrigem(novaOrigem: Origem) {
    setOrigem(novaOrigem)
    setItemId('')
    setDescricao('')
    setValor('')
  }

  function handleSelecionarItem(id: string) {
    setItemId(id)
    const item = itens.find((i) => i.id === id)
    if (item) {
      setDescricao(item.nome)
      setValor(String(item.valor))
    }
  }

  function toggleCliente(id: string) {
    setClienteIds((atuais) =>
      atuais.includes(id) ? atuais.filter((c) => c !== id) : [...atuais, id],
    )
  }

  function handleConfirmar() {
    const valorNumerico = Number(valor)

    if (!descricao.trim() || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Informe uma descrição e um valor válido (maior que zero).')
      return
    }

    if (clienteIds.length === 0) {
      toast.error('Selecione ao menos 1 cliente.')
      return
    }

    onLancar(descricao.trim(), valorNumerico, origem === 'catalogo' ? itemId || null : null, clienteIds)
    toast.success(
      clienteIds.length === 1
        ? `${descricao.trim()} lançado para 1 cliente.`
        : `${descricao.trim()} lançado para ${clienteIds.length} clientes.`,
    )
    setAberto(false)
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button>Lançar consumo</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Lançar consumo</SheetTitle>
          <SheetDescription>
            Escolha o item e os clientes presentes que vão dividir o valor.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <span className="text-sm font-medium">Item</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={origem === 'catalogo' ? 'default' : 'outline'}
                onClick={() => handleSelecionarOrigem('catalogo')}
                className="flex-1"
              >
                Do catálogo
              </Button>
              <Button
                type="button"
                variant={origem === 'avulso' ? 'default' : 'outline'}
                onClick={() => handleSelecionarOrigem('avulso')}
                className="flex-1"
              >
                Avulso
              </Button>
            </div>
          </div>

          {origem === 'catalogo' && (
            <div className="grid gap-2">
              <Label htmlFor="consumo-item-catalogo">Item do catálogo</Label>
              <select
                id="consumo-item-catalogo"
                className={SELECT_CLASSNAME}
                value={itemId}
                onChange={(e) => handleSelecionarItem(e.target.value)}
              >
                <option value="">Selecione um item</option>
                {itens.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
              {itens.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum item cadastrado no catálogo.</p>
              )}
            </div>
          )}

          {origem === 'avulso' && (
            <div className="grid gap-2">
              <Label htmlFor="consumo-descricao">Descrição</Label>
              <Input
                id="consumo-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="consumo-valor">Valor</Label>
            <Input
              id="consumo-valor"
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium">Clientes</span>
            <div className="flex flex-wrap gap-2">
              {clientesPresentes.map((cliente) => (
                <Button
                  key={cliente.id}
                  type="button"
                  size="sm"
                  variant={clienteIds.includes(cliente.id) ? 'default' : 'outline'}
                  onClick={() => toggleCliente(cliente.id)}
                >
                  {cliente.nome}
                </Button>
              ))}
            </div>
            {clientesPresentes.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum cliente presente no momento.</p>
            )}
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleConfirmar}>Confirmar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
