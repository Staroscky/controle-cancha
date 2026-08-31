import { Banknote, ChevronLeft, ChevronRight, HandCoins, Pencil, Receipt, Trash2, Trophy, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  agruparLancamentosPorDia,
  chaveDoDia,
  type GrupoLancamentosPorDia,
} from '@/domain/rules/agruparLancamentosPorDia'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import { descricaoSemPrefixoDeRateio } from '@/domain/rules/descricaoSemPrefixoDeRateio'
import { lancamentoEstaCorrigido } from '@/domain/rules/lancamentoEstaCorrigido'
import type { CategoriaConsumo } from '@/domain/types/CategoriaConsumo'
import type { Cliente } from '@/domain/types/Cliente'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'
import { CategoriaIcon } from '@/ui/components/CategoriaIcon'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/components/ui/alert-dialog'
import { Badge } from '@/ui/components/ui/badge'
import { Button } from '@/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/ui/dialog'
import { cn } from '@/ui/lib/utils'

// Só estes tipos são lançados manualmente pelo dono e podem ser corrigidos ou removidos (seção 11.3 de
// docs/regras.md) — Crédito/Débito partida vêm do resultado da partida, fora deste fluxo.
const TIPOS_CORRIGIVEIS: string[] = [
  TIPO_LANCAMENTO_IDS.consumo,
  TIPO_LANCAMENTO_IDS.pagamento,
  TIPO_LANCAMENTO_IDS.usoCredito,
]

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatoDia = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })

function IconeDoLancamento({
  tipoId,
  iconeCategoria,
  className,
}: {
  tipoId: string
  iconeCategoria?: string
  className?: string
}) {
  if (iconeCategoria) {
    return <CategoriaIcon icone={iconeCategoria} className={className} />
  }

  switch (tipoId) {
    case TIPO_LANCAMENTO_IDS.creditoPartida:
    case TIPO_LANCAMENTO_IDS.debitoPartida:
      return <Trophy className={className} />
    case TIPO_LANCAMENTO_IDS.pagamento:
      return <Banknote className={className} />
    case TIPO_LANCAMENTO_IDS.usoCredito:
      return <HandCoins className={className} />
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

function EstadoVazioConsumo({ nome }: { nome: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Banknote className="size-7" />
      </span>
      <p className="text-sm text-muted-foreground">{nome} ainda não consumiu nada hoje.</p>
    </div>
  )
}

function ItemLancamento({
  lancamento,
  lancamentos,
  todosLancamentos,
  clientesPorId,
  itensPorId,
  categoriasPorId,
  onCorrigir,
  onRemover,
}: {
  lancamento: LancamentoFinanceiro
  lancamentos: LancamentoFinanceiro[]
  todosLancamentos: LancamentoFinanceiro[]
  clientesPorId: Map<string, string>
  itensPorId: Map<string, ItemConsumo>
  categoriasPorId: Map<string, CategoriaConsumo>
  onCorrigir?: (lancamento: LancamentoFinanceiro) => void
  onRemover?: (originais: LancamentoFinanceiro[]) => boolean
}) {
  const [confirmarRemocao, setConfirmarRemocao] = useState(false)

  const item = lancamento.itemId ? itensPorId.get(lancamento.itemId) : undefined
  const categoria = item?.categoriaId ? categoriasPorId.get(item.categoriaId) : undefined
  const corrigido = lancamentoEstaCorrigido(lancamento, lancamentos)
  const podeAgir = !corrigido && !lancamento.estornaLancamentoId && TIPOS_CORRIGIVEIS.includes(lancamento.tipoId)
  const podeCorrigir = !!onCorrigir && podeAgir
  const podeRemover = !!onRemover && podeAgir

  // Lançamentos ainda ativos (não estornados) do mesmo lote — quem de fato divide este item
  // agora (seção 11.3 de docs/regras.md). Sem loteId, o lançamento é de 1 cliente só.
  const originaisDoLote = lancamento.loteId
    ? todosLancamentos.filter((l) => l.loteId === lancamento.loteId && !l.estornaLancamentoId)
    : [lancamento]
  const participantesDoLote = lancamento.loteId
    ? originaisDoLote.map((l) => ({ clienteId: l.clienteId, nome: clientesPorId.get(l.clienteId) ?? l.clienteId, valor: l.valor }))
    : []
  const descricaoLimpa = descricaoSemPrefixoDeRateio(lancamento.descricao)

  function handleRemover() {
    const removido = onRemover?.(originaisDoLote)
    if (removido) {
      toast.success('Lançamento removido.')
      setConfirmarRemocao(false)
    }
  }

  return (
    <li
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3',
        corrigido && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            corDoIcone(lancamento.valor),
          )}
        >
          <IconeDoLancamento
            tipoId={lancamento.tipoId}
            iconeCategoria={categoria?.icone}
            className="size-5"
          />
        </span>
        <div>
          <p className={cn('text-base font-medium', corrigido && 'line-through')}>{lancamento.descricao}</p>
          {lancamento.observacao && (
            <p className="text-sm text-muted-foreground">{lancamento.observacao}</p>
          )}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{formatoHora.format(new Date(lancamento.criadoEm))}</p>
            {corrigido && (
              <Badge variant="outline" className="text-muted-foreground">
                Corrigido
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className={cn('text-base font-semibold', corDoValor(lancamento.valor))}>
          {formatoMoeda.format(lancamento.valor)}
        </span>
        {lancamento.loteId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" title="Ver divisão">
                <Users />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dividido entre {participantesDoLote.length} clientes</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {descricaoLimpa} — {formatoMoeda.format(participantesDoLote.reduce((soma, p) => soma + Math.abs(p.valor), 0))} no total
              </p>
              <ul className="space-y-1">
                {participantesDoLote.map((participante) => (
                  <li key={participante.clienteId} className="flex items-center justify-between text-sm">
                    <span>{participante.nome}</span>
                    <span className={corDoValor(participante.valor)}>{formatoMoeda.format(participante.valor)}</span>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        )}
        {podeCorrigir && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Corrigir lançamento"
            onClick={() => onCorrigir?.(lancamento)}
          >
            <Pencil />
          </Button>
        )}
        {podeRemover && (
          <AlertDialog open={confirmarRemocao} onOpenChange={setConfirmarRemocao}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Remover lançamento"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover lançamento</AlertDialogTitle>
                <AlertDialogDescription>
                  {participantesDoLote.length > 1
                    ? `Isso estorna "${descricaoLimpa}" para os ${participantesDoLote.length} clientes que dividiram o item, sem lançar nada no lugar.`
                    : `Isso estorna "${descricaoLimpa}", sem lançar nada no lugar.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemover}>Remover</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </li>
  )
}

type ExtratoClienteProps = {
  cliente: Cliente
  lancamentos: LancamentoFinanceiro[]
  /** Todos os lançamentos (de todos os clientes) — só usado pra achar quem mais divide um item
   * do mesmo lote (seção 11.3 de docs/regras.md), já que `lancamentos` acima é só deste cliente. */
  todosLancamentos: LancamentoFinanceiro[]
  clientes: Cliente[]
  itensConsumo: ItemConsumo[]
  categoriasConsumo: CategoriaConsumo[]
  onCorrigir?: (lancamento: LancamentoFinanceiro) => void
  onRemover?: (originais: LancamentoFinanceiro[]) => boolean
}

export function ExtratoCliente({
  cliente,
  lancamentos,
  todosLancamentos,
  clientes,
  itensConsumo,
  categoriasConsumo,
  onCorrigir,
  onRemover,
}: ExtratoClienteProps) {
  const itensPorId = useMemo(() => new Map(itensConsumo.map((item) => [item.id, item])), [itensConsumo])
  const categoriasPorId = useMemo(
    () => new Map(categoriasConsumo.map((categoria) => [categoria.id, categoria])),
    [categoriasConsumo],
  )
  const clientesPorId = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes])
  const saldoAtual = calcularSaldo(lancamentos, cliente.id)
  // Ao abrir a comanda, o dia selecionado deve ser sempre hoje — mesmo sem lançamento algum
  // ainda hoje (histórico anterior existente ou cliente que nunca consumiu). Por isso, quando o
  // último grupo real não é de hoje (ou não existe nenhum), um grupo vazio de hoje é injetado.
  const grupos = useMemo(() => {
    const base = agruparLancamentosPorDia(lancamentos)
    const hojeChave = chaveDoDia(new Date().toISOString())
    if (base[base.length - 1]?.data === hojeChave) return base
    return [...base, { data: hojeChave, lancamentos: [], saldoAnterior: saldoAtual, saldoDoDia: saldoAtual }]
  }, [lancamentos, saldoAtual])
  const indiceUltimoDia = Math.max(grupos.length - 1, 0)
  const [indice, setIndice] = useState(indiceUltimoDia)
  const indiceAtual = Math.min(indice, indiceUltimoDia)
  const grupoAtual = grupos[indiceAtual]
  const ehUltimoDia = indiceAtual === indiceUltimoDia

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
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
          {grupoAtual.lancamentos.length === 0 ? (
            <EstadoVazioConsumo nome={cliente.nome} />
          ) : (
            <ul className="space-y-2">
              {grupoAtual.lancamentos.map((lancamento) => (
                <ItemLancamento
                  key={lancamento.id}
                  lancamento={lancamento}
                  lancamentos={lancamentos}
                  todosLancamentos={todosLancamentos}
                  clientesPorId={clientesPorId}
                  itensPorId={itensPorId}
                  categoriasPorId={categoriasPorId}
                  onCorrigir={onCorrigir}
                  onRemover={onRemover}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t pt-3">
        {ehUltimoDia ? (
          <LinhaSaldo rotulo="Saldo atual" valor={saldoAtual} enfase />
        ) : (
          <LinhaSaldo rotulo="Saldo do dia" valor={grupoAtual.saldoDoDia} enfase />
        )}
      </div>
    </div>
  )
}
