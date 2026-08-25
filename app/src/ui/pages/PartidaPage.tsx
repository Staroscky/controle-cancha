import { listarClientes } from '@/data/clientesRepo'
import { listarLancamentos } from '@/data/lancamentosRepo'
import { listarParticipacoes } from '@/data/participacoesRepo'
import { listarPartidas } from '@/data/partidasRepo'
import { ConcluirPartidaAlertDialog } from '@/ui/components/ConcluirPartidaAlertDialog'
import { ConfiguracaoPadraoSheet } from '@/ui/components/ConfiguracaoPadraoSheet'
import { CriarPartidaSheet } from '@/ui/components/CriarPartidaSheet'
import { HistoricoPartidas } from '@/ui/components/HistoricoPartidas'
import { MontagemEquipes } from '@/ui/components/MontagemEquipes'
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
  } = usePartidaAtiva()
  const { configuracao, atualizar } = useConfiguracaoPadrao()
  const clientes = listarClientes()
  const lancamentos = listarLancamentos()
  const todasParticipacoes = listarParticipacoes()
  const todasPartidas = listarPartidas()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Partida</h2>
        <div className="flex gap-2">
          <ConfiguracaoPadraoSheet configuracao={configuracao} onAtualizar={atualizar} />
          {!partida && <CriarPartidaSheet configuracaoPadrao={configuracao} onCriar={criar} />}
        </div>
      </div>

      {!partida && (
        <p className="text-sm text-muted-foreground">
          Nenhuma partida em andamento. Crie uma nova partida para começar.
        </p>
      )}

      {partida && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm text-muted-foreground">
            <span>
              Consumação mínima: {formatoMoeda.format(partida.valorMinimoConsumacao)} · Valor da
              partida por cliente: {formatoMoeda.format(partida.valorPartidaPorCliente)}
            </span>
            <ConcluirPartidaAlertDialog onConcluir={concluir} />
          </div>

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
        </div>
      )}

      <HistoricoPartidas
        historico={historico}
        clientes={clientes}
        partidaAtivaExiste={!!partida}
        onCriarComParticipantes={criarComParticipantes}
        onLimparHistorico={limparHistorico}
      />
    </div>
  )
}
