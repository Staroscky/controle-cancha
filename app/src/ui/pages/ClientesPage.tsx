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
import { Badge } from '@/ui/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table'
import { QuadroPresenca } from '@/ui/components/QuadroPresenca'
import { useClientes } from '@/ui/hooks/useClientes'

export function ClientesPage() {
  const {
    clientes,
    grupos,
    cadastrar,
    renomear,
    remover,
    definirPresenca,
    agrupar,
    desagrupar,
    renomearGrupoDoBloco,
  } = useClientes()
  const [nome, setNome] = useState('')
  const [aberto, setAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nomeEdicao, setNomeEdicao] = useState('')
  const [filtro, setFiltro] = useState('')
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(filtro.trim().toLowerCase()),
  )

  function handleCadastrar() {
    if (!nome.trim()) return

    try {
      cadastrar(nome)
      toast.success('Cliente cadastrado.')
      setNome('')
      setAberto(false)
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao cadastrar cliente.')
    }
  }

  function iniciarEdicao(id: string, nomeAtual: string) {
    setEditandoId(id)
    setNomeEdicao(nomeAtual)
  }

  function confirmarEdicao() {
    if (!editandoId) return
    if (!nomeEdicao.trim()) {
      setEditandoId(null)
      return
    }

    try {
      renomear(editandoId, nomeEdicao)
      toast.success('Cliente atualizado.')
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao atualizar cliente.')
    } finally {
      setEditandoId(null)
    }
  }

  function handleRemover(id: string) {
    remover(id)
    toast.success('Cliente excluído.')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clientes</h2>
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetTrigger asChild>
            <Button>Novo cliente</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Cadastrar cliente</SheetTitle>
              <SheetDescription>Informe o nome do cliente.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-2 px-4">
              <Label htmlFor="nome-cliente">Nome</Label>
              <Input
                id="nome-cliente"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCadastrar()}
                autoFocus
              />
            </div>
            <SheetFooter>
              <Button onClick={handleCadastrar}>Cadastrar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Lista de clientes</h3>
            <Input
              placeholder="Filtrar por nome..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="h-8 max-w-48"
            />
          </div>

          {clientes.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
          )}

          {clientes.length > 0 && clientesFiltrados.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum cliente encontrado para "{filtro}".
            </p>
          )}

          {clientesFiltrados.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        {editandoId === cliente.id ? (
                          <Input
                            autoFocus
                            value={nomeEdicao}
                            onChange={(e) => setNomeEdicao(e.target.value)}
                            onBlur={confirmarEdicao}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmarEdicao()
                              if (e.key === 'Escape') setEditandoId(null)
                            }}
                            className="h-8"
                          />
                        ) : (
                          <span className="truncate">{cliente.nome}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cliente.presente ? 'default' : 'secondary'}>
                          {cliente.presente ? 'Presente' : 'Ausente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => definirPresenca(cliente.id, !cliente.presente)}
                          >
                            {cliente.presente ? 'Marcar saída' : 'Marcar chegada'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => iniciarEdicao(cliente.id, cliente.nome)}
                            title="Editar cliente"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                title="Excluir cliente"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{cliente.nome}"? Essa ação não
                                  pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemover(cliente.id)}>
                                  Excluir
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

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Presentes no estabelecimento
          </h3>
          <p className="text-xs text-muted-foreground">
            Arraste um cliente sobre outro para agrupar (ex.: famílias). Solte fora de um
            grupo para desvincular.
          </p>
          <QuadroPresenca
            clientes={clientes}
            grupos={grupos}
            onAgrupar={agrupar}
            onDesagrupar={desagrupar}
            onRenomearGrupo={renomearGrupoDoBloco}
          />
        </div>
      </div>
    </div>
  )
}
