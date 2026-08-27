import { Banknote, ChevronLeft, ChevronRight, Receipt, Trophy } from 'lucide-react'
import { useState } from 'react'
import {
  agruparLancamentosPorDia,
  chaveDoDia,
  type GrupoLancamentosPorDia,
} from '@/domain/rules/agruparLancamentosPorDia'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import type { Cliente } from '@/domain/types/Cliente'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'
import { Button } from '@/ui/components/ui/button'
import { cn } from '@/ui/lib/utils'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatoDia = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })

function IconeDoLancamento({ tipoId, className }: { tipoId: string; className?: string }) {
  switch (tipoId) {
    case TIPO_LANCAMENTO_IDS.creditoPartida:
    case TIPO_LANCAMENTO_IDS.debitoPartida:
      return <Trophy className={className} />
    case TIPO_LANCAMENTO_IDS.pagamento:
      return <Banknote className={className} />
    default:
      return <Receipt className={className} />
  }
}

// Só o crédito ganha destaque de cor; débito e zero ficam neutros.
function corDoValor(valor: number) {
  return valor > 0 ? 'text-emerald-600' : 'text-foreground'
}

function corDoIcone(valor: number) {
  return valor > 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-background text-muted-foreground'
}

// Saldo (diferente do valor de um lançamento) sempre destaca dívida em vermelho, igual à Aba Clientes.
export function corDoSaldo(saldo: number) {
  return saldo < 0 ? 'text-destructive' : 'text-emerald-600'
}

function ehHoje(data: string) {
  return data === chaveDoDia(new Date().toISOString())
}

function rotuloDoDia(grupo: GrupoLancamentosPorDia) {
  return ehHoje(grupo.data) ? 'Hoje' : formatoDia.format(new Date(grupo.lancamentos[0].criadoEm))
}

export function LinhaSaldo({ rotulo, valor, enfase = false }: { rotulo: string; valor: number; enfase?: boolean }) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between',
        enfase ? 'text-base font-semibold' : 'text-sm text-muted-foreground',
      )}
    >
      <span>{rotulo}</span>
      <span className={enfase ? corDoSaldo(valor) : undefined}>{formatoMoeda.format(valor)}</span>
    </div>
  )
}

type NavegacaoDiaProps = {
  rotulo: string
  podeVoltar: boolean
  podeAvancar: boolean
  onVoltar: () => void
  onAvancar: () => void
}

function NavegacaoDia({ rotulo, podeVoltar, podeAvancar, onVoltar, onAvancar }: NavegacaoDiaProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button type="button" variant="ghost" size="icon" disabled={!podeVoltar} onClick={onVoltar} title="Dia anterior">
        <ChevronLeft className="size-5" />
      </Button>
      <span className="text-base font-semibold">{rotulo}</span>
      <Button type="button" variant="ghost" size="icon" disabled={!podeAvancar} onClick={onAvancar} title="Próximo dia">
        <ChevronRight className="size-5" />
      </Button>
    </div>
  )
}

function ItemLancamento({ lancamento }: { lancamento: LancamentoFinanceiro }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            corDoIcone(lancamento.valor),
          )}
        >
          <IconeDoLancamento tipoId={lancamento.tipoId} className="size-5" />
        </span>
        <div>
          <p className="text-base font-medium">{lancamento.descricao}</p>
          <p className="text-sm text-muted-foreground">{formatoHora.format(new Date(lancamento.criadoEm))}</p>
        </div>
      </div>
      <span className={cn('text-base font-semibold', corDoValor(lancamento.valor))}>
        {formatoMoeda.format(lancamento.valor)}
      </span>
    </li>
  )
}

type ExtratoClienteProps = {
  cliente: Cliente
  lancamentos: LancamentoFinanceiro[]
}

export function ExtratoCliente({ cliente, lancamentos }: ExtratoClienteProps) {
  const grupos = agruparLancamentosPorDia(lancamentos)
  const saldoAtual = calcularSaldo(lancamentos, cliente.id)
  const indiceUltimoDia = Math.max(grupos.length - 1, 0)
  const [indice, setIndice] = useState(indiceUltimoDia)
  const indiceAtual = Math.min(indice, indiceUltimoDia)
  const grupoAtual = grupos[indiceAtual]
  const ehUltimoDia = indiceAtual === indiceUltimoDia

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {grupoAtual ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <NavegacaoDia
            rotulo={rotuloDoDia(grupoAtual)}
            podeVoltar={indiceAtual > 0}
            podeAvancar={!ehUltimoDia}
            onVoltar={() => setIndice(indiceAtual - 1)}
            onAvancar={() => setIndice(indiceAtual + 1)}
          />

          <LinhaSaldo rotulo="Saldo anterior" valor={grupoAtual.saldoAnterior} />

          <div className="flex-1 overflow-y-auto pr-1">
            <ul className="space-y-2">
              {grupoAtual.lancamentos.map((lancamento) => (
                <ItemLancamento key={lancamento.id} lancamento={lancamento} />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="flex-1 text-sm text-muted-foreground">Nenhum lançamento para este cliente.</p>
      )}

      <div className="border-t pt-3">
        {ehUltimoDia ? (
          <LinhaSaldo rotulo="Saldo atual" valor={saldoAtual} enfase />
        ) : (
          <LinhaSaldo rotulo="Saldo do dia" valor={grupoAtual!.saldoDoDia} enfase />
        )}
      </div>
    </div>
  )
}
