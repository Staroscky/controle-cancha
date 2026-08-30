import { listarCategoriasConsumoOrdenadas } from '@/data/categoriasConsumoRepo'
import { listarClientes } from '@/data/clientesRepo'
import { listarItensConsumoOrdenados } from '@/data/itensConsumoRepo'
import { listarLancamentos } from '@/data/lancamentosRepo'
import { listarParticipacoes } from '@/data/participacoesRepo'
import { listarPartidas } from '@/data/partidasRepo'
import { agruparParticipantesPorEquipe } from '@/domain/rules/agruparParticipantesPorEquipe'
import { ConcluirPartidaAlertDialog } from '@/ui/components/ConcluirPartidaAlertDialog'
import { ConfiguracaoPadraoSheet } from '@/ui/components/ConfiguracaoPadraoSheet'
import { CriarPartidaSheet } from '@/ui/components/CriarPartidaSheet'
import { DesistirPartidaAlertDialog } from '@/ui/components/DesistirPartidaAlertDialog'
import { HistoricoPartidas } from '@/ui/components/HistoricoPartidas'
import { LancarConsumoSheet } from '@/ui/components/LancarConsumoSheet'
import { MontagemEquipes } from '@/ui/components/MontagemEquipes'
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
        <h2 className="text-lg font-semibold">Partida</h2>
        <div className="flex gap-2">
          <ConfiguracaoPadraoSheet configuracao={configuracao} onAtualizar={atualizar} />
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                Consumação mínima: {formatoMoeda.format(partida.valorMinimoConsumacao)} · Valor da
                partida por cliente: {formatoMoeda.format(partida.valorPartidaPorCliente)}
              </span>
              <div className="flex flex-wrap gap-2">
                {participacoesAtivas.length > 0 && (
                  <LancarConsumoSheet
                    itens={itensConsumo}
                    categorias={categoriasConsumo}
                    clientes={clientes}
                    blocos={blocosPartida}
                    clienteIdsPadrao={participacoesAtivas.map((p) => p.clienteId)}
                    onLancar={lancarConsumo}
                    titulo="Lançar consumo da partida"
                    mensagemSemClientes="Nenhum participante na partida no momento."
                  />
                )}
                <DesistirPartidaAlertDialog onDesistir={desistir} />
                <ConcluirPartidaAlertDialog onConcluir={concluir} />
              </div>
            </div>

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
            />
          </CardContent>
        </Card>
      )}

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
