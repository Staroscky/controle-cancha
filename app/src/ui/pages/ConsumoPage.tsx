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
import { Input } from '@/ui/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table'
import { NovoItemConsumoSheet } from '@/ui/components/NovoItemConsumoSheet'
import { useConsumo } from '@/ui/hooks/useConsumo'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ConsumoPage() {
  const { itens, cadastrarItem, editarItem, removerItem } = useConsumo()
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nomeEdicao, setNomeEdicao] = useState('')
  const [valorEdicao, setValorEdicao] = useState('')
  const [filtro, setFiltro] = useState('')
  const itensFiltrados = itens.filter((item) =>
    item.nome.toLowerCase().includes(filtro.trim().toLowerCase()),
  )

  function iniciarEdicao(id: string, nomeAtual: string, valorAtual: number) {
    setEditandoId(id)
    setNomeEdicao(nomeAtual)
    setValorEdicao(String(valorAtual))
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

    editarItem(editandoId, nomeEdicao.trim(), valorNumerico)
    toast.success('Item atualizado.')
    setEditandoId(null)
  }

  function handleRemover(id: string) {
    removerItem(id)
    toast.success('Item removido do catálogo.')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Catálogo de itens</h2>
        <NovoItemConsumoSheet onCadastrar={cadastrarItem} />
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
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensFiltrados.map((item) => (
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
                            onClick={() => iniciarEdicao(item.id, item.nome, item.valor)}
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
