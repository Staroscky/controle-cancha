import { useState } from 'react'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import type { Cliente } from '@/domain/types/Cliente'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { Button } from '@/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/ui/dialog'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

type ExtratoClienteDialogProps = {
  cliente: Cliente
  lancamentos: LancamentoFinanceiro[]
}

export function ExtratoClienteDialog({ cliente, lancamentos }: ExtratoClienteDialogProps) {
  const [aberto, setAberto] = useState(false)
  const ordenados = [...lancamentos].sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
  const saldo = calcularSaldo(lancamentos, cliente.id)

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Ver extrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extrato — {cliente.nome}</DialogTitle>
          <DialogDescription>Lançamentos do mais recente para o mais antigo.</DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {ordenados.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum lançamento para este cliente.</p>
          )}

          <ul className="space-y-1">
            {ordenados.map((lancamento) => (
              <li
                key={lancamento.id}
                className="flex items-center justify-between rounded-md bg-muted px-2 py-1.5 text-xs"
              >
                <div>
                  <p>{lancamento.descricao}</p>
                  <p className="text-muted-foreground">
                    {formatoData.format(new Date(lancamento.criadoEm))}
                  </p>
                </div>
                <span className={lancamento.valor < 0 ? 'text-destructive' : 'text-emerald-600'}>
                  {formatoMoeda.format(lancamento.valor)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between">
          <span className="text-sm font-medium">Saldo</span>
          <span className={saldo < 0 ? 'text-destructive' : 'text-emerald-600'}>
            {formatoMoeda.format(saldo)}
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
