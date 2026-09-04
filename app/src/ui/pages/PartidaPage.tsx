import { listarCategoriasConsumoOrdenadas } from '@/data/categoriasConsumoRepo'
import { listarClientes } from '@/data/clientesRepo'
import { listarItensConsumoOrdenados } from '@/data/itensConsumoRepo'
import { listarLancamentos } from '@/data/lancamentosRepo'
import { listarParticipacoes } from '@/data/participacoesRepo'
import { listarPartidas } from '@/data/partidasRepo'
import { agruparParticipantesPorEquipe } from '@/domain/rules/agruparParticipantesPorEquipe'
import { AjudaPagina } from '@/ui/components/AjudaPagina'
import { ConfiguracaoPadraoSheet } from '@/ui/components/ConfiguracaoPadraoSheet'
import { CriarPartidaSheet } from '@/ui/components/CriarPartidaSheet'
import { HistoricoPartidas } from '@/ui/components/HistoricoPartidas'
import { LancarConsumoSheet } from '@/ui/components/LancarConsumoSheet'
import { MontagemEquipes } from '@/ui/components/MontagemEquipes'
import { PartidasDeHoje } from '@/ui/components/PartidasDeHoje'
import { PlacarDoDia } from '@/ui/components/PlacarDoDia'
import { Card, CardContent } from '@/ui/components/ui/card'
import { Separator } from '@/ui/components/ui/separator'
import { useConfiguracaoPadrao } from '@/ui/hooks/useConfiguracaoPadrao'
import { usePartidaAtiva } from '@/ui/hooks/usePartidaAtiva'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function PartidaPage() {
  const {
    partida,
    participacoes,
    partidasHoje,
    historico,
    criar,
    criarComParticipantes,
    limparHistorico,
    adicionarParticipante,
    inverterEquipes,
    registrarSaida,
    concluir,
    desistir,
    lancarConsumo,
  } = usePartidaAtiva()
  const { configuracao, atualizar } = useConfiguracaoPadrao()
  const clientes = listarClientes()
  const lancamentos = listarLancamentos()
  const todasParticipacoes = listarParticipacoes()
  const todasPartidas = listarPartidas()
  const itensConsumo = listarItensConsumoOrdenados()
  const categoriasConsumo = listarCategoriasConsumoOrdenadas()

  const participacoesAtivas = participacoes.filter((p) => p.status === 'ativo')
  const blocosPartida = agruparParticipantesPorEquipe(participacoesAtivas, clientes)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold">Partida</h2>
          <AjudaPagina
            titulo="Como funciona a aba Partida"
            itens={[
              'Monte a partida colocando clientes presentes na equipe Azul ou Amarela (até 8 por equipe). Definir o lado (Cima/Baixo) é opcional.',
              'O sistema não controla a pontuação do jogo — isso é combinado entre os clientes. O sistema só registra quem venceu ao final.',
              'Entrar na partida não gera cobrança nenhuma. Um cliente pode sair durante o jogo sem prejuízo, mas aí ele não entra na divisão do resultado.',
              'Ao concluir, escolha a equipe vencedora: cada perdedor ativo recebe uma cobrança e o valor total é dividido entre os vencedores ativos como crédito.',
              'Se o jogo for abandonado sem vencedor, use "Desistência" — nenhuma cobrança ou crédito é gerado.',
              '"Faltam R$ X para o mínimo" é só um indicativo somado entre as partidas do cliente no dia — não afeta o saldo dele, é apenas um alerta visual.',
              'Use o botão "Configuração padrão" para definir os valores padrão (consumo mínimo e valor da partida) usados ao criar novas partidas.',
            ]}
          />
        </div>
        <div className="flex gap-2">
          <ConfiguracaoPadraoSheet configuracao={configuracao} onAtualizar={atualizar} />
          {partida && participacoesAtivas.length > 0 && (
            <LancarConsumoSheet
              itens={itensConsumo}
              categorias={categoriasConsumo}
              clientes={clientes}
              blocos={blocosPartida}
              onLancar={lancarConsumo}
              titulo="Lançar consumo da partida"
              mensagemSemClientes="Nenhum participante na partida no momento."
            />
          )}
          {!partida && <CriarPartidaSheet configuracaoPadrao={configuracao} onCriar={criar} />}
        </div>
      </div>

      <PlacarDoDia todasPartidas={todasPartidas} />

      {!partida && (
        <p className="text-sm text-muted-foreground">
          Nenhuma partida em andamento. Crie uma nova partida para começar.
        </p>
      )}

      {partida && (
        <Card>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Consumação mínima: {formatoMoeda.format(partida.valorMinimoConsumacao)} · Valor da
              partida por cliente: {formatoMoeda.format(partida.valorPartidaPorCliente)}
            </p>

            <Separator />

            <MontagemEquipes
              participacoes={participacoes}
              todasParticipacoes={todasParticipacoes}
              todasPartidas={todasPartidas}
              clientes={clientes}
              lancamentos={lancamentos}
              onAdicionar={adicionarParticipante}
              onRemover={registrarSaida}
              onInverterEquipes={inverterEquipes}
              onConcluir={concluir}
              onDesistir={desistir}
            />
          </CardContent>
        </Card>
      )}

      <PartidasDeHoje
        partidas={partidasHoje}
        todasPartidas={todasPartidas}
        clientes={clientes}
        partidaAtivaExiste={!!partida}
        onCriarComParticipantes={criarComParticipantes}
      />

      <HistoricoPartidas
        historico={historico}
        todasPartidas={todasPartidas}
        clientes={clientes}
        partidaAtivaExiste={!!partida}
        onCriarComParticipantes={criarComParticipantes}
        onLimparHistorico={limparHistorico}
      />
    </div>
  )
}
