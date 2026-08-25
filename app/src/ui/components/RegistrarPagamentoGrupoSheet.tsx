import { useState } from 'react'
import { toast } from 'sonner'
import { alocarPagamentoGrupo } from '@/domain/rules/alocarPagamentoGrupo'
import type { ItemPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { Cliente } from '@/domain/types/Cliente'
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

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export type MembroGrupo = {
  cliente: Cliente
  saldo: number
}

type RegistrarPagamentoGrupoSheetProps = {
  nomeGrupo?: string
  membros: MembroGrupo[]
  onRegistrar: (itens: ItemPagamentoGrupo[], descricao: string) => boolean
  onSugerirSaidaGrupo: (clienteIds: string[]) => void
}

export function RegistrarPagamentoGrupoSheet({
  nomeGrupo,
  membros,
  onRegistrar,
  onSugerirSaidaGrupo,
}: RegistrarPagamentoGrupoSheetProps) {
  const devedores = membros.filter((m) => m.saldo < 0)
  const emDia = membros.filter((m) => m.saldo >= 0)
  const totalDevido = devedores.reduce((soma, m) => soma + Math.abs(m.saldo), 0)

  const [aberto, setAberto] = useState(false)
  const [valorGrupo, setValorGrupo] = useState('')
  const [descricao, setDescricao] = useState('')

  function abrir(aberto: boolean) {
    if (aberto) {
      setValorGrupo(String(totalDevido))
      setDescricao('')
    }
    setAberto(aberto)
  }

  const itensAlocados = alocarPagamentoGrupo(
    devedores.map((m) => ({ clienteId: m.cliente.id, valorDevido: Math.abs(m.saldo) })),
    Number(valorGrupo),
  )

  function handleConfirmar() {
    if (itensAlocados.length === 0) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }

    const registrado = onRegistrar(itensAlocados, descricao)
    if (!registrado) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }

    setAberto(false)
    const quitados = devedores
      .filter((m) => {
        const pago = itensAlocados.find((item) => item.clienteId === m.cliente.id)?.valor ?? 0
        return pago >= Math.abs(m.saldo)
      })
      .map((m) => m.cliente.id)

    toast.success(`Pagamento do grupo${nomeGrupo ? ` ${nomeGrupo}` : ''} registrado.`, {
      action: {
        label: 'Marcar grupo como saída',
        onClick: () => onSugerirSaidaGrupo(quitados),
      },
    })
  }

  return (
    <Sheet open={aberto} onOpenChange={abrir}>
      <SheetTrigger asChild>
        <Button size="sm">Pagar grupo</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Pagar grupo{nomeGrupo ? ` — ${nomeGrupo}` : ''}</SheetTitle>
          <SheetDescription>
            Informe o valor total pago pelo grupo. Se for menor que a soma das dívidas, o valor é
            abatido primeiro de quem deve mais para quem deve menos.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="pagamento-grupo-valor">Valor do grupo</Label>
            <Input
              id="pagamento-grupo-valor"
              type="number"
              min={0}
              step="0.01"
              value={valorGrupo}
              onChange={(e) => setValorGrupo(e.target.value)}
            />
          </div>

          <ul className="space-y-1">
            {devedores.map((membro) => {
              const devido = Math.abs(membro.saldo)
              const pago = itensAlocados.find((item) => item.clienteId === membro.cliente.id)?.valor ?? 0
              const resta = devido - pago
              return (
                <li
                  key={membro.cliente.id}
                  className="rounded-md bg-muted px-2 py-1.5 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{membro.cliente.nome}</span>
                    <span className="text-muted-foreground">devia {formatoMoeda.format(devido)}</span>
                  </div>
                  {(pago > 0 || resta > 0) && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {pago > 0 && <span>paga {formatoMoeda.format(pago)}</span>}
                      {pago > 0 && resta > 0 && ' · '}
                      {resta > 0 && (
                        <span className="text-destructive">fica devendo {formatoMoeda.format(resta)}</span>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {emDia.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Já em dia: {emDia.map((m) => m.cliente.nome).join(', ')}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="pagamento-grupo-descricao">Descrição</Label>
            <Input
              id="pagamento-grupo-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Pagamento em dinheiro, Pix"
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleConfirmar}>Confirmar pagamento</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
