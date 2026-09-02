import { useMemo } from 'react'
import { agruparConsumoPorItem } from '@/domain/rules/agruparConsumoPorItem'
import { agruparLancamentosPorDiaComHoje } from '@/domain/rules/agruparLancamentosPorDia'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import type { Cliente } from '@/domain/types/Cliente'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'
import { corDoValor, EstadoVazioConsumo, LinhaSaldo } from '@/ui/components/ExtratoCliente'
import { cn } from '@/ui/lib/utils'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

type LinhaResumo = { rotulo: string; valor: number }

type ComandaConsolidadaProps = {
  cliente: Cliente
  /** Lançamentos já filtrados deste cliente (mesmo contrato de ExtratoCliente). */
  lancamentos: LancamentoFinanceiro[]
  /** Todos os lançamentos — só usado pra saber se um consumo deste cliente foi corrigido/estornado. */
  todosLancamentos: LancamentoFinanceiro[]
}

function LinhaConsolidada({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
      <p className="text-base font-medium">{rotulo}</p>
      <span className={cn('text-base font-semibold tabular-nums', corDoValor(valor))}>
        {formatoMoeda.format(valor)}
      </span>
    </li>
  )
}

/**
 * Visão consolidada da comanda (seção 06): resume o consumo do dia agrupado por item — quantidade
 * × item, ajustes por tipo (partidas/pagamento/crédito) e saldo — em vez do lançamento a lançamento
 * do extrato. Sempre o último dia disponível, sem navegação entre dias.
 */
export function ComandaConsolidada({ cliente, lancamentos, todosLancamentos }: ComandaConsolidadaProps) {
  const saldoAtual = calcularSaldo(lancamentos, cliente.id)
  const grupoAtual = useMemo(() => {
    const grupos = agruparLancamentosPorDiaComHoje(lancamentos, saldoAtual)
    return grupos[grupos.length - 1]
  }, [lancamentos, saldoAtual])

  const itensAgrupados = useMemo(
    () => agruparConsumoPorItem(grupoAtual.lancamentos, todosLancamentos),
    [grupoAtual, todosLancamentos],
  )

  // Crédito/Débito partida, Pagamento e Uso de crédito não são "produto" — entram como linhas
  // somadas por tipo, não item a item.
  const linhasResumo = useMemo(() => {
    const somaPorTipo = (tipoId: string) =>
      grupoAtual.lancamentos.filter((l) => l.tipoId === tipoId).reduce((soma, l) => soma + l.valor, 0)
    const linhas: LinhaResumo[] = [
      {
        rotulo: 'Resultado das partidas',
        valor: somaPorTipo(TIPO_LANCAMENTO_IDS.creditoPartida) + somaPorTipo(TIPO_LANCAMENTO_IDS.debitoPartida),
      },
      { rotulo: 'Pagamentos', valor: somaPorTipo(TIPO_LANCAMENTO_IDS.pagamento) },
      { rotulo: 'Uso de crédito', valor: somaPorTipo(TIPO_LANCAMENTO_IDS.usoCredito) },
    ]
    return linhas.filter((l) => Math.abs(l.valor) > 0.001)
  }, [grupoAtual])

  const semNada = itensAgrupados.length === 0 && linhasResumo.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {grupoAtual.saldoAnterior !== 0 && <LinhaSaldo rotulo="Saldo anterior" valor={grupoAtual.saldoAnterior} />}

        <div className="flex-1 overflow-y-auto pr-1">
          {semNada ? (
            <EstadoVazioConsumo nome={cliente.nome} />
          ) : (
            <ul className="space-y-2">
              {itensAgrupados.map((item) => (
                <LinhaConsolidada key={item.chave} rotulo={item.rotulo} valor={item.valorTotal} />
              ))}
              {linhasResumo.map((linha) => (
                <LinhaConsolidada key={linha.rotulo} rotulo={linha.rotulo} valor={linha.valor} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t pt-3">
        <LinhaSaldo rotulo="Saldo atual" valor={saldoAtual} enfase />
      </div>
    </div>
  )
}
