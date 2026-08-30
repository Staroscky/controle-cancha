import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Bloco } from '@/domain/rules/agruparClientesPorGrupo'
import { alocarPagamentoGrupo } from '@/domain/rules/alocarPagamentoGrupo'
import type { ItemPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { CategoriaConsumo } from '@/domain/types/CategoriaConsumo'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { ExtratoCliente } from '@/ui/components/ExtratoCliente'
import { FormularioFechamento } from '@/ui/components/FormularioFechamento'
import { RevisaoPagamentoGrupo, type MembroComSaldo } from '@/ui/components/RevisaoPagamentoGrupo'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

type ComandaDrawerProps = {
  bloco: Bloco | null
  onFechar: () => void
  saldoDoCliente: (clienteId: string) => number
  extratoDoCliente: (clienteId: string) => LancamentoFinanceiro[]
  itensConsumo: ItemConsumo[]
  categoriasConsumo: CategoriaConsumo[]
  onRegistrarPagamento: (clienteId: string, valor: number, descricao: string) => boolean
  onRegistrarPagamentoGrupo: (
    itens: ItemPagamentoGrupo[],
    descricao: string,
    usosCredito: ItemPagamentoGrupo[],
  ) => boolean
  onMarcarSaida: (clienteId: string) => void
  onMarcarSaidaGrupo: (clienteIds: string[]) => void
}

// Pedido de confirmação de saída pendente, aberto depois que uma comanda é fechada.
type PedidoPendente = {
  clienteIds: string[]
  nomes: string
}

// Com grupos grandes, a lista de abas (uma por membro) não cabe na largura do drawer e os
// TabsTrigger espremem até virar ilegíveis/impossíveis de clicar. Este wrapper transforma a
// lista numa faixa rolável horizontalmente, com setas e um degradê nas bordas que só aparecem
// quando há mais conteúdo pra rolar naquela direção.
function AbasRolaveis({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [podeRolarEsquerda, setPodeRolarEsquerda] = useState(false)
  const [podeRolarDireita, setPodeRolarDireita] = useState(false)

  const atualizarSetas = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setPodeRolarEsquerda(el.scrollLeft > 1)
    setPodeRolarDireita(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    atualizarSetas()
    if (!el) return
    const observer = new ResizeObserver(atualizarSetas)
    observer.observe(el)
    return () => observer.disconnect()
  }, [atualizarSetas, children])

  function rolar(direcao: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direcao * 160, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {podeRolarEsquerda && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
          <button
            type="button"
            onClick={() => rolar(-1)}
            aria-label="Rolar abas para a esquerda"
            className="absolute top-1/2 left-0.5 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
          </button>
        </>
      )}
      <div
        ref={scrollRef}
        onScroll={atualizarSetas}
        className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {podeRolarDireita && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
          <button
            type="button"
            onClick={() => rolar(1)}
            aria-label="Rolar abas para a direita"
            className="absolute top-1/2 right-0.5 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </>
      )}
    </div>
  )
}

export function ComandaDrawer({
  bloco,
  onFechar,
  saldoDoCliente,
  extratoDoCliente,
  itensConsumo,
  categoriasConsumo,
  onRegistrarPagamento,
  onRegistrarPagamentoGrupo,
  onMarcarSaida,
  onMarcarSaidaGrupo,
}: ComandaDrawerProps) {
  // Mantém o conteúdo montado durante a animação de fechar (Sheet fica com open=false,
  // mas o último bloco selecionado continua renderizado até o Sheet ser desmontado).
  // Atualizado durante o render (não em useEffect) para que membrosComSaldo/totalDevido/etc.
  // abaixo já reflitam o bloco novo neste mesmo ciclo — um useEffect aqui deixava os efeitos
  // de aba/valor lerem blocoAtual desatualizado (um clique "atrás") na primeira renderização
  // após abrir uma comanda.
  const [blocoAtual, setBlocoAtual] = useState<Bloco | null>(bloco)
  if (bloco && bloco !== blocoAtual) {
    setBlocoAtual(bloco)
  }

  const temAbas = !!blocoAtual?.grupoId && blocoAtual.membros.length > 1

  const [aba, setAba] = useState('geral')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [creditosUsados, setCreditosUsados] = useState<Record<string, string>>({})
  const [pedidoSaida, setPedidoSaida] = useState<PedidoPendente | null>(null)
  // true quando o valor digitado no fechamento do grupo não cobre o total devido e o dono
  // ainda não confirmou que quer seguir mesmo assim (ver handleConfirmarGrupo).
  const [confirmarPagamentoParcial, setConfirmarPagamentoParcial] = useState(false)
  // Incrementado a cada pagamento registrado, pra forçar o recálculo do valor sugerido
  // (saldo devedor após o pagamento) sem fechar o drawer — ver handleConfirmar* abaixo.
  const [pagamentoVersao, setPagamentoVersao] = useState(0)

  // Identifica a comanda (grupo ou cliente solo) independente do conteúdo dela — o pai agora
  // recria o Bloco a cada render (pra refletir membros que saíram do grupo etc.), então não dá
  // mais pra usar a referência de `bloco` como sinal de "abriu uma comanda diferente".
  const chaveAbertaRef = useRef<string | null>(null)
  // Incrementado a cada (re)abertura de comanda — não dá pra confiar só na mudança de `aba` pra
  // isso, porque reabrir a MESMA comanda reseta pro mesmo valor de aba (ex.: 'geral' -> 'geral'),
  // o que não dispara o efeito de recálculo do valor abaixo.
  const [aberturaVersao, setAberturaVersao] = useState(0)

  useEffect(() => {
    if (!bloco) {
      chaveAbertaRef.current = null
      return
    }
    const chave = bloco.grupoId ?? bloco.membros[0].id
    if (chave === chaveAbertaRef.current) return
    chaveAbertaRef.current = chave
    // toda vez que a comanda é (re)aberta, volta pra aba padrão — reabrir a MESMA comanda
    // depois de fechada também deve resetar: o saldo pode ter mudado enquanto ela estava
    // fechada (bug antigo: campo de valor ficava travado no saldo antigo)
    setAba(bloco.grupoId && bloco.membros.length > 1 ? 'geral' : bloco.membros[0].id)
    setAberturaVersao((v) => v + 1)
  }, [bloco])

  // Se a aba ativa era de um membro que saiu do grupo (ex.: marcou saída individualmente
  // enquanto o dono via a comanda dele), cai pra "Geral" (ou pro único membro que sobrou).
  useEffect(() => {
    if (!blocoAtual || aba === 'geral') return
    const aindaNoGrupo = blocoAtual.membros.some((m) => m.id === aba)
    if (!aindaNoGrupo) {
      setAba(temAbas ? 'geral' : (blocoAtual.membros[0]?.id ?? 'geral'))
    }
  }, [blocoAtual, aba, temAbas])

  const membrosComSaldo: MembroComSaldo[] = blocoAtual
    ? blocoAtual.membros.map((cliente) => ({ cliente, saldo: saldoDoCliente(cliente.id) }))
    : []
  const devedores = membrosComSaldo.filter((m) => m.saldo < 0)
  const totalDevido = devedores.reduce((soma, m) => soma + Math.abs(m.saldo), 0)
  const ehAbaGeral = temAbas && aba === 'geral'
  const membroAtivo = membrosComSaldo.find((m) => m.cliente.id === aba) ?? membrosComSaldo[0]

  useEffect(() => {
    if (!blocoAtual) return
    setValor((ehAbaGeral ? totalDevido : Math.abs(membroAtivo?.saldo ?? 0)).toFixed(2))
    setDescricao('')
    setCreditosUsados({})
    // recalcula o valor sugerido sempre que a comanda é (re)aberta (aberturaVersao), a aba muda,
    // ou um pagamento acabou de ser registrado (pagamentoVersao) — nunca por causa de um
    // re-render qualquer do pai (ex.: digitar no filtro de busca), já que não depende mais da
    // referência (sempre nova) de `bloco`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberturaVersao, aba, pagamentoVersao])

  if (!blocoAtual) return null

  const totalCreditoUsado = Object.values(creditosUsados).reduce((soma, v) => soma + (Number(v) || 0), 0)

  const itensAlocados = alocarPagamentoGrupo(
    devedores.map((m) => ({ clienteId: m.cliente.id, valorDevido: Math.abs(m.saldo) })),
    Number(valor) + totalCreditoUsado,
  )

  // Limite de crédito que cada credor ainda pode ceder: não pode passar do próprio saldo
  // nem do que falta cobrir (dinheiro digitado + crédito que os outros credores já cederam),
  // pra nunca debitar de alguém um crédito que não teria pra onde ir.
  function limiteCredito(clienteId: string, saldoCredor: number) {
    const outros = Object.entries(creditosUsados)
      .filter(([id]) => id !== clienteId)
      .reduce((soma, [, v]) => soma + (Number(v) || 0), 0)
    const restante = Math.max(0, totalDevido - Number(valor) - outros)
    return Math.min(saldoCredor, restante)
  }

  const limitesCreditos = Object.fromEntries(
    membrosComSaldo
      .filter((m) => m.saldo > 0)
      .map((m) => [m.cliente.id, limiteCredito(m.cliente.id, m.saldo)]),
  )

  function handleCreditoChange(clienteId: string, saldoCredor: number, digitado: string) {
    if (digitado === '') {
      setCreditosUsados((atual) => ({ ...atual, [clienteId]: '' }))
      return
    }
    const max = limiteCredito(clienteId, saldoCredor)
    const numerico = Math.min(Math.max(Number(digitado) || 0, 0), max)
    setCreditosUsados((atual) => ({ ...atual, [clienteId]: String(numerico) }))
  }

  function handleConfirmarGrupo() {
    if (!blocoAtual) return
    if (itensAlocados.length === 0) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }
    // Valor + crédito cedido não cobre o total devido pelo grupo: como o fechamento pela aba
    // "Geral" já sugere marcar TODOS os membros como saída (ver abaixo), confirma antes que o
    // dono realmente quer seguir com dívida em aberto, em vez de registrar direto.
    if (Number(valor) + totalCreditoUsado < totalDevido - 0.005) {
      setConfirmarPagamentoParcial(true)
      return
    }
    registrarPagamentoGrupo()
  }

  function registrarPagamentoGrupo() {
    if (!blocoAtual) return
    setConfirmarPagamentoParcial(false)
    const usosCredito: ItemPagamentoGrupo[] = Object.entries(creditosUsados)
      .map(([clienteId, v]) => ({ clienteId, valor: Number(v) || 0 }))
      .filter((item) => item.valor > 0)
    const registrado = onRegistrarPagamentoGrupo(itensAlocados, descricao, usosCredito)
    if (!registrado) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }
    setPagamentoVersao((v) => v + 1)
    toast.success(`Pagamento do grupo${blocoAtual.nome ? ` ${blocoAtual.nome}` : ''} registrado.`)
    // Pagamento pela aba "Geral" fecha a comanda do grupo como um todo, então sugere marcar
    // a saída de TODOS os membros — mesmo que algum tenha ficado com saldo residual (pagamento
    // parcial) — e não só de quem zerou o saldo individualmente.
    const clienteIds = membrosComSaldo.map((m) => m.cliente.id)
    const nomes = membrosComSaldo.map((m) => m.cliente.nome).join(', ')
    setPedidoSaida({ clienteIds, nomes })
  }

  function handleConfirmarIndividual() {
    if (!membroAtivo) return
    const valorNumerico = Number(valor)
    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }
    const registrado = onRegistrarPagamento(membroAtivo.cliente.id, valorNumerico, descricao)
    if (!registrado) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }
    setPagamentoVersao((v) => v + 1)
    toast.success('Pagamento registrado.')
    const saldoZerado = Math.abs(membroAtivo.saldo + valorNumerico) < 0.005
    // só sugere marcar saída quando o pagamento zera o saldo — pagamento parcial
    // apenas registra e mantém a comanda aberta (ver docs/regras.md seção 11.1)
    if (saldoZerado) {
      setPedidoSaida({ clienteIds: [membroAtivo.cliente.id], nomes: membroAtivo.cliente.nome })
    }
  }

  function handleConfirmarSaida() {
    if (!pedidoSaida) return
    if (pedidoSaida.clienteIds.length > 1) {
      onMarcarSaidaGrupo(pedidoSaida.clienteIds)
    } else {
      onMarcarSaida(pedidoSaida.clienteIds[0])
    }
  }

  const titulo = blocoAtual.grupoId ? blocoAtual.nome || 'Grupo' : blocoAtual.membros[0].nome

  return (
    <Sheet open={!!bloco} onOpenChange={(aberto) => !aberto && onFechar()}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{titulo}</SheetTitle>
          {blocoAtual.grupoId && (
            <SheetDescription>{blocoAtual.membros.map((m) => m.nome).join(', ')}</SheetDescription>
          )}
        </SheetHeader>

        {temAbas ? (
          <Tabs value={aba} onValueChange={setAba} className="flex min-h-0 flex-1 flex-col px-4">
            <AbasRolaveis>
              <TabsList className="w-max">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                {membrosComSaldo.map(({ cliente }) => (
                  <TabsTrigger key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </TabsTrigger>
                ))}
              </TabsList>
            </AbasRolaveis>
            <TabsContent value="geral" className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-3 pb-1">
              <RevisaoPagamentoGrupo
                membros={membrosComSaldo}
                itensAlocados={itensAlocados}
                creditosUsados={creditosUsados}
                limitesCreditos={limitesCreditos}
                onCreditoChange={handleCreditoChange}
              />
            </TabsContent>
            {membrosComSaldo.map(({ cliente }) => (
              <TabsContent
                key={cliente.id}
                value={cliente.id}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-3 pb-1"
              >
                <ExtratoCliente
                  key={aberturaVersao}
                  cliente={cliente}
                  lancamentos={extratoDoCliente(cliente.id)}
                  itensConsumo={itensConsumo}
                  categoriasConsumo={categoriasConsumo}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
            <ExtratoCliente
              key={aberturaVersao}
              cliente={blocoAtual.membros[0]}
              lancamentos={extratoDoCliente(blocoAtual.membros[0].id)}
              itensConsumo={itensConsumo}
              categoriasConsumo={categoriasConsumo}
            />
          </div>
        )}

        <SheetFooter className="border-t">
          {ehAbaGeral
            ? devedores.length > 0 && (
                <FormularioFechamento
                  idPrefixo="fechar-grupo"
                  valor={valor}
                  onValorChange={setValor}
                  descricao={descricao}
                  onDescricaoChange={setDescricao}
                  rotuloBotao="Registrar pagamento do grupo"
                  onConfirmar={handleConfirmarGrupo}
                />
              )
            : membroAtivo &&
              membroAtivo.saldo < 0 && (
                <FormularioFechamento
                  idPrefixo="fechar-individual"
                  valor={valor}
                  onValorChange={setValor}
                  descricao={descricao}
                  onDescricaoChange={setDescricao}
                  rotuloBotao="Registrar pagamento"
                  onConfirmar={handleConfirmarIndividual}
                />
              )}
        </SheetFooter>
      </SheetContent>

      <AlertDialog
        open={confirmarPagamentoParcial}
        onOpenChange={(aberto) => !aberto && setConfirmarPagamentoParcial(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valor não cobre o total do grupo</AlertDialogTitle>
            <AlertDialogDescription>
              O valor informado cobre {formatoMoeda.format(Number(valor) + totalCreditoUsado)} de{' '}
              {formatoMoeda.format(totalDevido)} devidos pelo grupo, ficando{' '}
              {formatoMoeda.format(totalDevido - Number(valor) - totalCreditoUsado)} em aberto. Deseja
              registrar mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={registrarPagamentoGrupo}>Registrar mesmo assim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pedidoSaida} onOpenChange={(aberto) => !aberto && setPedidoSaida(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar saída</AlertDialogTitle>
            <AlertDialogDescription>
              Marcar {pedidoSaida?.nomes} como saída do estabelecimento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarSaida}>Marcar saída</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
