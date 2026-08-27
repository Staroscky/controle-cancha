import type { ItemPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { Cliente } from '@/domain/types/Cliente'
import { corDoSaldo, LinhaSaldo } from '@/ui/components/ExtratoCliente'
import { Input } from '@/ui/components/ui/input'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export type MembroComSaldo = {
  cliente: Cliente
  saldo: number
}

type RevisaoPagamentoGrupoProps = {
  membros: MembroComSaldo[]
  itensAlocados: ItemPagamentoGrupo[]
  creditosUsados: Record<string, string>
  limitesCreditos: Record<string, number>
  onCreditoChange: (clienteId: string, saldoCredor: number, digitado: string) => void
}

export function RevisaoPagamentoGrupo({
  membros,
  itensAlocados,
  creditosUsados,
  limitesCreditos,
  onCreditoChange,
}: RevisaoPagamentoGrupoProps) {
  // Total ainda devido pelo grupo, sem o crédito de quem está positivo — é uma referência
  // fixa (bate com o valor inicialmente sugerido no campo de pagamento), não reage ao que
  // for digitado nos campos de dinheiro/crédito abaixo; o efeito de cada um já aparece na
  // própria linha do membro ("paga X" / "fica devendo Y").
  const totalDevido = membros.reduce((soma, membro) => soma + Math.min(membro.saldo, 0), 0)
  const haDevedor = totalDevido < 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-1">
          {membros.map((membro) => {
            const devedor = membro.saldo < 0
            const credor = membro.saldo > 0
            const devido = Math.abs(membro.saldo)
            const pago = itensAlocados.find((item) => item.clienteId === membro.cliente.id)?.valor ?? 0
            const resta = devedor ? devido - pago : 0
            const limite = limitesCreditos[membro.cliente.id] ?? 0
            const creditoDigitado = creditosUsados[membro.cliente.id] ?? ''
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
                {credor && haDevedor && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <label htmlFor={`credito-${membro.cliente.id}`}>Usar crédito para ajudar:</label>
                    <Input
                      id={`credito-${membro.cliente.id}`}
                      type="number"
                      min={0}
                      max={limite}
                      step="0.01"
                      value={creditoDigitado}
                      onChange={(e) => onCreditoChange(membro.cliente.id, membro.saldo, e.target.value)}
                      className="h-7 w-24 px-1.5"
                      disabled={limite <= 0 && !creditoDigitado}
                    />
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
