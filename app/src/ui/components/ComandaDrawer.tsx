import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Bloco } from '@/domain/rules/agruparClientesPorGrupo'
import { alocarPagamentoGrupo } from '@/domain/rules/alocarPagamentoGrupo'
import type { ItemPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { ExtratoCliente } from '@/ui/components/ExtratoCliente'
import { FormularioFechamento } from '@/ui/components/FormularioFechamento'
import { RevisaoPagamentoGrupo, type MembroComSaldo } from '@/ui/components/RevisaoPagamentoGrupo'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs'

type ComandaDrawerProps = {
  bloco: Bloco | null
  onFechar: () => void
  saldoDoCliente: (clienteId: string) => number
  extratoDoCliente: (clienteId: string) => LancamentoFinanceiro[]
  onRegistrarPagamento: (clienteId: string, valor: number, descricao: string) => boolean
  onRegistrarPagamentoGrupo: (
    itens: ItemPagamentoGrupo[],
    descricao: string,
    usosCredito: ItemPagamentoGrupo[],
  ) => boolean
  onMarcarSaida: (clienteId: string) => void
  onMarcarSaidaGrupo: (clienteIds: string[]) => void
}

export function ComandaDrawer({
  bloco,
  onFechar,
  saldoDoCliente,
  extratoDoCliente,
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

  useEffect(() => {
    if (blocoAtual) {
      setAba(temAbas ? 'geral' : blocoAtual.membros[0].id)
    }
    // toda vez que a comanda é (re)aberta, volta pra aba padrão — não usar `chave`
    // aqui: reabrir a MESMA comanda não muda `chave`, mas o saldo pode ter mudado
    // enquanto ela estava fechada (bug: campo de valor ficava travado no saldo antigo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloco])

  const membrosComSaldo: MembroComSaldo[] = blocoAtual
    ? blocoAtual.membros.map((cliente) => ({ cliente, saldo: saldoDoCliente(cliente.id) }))
    : []
  const devedores = membrosComSaldo.filter((m) => m.saldo < 0)
  const totalDevido = devedores.reduce((soma, m) => soma + Math.abs(m.saldo), 0)
  const ehAbaGeral = temAbas && aba === 'geral'
  const membroAtivo = membrosComSaldo.find((m) => m.cliente.id === aba) ?? membrosComSaldo[0]

  useEffect(() => {
    if (!blocoAtual) return
    setValor(String(ehAbaGeral ? totalDevido : Math.abs(membroAtivo?.saldo ?? 0)))
    setDescricao('')
    setCreditosUsados({})
    // recalcula o valor sugerido sempre que a comanda é (re)aberta ou a aba muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloco, aba])

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
    const usosCredito: ItemPagamentoGrupo[] = Object.entries(creditosUsados)
      .map(([clienteId, v]) => ({ clienteId, valor: Number(v) || 0 }))
      .filter((item) => item.valor > 0)
    const registrado = onRegistrarPagamentoGrupo(itensAlocados, descricao, usosCredito)
    if (!registrado) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }
    const devedoresQuitados = devedores
      .filter((m) => (itensAlocados.find((item) => item.clienteId === m.cliente.id)?.valor ?? 0) >= Math.abs(m.saldo))
      .map((m) => m.cliente.id)
    const credoresZerados = usosCredito
      .filter((item) => item.valor >= (membrosComSaldo.find((m) => m.cliente.id === item.clienteId)?.saldo ?? 0))
      .map((item) => item.clienteId)
    const quitados = [...devedoresQuitados, ...credoresZerados]
    onFechar()
    toast.success(`Pagamento do grupo${blocoAtual.nome ? ` ${blocoAtual.nome}` : ''} registrado.`, {
      action: { label: 'Marcar grupo como saída', onClick: () => onMarcarSaidaGrupo(quitados) },
    })
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
    onFechar()
    toast.success(`Pagamento de ${membroAtivo.cliente.nome} registrado.`, {
      action: { label: 'Marcar saída', onClick: () => onMarcarSaida(membroAtivo.cliente.id) },
    })
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
            <TabsList>
              <TabsTrigger value="geral">Geral</TabsTrigger>
              {membrosComSaldo.map(({ cliente }) => (
                <TabsTrigger key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </TabsTrigger>
              ))}
            </TabsList>
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
                <ExtratoCliente cliente={cliente} lancamentos={extratoDoCliente(cliente.id)} />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
            <ExtratoCliente cliente={blocoAtual.membros[0]} lancamentos={extratoDoCliente(blocoAtual.membros[0].id)} />
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
                  rotuloBotao="Fechar grupo"
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
                  rotuloBotao={`Fechar de ${membroAtivo.cliente.nome}`}
                  onConfirmar={handleConfirmarIndividual}
                />
              )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
