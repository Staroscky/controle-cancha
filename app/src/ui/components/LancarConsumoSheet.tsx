import { useState } from 'react'
import { toast } from 'sonner'
import { agruparClientesPorGrupo, type Bloco } from '@/domain/rules/agruparClientesPorGrupo'
import type { CategoriaConsumo } from '@/domain/types/CategoriaConsumo'
import type { Cliente } from '@/domain/types/Cliente'
import type { Grupo } from '@/domain/types/Grupo'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
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

type Origem = 'catalogo' | 'avulso'

const SEM_CATEGORIA = 'Sem categoria'

type LancarConsumoSheetProps = {
  itens: ItemConsumo[]
  categorias?: CategoriaConsumo[]
  clientes: Cliente[]
  grupos?: Grupo[]
  onLancar: (descricao: string, valor: number, itemId: string | null, clienteIds: string[]) => void
  clienteIdsPadrao?: string[]
  titulo?: string
}

export function LancarConsumoSheet({
  itens,
  categorias,
  clientes,
  grupos,
  onLancar,
  clienteIdsPadrao,
  titulo,
}: LancarConsumoSheetProps) {
  const clientesPresentes = clientes.filter((c) => c.presente)

  const [aberto, setAberto] = useState(false)
  const [origem, setOrigem] = useState<Origem>('catalogo')
  const [itemId, setItemId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [clienteIds, setClienteIds] = useState<string[]>([])
  const [filtroCliente, setFiltroCliente] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) {
      setOrigem('catalogo')
      setItemId('')
      setDescricao('')
      setValor('')
      setClienteIds(clienteIdsPadrao ?? [])
      setFiltroCliente('')
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
    setDescricao(item?.nome ?? '')
    setValor(item ? String(item.valor) : '')
  }

  function toggleCliente(id: string) {
    setClienteIds((atuais) =>
      atuais.includes(id) ? atuais.filter((c) => c !== id) : [...atuais, id],
    )
  }

  function toggleGrupo(bloco: Bloco) {
    const idsGrupo = bloco.membros.map((m) => m.id)
    const todosSelecionados = idsGrupo.every((id) => clienteIds.includes(id))
    setClienteIds((atuais) =>
      todosSelecionados
        ? atuais.filter((id) => !idsGrupo.includes(id))
        : [...atuais, ...idsGrupo.filter((id) => !atuais.includes(id))],
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

  const categoriasPorId = new Map((categorias ?? []).map((c) => [c.id, c]))
  const itensOrdenadosPorCategoria = [...itens].sort((a, b) => {
    const nomeCategoriaA = a.categoriaId ? (categoriasPorId.get(a.categoriaId)?.nome ?? '') : ''
    const nomeCategoriaB = b.categoriaId ? (categoriasPorId.get(b.categoriaId)?.nome ?? '') : ''
    if (nomeCategoriaA !== nomeCategoriaB) {
      if (!nomeCategoriaA) return 1
      if (!nomeCategoriaB) return -1
      return nomeCategoriaA.localeCompare(nomeCategoriaB, 'pt-BR')
    }
    return a.nome.localeCompare(b.nome, 'pt-BR')
  })
  const opcoesItens = itensOrdenadosPorCategoria.map((item) => {
    const categoria = item.categoriaId ? categoriasPorId.get(item.categoriaId) : undefined
    return {
      value: item.id,
      label: item.nome,
      group: categoria?.nome ?? SEM_CATEGORIA,
      icon: categoria ? <CategoriaIcon icone={categoria.icone} className="size-4" /> : undefined,
    }
  })

  const termoCliente = filtroCliente.trim().toLowerCase()
  const blocosClientes = agruparClientesPorGrupo(clientesPresentes, grupos ?? []).filter(
    (bloco) =>
      !termoCliente ||
      [bloco.nome, ...bloco.membros.map((m) => m.nome)].some((nome) =>
        nome?.toLowerCase().includes(termoCliente),
      ),
  )

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button>Lançar consumo</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{titulo ?? 'Lançar consumo'}</SheetTitle>
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
              <Combobox
                id="consumo-item-catalogo"
                value={itemId}
                onValueChange={handleSelecionarItem}
                options={opcoesItens}
                placeholder="Selecione um item"
                searchPlaceholder="Filtrar item..."
                emptyText="Nenhum item encontrado."
              />
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
            <span className="text-sm font-medium">
              Clientes {clienteIds.length > 0 && `(${clienteIds.length} selecionado${clienteIds.length > 1 ? 's' : ''})`}
            </span>
            {clientesPresentes.length > 0 && (
              <Input
                placeholder="Filtrar cliente ou grupo..."
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className="h-8"
              />
            )}
            <div className="max-h-56 divide-y overflow-y-auto rounded-md border">
              {blocosClientes.map((bloco) => (
                <div key={bloco.grupoId ?? bloco.membros[0].id}>
                  {bloco.grupoId && (
                    <label className="flex cursor-pointer items-center gap-2 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80">
                      <input
                        type="checkbox"
                        className="size-3.5 accent-foreground"
                        checked={bloco.membros.every((m) => clienteIds.includes(m.id))}
                        onChange={() => toggleGrupo(bloco)}
                      />
                      <span>{bloco.nome || 'Grupo'}</span>
                    </label>
                  )}
                  {bloco.membros.map((cliente) => (
                    <label
                      key={cliente.id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-foreground"
                        checked={clienteIds.includes(cliente.id)}
                        onChange={() => toggleCliente(cliente.id)}
                      />
                      <span>{cliente.nome}</span>
                    </label>
                  ))}
                </div>
              ))}
              {clientesPresentes.length > 0 && blocosClientes.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Nenhum cliente encontrado para "{filtroCliente}".
                </p>
              )}
              {clientesPresentes.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">Nenhum cliente presente no momento.</p>
              )}
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleConfirmar}>Confirmar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
