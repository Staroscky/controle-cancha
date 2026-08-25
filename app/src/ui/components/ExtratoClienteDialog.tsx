import { Banknote, Receipt, Trophy, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import type { Cliente } from '@/domain/types/Cliente'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'
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

function iconeDoLancamento(tipoId: string): LucideIcon {
  switch (tipoId) {
    case TIPO_LANCAMENTO_IDS.creditoPartida:
    case TIPO_LANCAMENTO_IDS.debitoPartida:
      return Trophy
    case TIPO_LANCAMENTO_IDS.pagamento:
      return Banknote
    default:
      return Receipt
  }
}

type ExtratoClienteDialogProps = {
  cliente: Cliente
  lancamentos: LancamentoFinanceiro[]
}

export function ExtratoClienteDialog({ cliente, lancamentos }: ExtratoClienteDialogProps) {
  const [aberto, setAberto] = useState(false)
  const ordenados = [...lancamentos].sort((a, b) => {
    if (a.criadoEm < b.criadoEm) return -1
    if (a.criadoEm > b.criadoEm) return 1
    return 0
  })
  const saldo = calcularSaldo(lancamentos, cliente.id)

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Ver extrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Extrato — {cliente.nome}</DialogTitle>
          <DialogDescription>Lançamentos do mais antigo para o mais recente.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto">
          {ordenados.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum lançamento para este cliente.</p>
          )}

          <ul className="space-y-1">
            {ordenados.map((lancamento) => {
              const Icone = iconeDoLancamento(lancamento.tipoId)
              return (
                <li
                  key={lancamento.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icone className="size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p>{lancamento.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatoData.format(new Date(lancamento.criadoEm))}
                      </p>
                    </div>
                  </div>
                  <span className={lancamento.valor < 0 ? 'text-destructive' : 'text-emerald-600'}>
                    {formatoMoeda.format(lancamento.valor)}
                  </span>
                </li>
              )
            })}
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
