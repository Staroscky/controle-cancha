import { useState } from 'react'
import { toast } from 'sonner'
import { listarLancamentos } from '@/data/lancamentosRepo'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
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
import { useClientes } from '@/ui/hooks/useClientes'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ClientesPage() {
  const { clientes, cadastrar, definirPresenca } = useClientes()
  const [nome, setNome] = useState('')
  const [aberto, setAberto] = useState(false)
  const lancamentos = listarLancamentos()

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

      {clientes.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      )}

      <ul className="space-y-2">
        {clientes.map((cliente) => {
          const saldo = calcularSaldo(lancamentos, cliente.id)
          return (
            <li
              key={cliente.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-2">
                <span>{cliente.nome}</span>
                <Badge variant={cliente.presente ? 'default' : 'secondary'}>
                  {cliente.presente ? 'Presente' : 'Ausente'}
                </Badge>
                {saldo !== 0 && (
                  <span className={saldo < 0 ? 'text-destructive' : 'text-emerald-600'}>
                    {formatoMoeda.format(saldo)}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => definirPresenca(cliente.id, !cliente.presente)}
              >
                {cliente.presente ? 'Marcar saída' : 'Marcar chegada'}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
