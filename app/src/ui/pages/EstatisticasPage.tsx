import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/ui/components/ui/tabs'
import { useEstatisticas } from '@/ui/hooks/useEstatisticas'
import type { PeriodoEstatisticas } from '@/domain/rules/filtrarLancamentosPorPeriodo'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const OPCOES_PERIODO: { valor: PeriodoEstatisticas; rotulo: string }[] = [
  { valor: 'hoje', rotulo: 'Hoje' },
  { valor: '7dias', rotulo: '7 dias' },
  { valor: '30dias', rotulo: '30 dias' },
  { valor: 'tudo', rotulo: 'Tudo' },
]

function CardResumo({ titulo, valor, descricao }: { titulo: string; valor: number; descricao: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{titulo}</CardDescription>
        <CardTitle className="text-2xl">{formatoMoeda.format(valor)}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{descricao}</CardContent>
    </Card>
  )
}

function BarraRanking({ rotulo, valor, maximo, legenda }: { rotulo: string; valor: number; maximo: number; legenda: string }) {
  const largura = maximo > 0 ? Math.max((valor / maximo) * 100, 3) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate font-medium">{rotulo}</span>
        <span className="shrink-0 text-muted-foreground">{legenda}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${largura}%` }} />
      </div>
    </div>
  )
}

export function EstatisticasPage() {
  const { periodo, setPeriodo, resumo, produtos, categorias } = useEstatisticas()

  const maiorFaturamentoProduto = produtos[0]?.faturamento ?? 0
  const maiorFaturamentoCategoria = categorias[0]?.faturamento ?? 0

  return (
    <div className="space-y-6">
      <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoEstatisticas)}>
        <TabsList>
          {OPCOES_PERIODO.map((opcao) => (
            <TabsTrigger key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Financeiro</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardResumo
            titulo="Faturamento de consumo"
            valor={resumo.faturamentoConsumo}
            descricao="Itens do catálogo e avulsos, líquido de estornos"
          />
          <CardResumo titulo="Recebido em caixa" valor={resumo.recebidoEmCaixa} descricao="Pagamentos registrados" />
          <CardResumo titulo="Ticket médio" valor={resumo.ticketMedio} descricao={`${resumo.quantidadeVendas} venda${resumo.quantidadeVendas === 1 ? '' : 's'} no período`} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Produtos</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mais vendidos</CardTitle>
              <CardDescription>Ranking por faturamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {produtos.length === 0 && <p className="text-sm text-muted-foreground">Sem vendas no período.</p>}
              {produtos.slice(0, 8).map((produto) => (
                <BarraRanking
                  key={produto.itemId ?? produto.nome}
                  rotulo={produto.nome}
                  valor={produto.faturamento}
                  maximo={maiorFaturamentoProduto}
                  legenda={`${formatoMoeda.format(produto.faturamento)} · ${produto.vendas} venda${produto.vendas === 1 ? '' : 's'}`}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Faturamento por categoria</CardTitle>
              <CardDescription>Soma de consumo por categoria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categorias.length === 0 && <p className="text-sm text-muted-foreground">Sem vendas no período.</p>}
              {categorias.map((categoria) => (
                <BarraRanking
                  key={categoria.categoriaId ?? 'sem-categoria'}
                  rotulo={categoria.nome}
                  valor={categoria.faturamento}
                  maximo={maiorFaturamentoCategoria}
                  legenda={formatoMoeda.format(categoria.faturamento)}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
