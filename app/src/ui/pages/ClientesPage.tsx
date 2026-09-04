import { Eraser, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { normalizarTextoBusca } from '@/domain/rules/normalizarTextoBusca'
import type { Cliente } from '@/domain/types/Cliente'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/ui/alert-dialog'
import { Badge } from '@/ui/components/ui/badge'
import { Button } from '@/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu'
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
import { AjudaPagina } from '@/ui/components/AjudaPagina'
import { QuadroPresenca } from '@/ui/components/QuadroPresenca'
import { useClientes } from '@/ui/hooks/useClientes'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

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
    saldoDoCliente,
    limparHistorico,
    clientesComPendencia,
    limparHistoricoDeTodos,
  } = useClientes()
  const [nome, setNome] = useState('')
  const [aberto, setAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nomeEdicao, setNomeEdicao] = useState('')
  const [clienteParaExcluir, setClienteParaExcluir] = useState<{ id: string; nome: string } | null>(
    null,
  )
  const [clienteParaLimparHistorico, setClienteParaLimparHistorico] = useState<{
    id: string
    nome: string
  } | null>(null)
  const [clienteComPendencia, setClienteComPendencia] = useState<{ nome: string; saldo: number } | null>(
    null,
  )
  const [confirmarZerarTodos, setConfirmarZerarTodos] = useState(false)
  const [pendentesZerarTodos, setPendentesZerarTodos] = useState<
    { cliente: Cliente; saldo: number }[]
  >([])
  const [filtro, setFiltro] = useState('')
  const clientesFiltrados = clientes.filter((cliente) =>
    normalizarTextoBusca(cliente.nome).includes(normalizarTextoBusca(filtro.trim())),
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

  function handleRemover() {
    if (!clienteParaExcluir) return
    remover(clienteParaExcluir.id)
    toast.success('Cliente excluído.')
    setClienteParaExcluir(null)
  }

  function handleLimparHistorico() {
    if (!clienteParaLimparHistorico) return
    const limpou = limparHistorico(clienteParaLimparHistorico.id)
    if (limpou) {
      toast.success('Histórico limpo.')
    } else {
      toast.error('Não é possível limpar o histórico com crédito ou débito em aberto.')
    }
    setClienteParaLimparHistorico(null)
  }

  function abrirZerarTodos() {
    setPendentesZerarTodos(clientesComPendencia())
    setConfirmarZerarTodos(true)
  }

  function handleZerarTodos() {
    const pendentes = limparHistoricoDeTodos()
    if (pendentes.length > 0) {
      toast.success(
        `Histórico zerado. ${pendentes.length} cliente(s) com pendência não foram afetados.`,
      )
    } else {
      toast.success('Histórico de todos os clientes foi zerado.')
    }
    setConfirmarZerarTodos(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold">Clientes</h2>
          <AjudaPagina
            titulo="Como funciona a aba Clientes"
            itens={[
              'Cadastre aqui todos os clientes do estabelecimento. O nome precisa ser único (não dá pra cadastrar dois clientes com o mesmo nome).',
              '"Marcar chegada" indica que o cliente está no local agora — isso não gera nenhuma cobrança, é só um controle de presença.',
              'Só clientes marcados como presentes aparecem para escolha nas abas Partida e Comandas.',
              'Arraste um cliente sobre outro no quadro da direita para agrupar (ex.: uma família na mesma mesa). O grupo aparece junto na aba Comandas.',
              '"Marcar saída" pode ser feita mesmo com saldo pendente — o saldo continua registrado e pode ser acertado depois na aba Comandas.',
              '"Limpar histórico" apaga o extrato financeiro do cliente (consumo, pagamentos, partidas). Só é permitido quando o saldo dele está zerado.',
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={abrirZerarTodos}
            disabled={clientes.length === 0}
          >
            <Eraser className="size-4" />
            Zerar histórico de todos
          </Button>
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
                  {clientesFiltrados.map((cliente) => {
                    const saldo = saldoDoCliente(cliente.id)
                    const temSaldoEmAberto = Math.abs(saldo) >= 0.005
                    return (
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" title="Ações do cliente">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onSelect={() => iniciarEdicao(cliente.id, cliente.nome)}
                              >
                                <Pencil className="size-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  temSaldoEmAberto
                                    ? setClienteComPendencia({ nome: cliente.nome, saldo })
                                    : setClienteParaLimparHistorico({ id: cliente.id, nome: cliente.nome })
                                }
                              >
                                <Eraser className="size-4" />
                                Limpar histórico
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() =>
                                  setClienteParaExcluir({ id: cliente.id, nome: cliente.nome })
                                }
                              >
                                <Trash2 className="size-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <AlertDialog
        open={clienteComPendencia !== null}
        onOpenChange={(aberto) => !aberto && setClienteComPendencia(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Não é possível limpar o histórico</AlertDialogTitle>
            <AlertDialogDescription>
              "{clienteComPendencia?.nome}" tem{' '}
              {clienteComPendencia && clienteComPendencia.saldo < 0 ? 'um débito' : 'um crédito'} em
              aberto de {formatoMoeda.format(Math.abs(clienteComPendencia?.saldo ?? 0))}. Acerte o
              saldo do cliente antes de limpar o histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setClienteComPendencia(null)}>Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={clienteParaLimparHistorico !== null}
        onOpenChange={(aberto) => !aberto && setClienteParaLimparHistorico(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar histórico</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai apagar todo o extrato financeiro de "{clienteParaLimparHistorico?.nome}"
              (consumo, pagamentos e partidas). Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLimparHistorico}>Limpar histórico</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmarZerarTodos}
        onOpenChange={(aberto) => !aberto && setConfirmarZerarTodos(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zerar histórico de todos os clientes</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai apagar todo o extrato financeiro (consumo, pagamentos e partidas) dos
              clientes sem pendência. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendentesZerarTodos.length > 0 && (
            <div className="rounded-md border bg-muted/50 p-3 text-sm">
              <p className="mb-2 font-medium">
                {pendentesZerarTodos.length} cliente(s) com pendência não terão o histórico
                apagado:
              </p>
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {pendentesZerarTodos.map(({ cliente, saldo }) => (
                  <li key={cliente.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{cliente.nome}</span>
                    <span className="whitespace-nowrap text-muted-foreground">
                      {saldo < 0 ? 'débito' : 'crédito'} de {formatoMoeda.format(Math.abs(saldo))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleZerarTodos}>Zerar histórico</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={clienteParaExcluir !== null}
        onOpenChange={(aberto) => !aberto && setClienteParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{clienteParaExcluir?.nome}"? Essa ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemover}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
