import { ChevronDown } from 'lucide-react'
import type { Bloco } from '@/domain/rules/agruparClientesPorGrupo'
import type { ItemPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { ExtratoClienteDialog } from '@/ui/components/ExtratoClienteDialog'
import { RegistrarPagamentoGrupoSheet } from '@/ui/components/RegistrarPagamentoGrupoSheet'
import { RegistrarPagamentoSheet } from '@/ui/components/RegistrarPagamentoSheet'
import { cn } from '@/ui/lib/utils'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

type ComandaBlocoProps = {
  bloco: Bloco
  expandido: boolean
  onToggle: () => void
  saldoDoCliente: (clienteId: string) => number
  extratoDoCliente: (clienteId: string) => LancamentoFinanceiro[]
  onRegistrarPagamento: (clienteId: string, valor: number, descricao: string) => boolean
  onRegistrarPagamentoGrupo: (itens: ItemPagamentoGrupo[], descricao: string) => boolean
  onMarcarSaida: (clienteId: string) => void
  onMarcarSaidaGrupo: (clienteIds: string[]) => void
}

export function ComandaBloco({
  bloco,
  expandido,
  onToggle,
  saldoDoCliente,
  extratoDoCliente,
  onRegistrarPagamento,
  onRegistrarPagamentoGrupo,
  onMarcarSaida,
  onMarcarSaidaGrupo,
}: ComandaBlocoProps) {
  const membrosComSaldo = bloco.membros.map((cliente) => ({
    cliente,
    saldo: saldoDoCliente(cliente.id),
  }))
  const algumDevedor = membrosComSaldo.some((m) => m.saldo < 0)

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 p-3 text-left"
      >
        <span className="flex flex-col">
          <span className="font-medium">{bloco.grupoId ? bloco.nome || 'Grupo' : bloco.membros[0].nome}</span>
          {bloco.grupoId && (
            <span className="text-xs text-muted-foreground">
              {bloco.membros.map((m) => m.nome).join(', ')}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', expandido && 'rotate-180')}
        />
      </button>

      {expandido && (
        <div className="space-y-2 border-t p-3">
          {bloco.grupoId && algumDevedor && (
            <div className="flex justify-end">
              <RegistrarPagamentoGrupoSheet
                nomeGrupo={bloco.nome}
                membros={membrosComSaldo}
                onRegistrar={onRegistrarPagamentoGrupo}
                onSugerirSaidaGrupo={onMarcarSaidaGrupo}
              />
            </div>
          )}

          <ul className="space-y-2">
            {membrosComSaldo.map(({ cliente, saldo }) => (
              <li
                key={cliente.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span>{cliente.nome}</span>
                  <span className={saldo < 0 ? 'text-destructive' : 'text-emerald-600'}>
                    {formatoMoeda.format(saldo)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <ExtratoClienteDialog cliente={cliente} lancamentos={extratoDoCliente(cliente.id)} />
                  {saldo < 0 && (
                    <RegistrarPagamentoSheet
                      cliente={cliente}
                      saldo={saldo}
                      onRegistrar={onRegistrarPagamento}
                      onSugerirSaida={onMarcarSaida}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
