import type { ItemPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { Cliente } from '@/domain/types/Cliente'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export type MembroComSaldo = {
  cliente: Cliente
  saldo: number
}

// Mesma lógica de cor da Aba Clientes / extrato individual: dívida em vermelho, resto em verde.
function corDoSaldo(saldo: number) {
  return saldo < 0 ? 'text-destructive' : 'text-emerald-600'
}

type RevisaoPagamentoGrupoProps = {
  membros: MembroComSaldo[]
  itensAlocados: ItemPagamentoGrupo[]
}

export function RevisaoPagamentoGrupo({ membros, itensAlocados }: RevisaoPagamentoGrupoProps) {
  return (
    <ul className="space-y-1">
      {membros.map((membro) => {
        const devedor = membro.saldo < 0
        const devido = Math.abs(membro.saldo)
        const pago = itensAlocados.find((item) => item.clienteId === membro.cliente.id)?.valor ?? 0
        const resta = devedor ? devido - pago : 0
        return (
          <li key={membro.cliente.id} className="rounded-md bg-muted px-2 py-1.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span>{membro.cliente.nome}</span>
              <span className={corDoSaldo(membro.saldo)}>{formatoMoeda.format(membro.saldo)}</span>
            </div>
            {devedor && (pago > 0 || resta > 0) && (
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
  )
}
