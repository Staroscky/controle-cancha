import { useCallback, useState } from 'react'
import { listarClientes } from '@/data/clientesRepo'
import { obterConfiguracaoPadrao } from '@/data/configuracaoRepo'
import { adicionarLancamento } from '@/data/lancamentosRepo'
import {
  adicionarParticipacao,
  inverterEquipesDaPartida,
  listarParticipacoesPorPartida,
  registrarSaidaParticipacao,
} from '@/data/participacoesRepo'
import {
  concluirPartida,
  criarPartida,
  limparHistoricoPartidas,
  listarPartidas,
} from '@/data/partidasRepo'
import { calcularNumeroPartidaDoDia } from '@/domain/rules/calcularNumeroPartidaDoDia'
import { prepararLancamentosConsumo } from '@/domain/rules/prepararLancamentosConsumo'
import { prepararLancamentosFechamentoPartida } from '@/domain/rules/prepararLancamentosFechamentoPartida'
import type { Lado, Participacao } from '@/domain/types/Participacao'
import type { Partida } from '@/domain/types/Partida'

function obterPartidaEmAndamento(): Partida | null {
  const emAndamento = listarPartidas()
    .filter((p) => p.status === 'em_andamento')
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
  return emAndamento[0] ?? null
}

function obterHistorico(): Partida[] {
  return listarPartidas()
    .filter((p) => p.status === 'concluida')
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
}

export function usePartidaAtiva() {
  const [partida, setPartida] = useState<Partida | null>(() => obterPartidaEmAndamento())
  const [participacoes, setParticipacoes] = useState<Participacao[]>(() =>
    partida ? listarParticipacoesPorPartida(partida.id) : [],
  )
  const [historico, setHistorico] = useState<Partida[]>(() => obterHistorico())

  const recarregar = useCallback((partidaAtual: Partida | null) => {
    setPartida(partidaAtual)
    setParticipacoes(partidaAtual ? listarParticipacoesPorPartida(partidaAtual.id) : [])
    setHistorico(obterHistorico())
  }, [])

  const criar = useCallback(
    (valores?: { valorMinimoConsumacao?: number; valorPartidaPorCliente?: number }) => {
      const padrao = obterConfiguracaoPadrao()
      const nova = criarPartida({
        valorMinimoConsumacao: valores?.valorMinimoConsumacao ?? padrao.valorMinimoConsumacao,
        valorPartidaPorCliente: valores?.valorPartidaPorCliente ?? padrao.valorPartidaPorCliente,
      })
      recarregar(nova)
      return nova
    },
    [recarregar],
  )

  const criarComParticipantes = useCallback(
    (partidaOrigemId: string) => {
      const participacoesOrigem = listarParticipacoesPorPartida(partidaOrigemId).filter(
        (p) => p.status === 'ativo',
      )
      const clientes = listarClientes()
      const elegiveis = participacoesOrigem.filter(
        (p) => clientes.find((c) => c.id === p.clienteId)?.presente,
      )

      if (elegiveis.length === 0) {
        return { partida: null, adicionados: 0, ignorados: participacoesOrigem.length }
      }

      const padrao = obterConfiguracaoPadrao()
      const nova = criarPartida({
        valorMinimoConsumacao: padrao.valorMinimoConsumacao,
        valorPartidaPorCliente: padrao.valorPartidaPorCliente,
      })
      elegiveis.forEach((p) => adicionarParticipacao(p.clienteId, nova.id, p.equipeId, p.lado))
      recarregar(nova)

      return {
        partida: nova,
        adicionados: elegiveis.length,
        ignorados: participacoesOrigem.length - elegiveis.length,
      }
    },
    [recarregar],
  )

  const limparHistorico = useCallback(() => {
    limparHistoricoPartidas()
    setHistorico(obterHistorico())
  }, [])

  const adicionarParticipante = useCallback(
    (clienteId: string, equipeId: string, lado: Lado) => {
      if (!partida) return
      adicionarParticipacao(clienteId, partida.id, equipeId, lado)
      recarregar(partida)
    },
    [partida, recarregar],
  )

  const inverterEquipes = useCallback(() => {
    if (!partida) return
    inverterEquipesDaPartida(partida.id)
    recarregar(partida)
  }, [partida, recarregar])

  const registrarSaida = useCallback(
    (participacaoId: string) => {
      if (!partida) return
      registrarSaidaParticipacao(participacaoId)
      recarregar(partida)
    },
    [partida, recarregar],
  )

  const lancarConsumo = useCallback(
    (descricao: string, valor: number, itemId: string | null, clienteIds: string[]) => {
      if (!partida) return
      const participacoesAtivas = participacoes.filter((p) => p.status === 'ativo')
      const obterPartidaIdDoCliente = (clienteId: string) =>
        participacoesAtivas.some((p) => p.clienteId === clienteId) ? partida.id : null

      const lancamentos = prepararLancamentosConsumo(
        clienteIds,
        descricao,
        valor,
        itemId,
        obterPartidaIdDoCliente,
      )
      lancamentos.forEach((lancamento) => adicionarLancamento(lancamento))
      recarregar(partida)
    },
    [partida, participacoes, recarregar],
  )

  const concluir = useCallback(
    (equipeVencedoraId: string) => {
      if (!partida) return
      const numeroPartidaDoDia = calcularNumeroPartidaDoDia(listarPartidas(), partida.id)
      const lancamentos = prepararLancamentosFechamentoPartida(
        participacoes,
        partida.id,
        equipeVencedoraId,
        partida.valorPartidaPorCliente,
        numeroPartidaDoDia,
      )
      lancamentos.forEach((lancamento) => adicionarLancamento(lancamento))
      concluirPartida(partida.id, equipeVencedoraId)
      recarregar(null)
    },
    [partida, participacoes, recarregar],
  )

  return {
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
    lancarConsumo,
  }
}
