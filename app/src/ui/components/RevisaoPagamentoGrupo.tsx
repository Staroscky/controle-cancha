import type { ItemPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { Cliente } from '@/domain/types/Cliente'
import { corDoSaldo, LinhaSaldo } from '@/ui/components/ExtratoCliente'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export type MembroComSaldo = {
  cliente: Cliente
  saldo: number
}

type RevisaoPagamentoGrupoProps = {
  membros: MembroComSaldo[]
  itensAlocados: ItemPagamentoGrupo[]
}

export function RevisaoPagamentoGrupo({ membros, itensAlocados }: RevisaoPagamentoGrupoProps) {
  // Não soma o crédito de quem está positivo: crédito não abate a dívida de outro
  // membro no fechamento em grupo (seção 11.1 de docs/regras.md), então o total exibido
  // aqui precisa continuar batendo com o valor sugerido no campo de pagamento.
  const totalDevido = membros.reduce((soma, membro) => soma + Math.min(membro.saldo, 0), 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex-1 overflow-y-auto pr-1">
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
      </div>

      <div className="border-t pt-3">
        <LinhaSaldo rotulo="Saldo total" valor={totalDevido} enfase />
      </div>
    </div>
  )
}
