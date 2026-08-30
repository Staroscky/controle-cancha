import { Pencil, Trash2 } from 'lucide-react'
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
import { Combobox } from '@/ui/components/ui/combobox'
import { Input } from '@/ui/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table'
import { CategoriaIcon, IconeCategoriaPicker } from '@/ui/components/CategoriaIcon'
import { NovaCategoriaConsumoSheet } from '@/ui/components/NovaCategoriaConsumoSheet'
import { NovoItemConsumoSheet } from '@/ui/components/NovoItemConsumoSheet'
import { useCategoriasConsumo } from '@/ui/hooks/useCategoriasConsumo'
import { useConsumo } from '@/ui/hooks/useConsumo'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ConsumoPage() {
  const { itens, cadastrarItem, editarItem, removerItem, recarregarItens } = useConsumo()
  const { categorias, cadastrarCategoria, editarCategoria, removerCategoria } = useCategoriasConsumo()
  const categoriasPorId = new Map(categorias.map((c) => [c.id, c]))

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nomeEdicao, setNomeEdicao] = useState('')
  const [valorEdicao, setValorEdicao] = useState('')
  const [categoriaEdicaoId, setCategoriaEdicaoId] = useState('')
  const [filtro, setFiltro] = useState('')
  const itensFiltrados = itens.filter((item) =>
    item.nome.toLowerCase().includes(filtro.trim().toLowerCase()),
  )

  const [categoriaEditandoId, setCategoriaEditandoId] = useState<string | null>(null)
  const [nomeCategoriaEdicao, setNomeCategoriaEdicao] = useState('')

  function iniciarEdicao(id: string, nomeAtual: string, valorAtual: number, categoriaIdAtual: string | null) {
    setEditandoId(id)
    setNomeEdicao(nomeAtual)
    setValorEdicao(String(valorAtual))
    setCategoriaEdicaoId(categoriaIdAtual ?? '')
  }

  function confirmarEdicao() {
    if (!editandoId) return

    const valorNumerico = Number(valorEdicao)

    if (!nomeEdicao.trim()) {
      toast.error('Informe o nome do item.')
      return
    }

    if (Number.isNaN(valorNumerico) || valorNumerico < 0) {
      toast.error('Informe um valor válido e não negativo.')
      return
    }

    editarItem(editandoId, nomeEdicao.trim(), valorNumerico, categoriaEdicaoId || null)
    toast.success('Item atualizado.')
    setEditandoId(null)
  }

  function handleRemover(id: string) {
    removerItem(id)
    toast.success('Item removido do catálogo.')
  }

  function iniciarEdicaoCategoria(id: string, nomeAtual: string) {
    setCategoriaEditandoId(id)
    setNomeCategoriaEdicao(nomeAtual)
  }

  function confirmarEdicaoCategoria() {
    if (!categoriaEditandoId) return

    if (!nomeCategoriaEdicao.trim()) {
      toast.error('Informe o nome da categoria.')
      return
    }

    const categoria = categoriasPorId.get(categoriaEditandoId)
    editarCategoria(categoriaEditandoId, nomeCategoriaEdicao.trim(), categoria?.icone ?? 'tag')
    toast.success('Categoria atualizada.')
    setCategoriaEditandoId(null)
  }

  function handleAlterarIconeCategoria(id: string, nome: string, icone: string) {
    editarCategoria(id, nome, icone)
  }

  function handleRemoverCategoria(id: string) {
    removerCategoria(id)
    recarregarItens()
    toast.success('Categoria removida. Os itens dela ficaram sem categoria.')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categorias</h2>
          <NovaCategoriaConsumoSheet onCadastrar={cadastrarCategoria} />
        </div>

        {categorias.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria cadastrada ainda. Crie categorias como bebidas, petiscos e lanches
            para organizar o catálogo.
          </p>
        )}

        {categorias.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableBody>
                {categorias.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="w-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="ghost" size="icon-sm" title="Alterar ícone">
                            <CategoriaIcon icone={categoria.icone} className="size-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-2">
                          <IconeCategoriaPicker
                            value={categoria.icone}
                            onValueChange={(icone) =>
                              handleAlterarIconeCategoria(categoria.id, categoria.nome, icone)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      {categoriaEditandoId === categoria.id ? (
                        <Input
                          autoFocus
                          value={nomeCategoriaEdicao}
                          onChange={(e) => setNomeCategoriaEdicao(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmarEdicaoCategoria()
                            if (e.key === 'Escape') setCategoriaEditandoId(null)
                          }}
                          className="h-8"
                        />
                      ) : (
                        <span className="truncate">{categoria.nome}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {categoriaEditandoId === categoria.id ? (
                          <Button type="button" size="sm" onClick={confirmarEdicaoCategoria}>
                            Salvar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            title="Renomear categoria"
                            onClick={() => iniciarEdicaoCategoria(categoria.id, categoria.nome)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              title="Remover categoria"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Os itens de "{categoria.nome}" continuam no catálogo, mas ficam sem
                                categoria.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoverCategoria(categoria.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Catálogo de itens</h2>
          <NovoItemConsumoSheet categorias={categorias} onCadastrar={cadastrarItem} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Input
              placeholder="Filtrar por nome..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="h-8 max-w-48"
            />
          </div>

          {itens.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum item cadastrado ainda.</p>
          )}

          {itens.length > 0 && itensFiltrados.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum item encontrado para "{filtro}".</p>
          )}

          {itensFiltrados.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensFiltrados.map((item) => {
                    const categoria = item.categoriaId ? categoriasPorId.get(item.categoriaId) : undefined
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {editandoId === item.id ? (
                            <Input
                              autoFocus
                              value={nomeEdicao}
                              onChange={(e) => setNomeEdicao(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmarEdicao()
                                if (e.key === 'Escape') setEditandoId(null)
                              }}
                              className="h-8"
                            />
                          ) : (
                            <span className="truncate">{item.nome}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editandoId === item.id ? (
                            <Combobox
                              value={categoriaEdicaoId}
                              onValueChange={setCategoriaEdicaoId}
                              options={categorias.map((c) => ({
                                value: c.id,
                                label: c.nome,
                                icon: <CategoriaIcon icone={c.icone} className="size-4" />,
                              }))}
                              placeholder="Sem categoria"
                              searchPlaceholder="Filtrar categoria..."
                              emptyText="Nenhuma categoria cadastrada."
                              className="h-8"
                            />
                          ) : categoria ? (
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <CategoriaIcon icone={categoria.icone} className="size-4" />
                              {categoria.nome}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {editandoId === item.id ? (
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={valorEdicao}
                              onChange={(e) => setValorEdicao(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmarEdicao()
                                if (e.key === 'Escape') setEditandoId(null)
                              }}
                              className="ml-auto h-8 w-28"
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              {formatoMoeda.format(item.valor)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {editandoId === item.id ? (
                              <Button type="button" size="sm" onClick={confirmarEdicao}>
                                Salvar
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                title="Editar item"
                                onClick={() =>
                                  iniciarEdicao(item.id, item.nome, item.valor, item.categoriaId)
                                }
                              >
                                <Pencil className="size-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-destructive hover:text-destructive"
                                  title="Remover item"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover item do catálogo?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{item.nome}" deixará de aparecer na lista de itens do catálogo.
                                    Lançamentos de consumo já feitos com ele não são afetados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemover(item.id)}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
