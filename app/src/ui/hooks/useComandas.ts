import { useCallback, useState } from 'react'
import { definirPresencaCliente, listarClientes } from '@/data/clientesRepo'
import { listarGrupos } from '@/data/gruposRepo'
import { listarItensConsumoOrdenados } from '@/data/itensConsumoRepo'
import { adicionarLancamento, listarLancamentos, listarLancamentosPorCliente } from '@/data/lancamentosRepo'
import { listarParticipacoesPorPartida } from '@/data/participacoesRepo'
import { listarPartidas } from '@/data/partidasRepo'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import { prepararLancamentoPagamento } from '@/domain/rules/prepararLancamentoPagamento'
import { prepararLancamentosConsumo } from '@/domain/rules/prepararLancamentosConsumo'
import {
  prepararLancamentosPagamentoGrupo,
  type ItemPagamentoGrupo,
} from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { Cliente } from '@/domain/types/Cliente'
import type { Grupo } from '@/domain/types/Grupo'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'

export function useComandas() {
  const [clientes, setClientes] = useState<Cliente[]>(() => listarClientes())
  const [grupos, setGrupos] = useState<Grupo[]>(() => listarGrupos())
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(() => listarLancamentos())
  const [itensConsumo] = useState<ItemConsumo[]>(() => listarItensConsumoOrdenados())

  const recarregar = useCallback(() => {
    setClientes(listarClientes())
    setGrupos(listarGrupos())
    setLancamentos(listarLancamentos())
  }, [])

  const saldoDoCliente = useCallback(
    (clienteId: string) => calcularSaldo(lancamentos, clienteId),
    [lancamentos],
  )

  const extratoDoCliente = useCallback((clienteId: string) => {
    return listarLancamentosPorCliente(clienteId)
  }, [])

  const registrarPagamento = useCallback(
    (clienteId: string, valor: number, descricao: string): boolean => {
      const lancamento = prepararLancamentoPagamento(clienteId, valor, descricao)
      if (!lancamento) return false

      adicionarLancamento(lancamento)
      recarregar()
      return true
    },
    [recarregar],
  )

  const registrarPagamentoGrupo = useCallback(
    (itens: ItemPagamentoGrupo[], descricao: string): boolean => {
      const novosLancamentos = prepararLancamentosPagamentoGrupo(itens, descricao)
      if (novosLancamentos.length === 0) return false

      novosLancamentos.forEach(adicionarLancamento)
      recarregar()
      return true
    },
    [recarregar],
  )

  const marcarSaida = useCallback(
    (clienteId: string) => {
      definirPresencaCliente(clienteId, false)
      recarregar()
    },
    [recarregar],
  )

  const marcarSaidaGrupo = useCallback(
    (clienteIds: string[]) => {
      clienteIds.forEach((clienteId) => definirPresencaCliente(clienteId, false))
      recarregar()
    },
    [recarregar],
  )

  const lancarConsumo = useCallback(
    (descricaoItem: string, valorTotal: number, itemId: string | null, clienteIds: string[]) => {
      const partidaAtiva = listarPartidas().find((p) => p.status === 'em_andamento')
      const participacoesAtivas = partidaAtiva
        ? listarParticipacoesPorPartida(partidaAtiva.id).filter((p) => p.status === 'ativo')
        : []

      const obterPartidaIdDoCliente = (clienteId: string): string | null => {
        if (!partidaAtiva) return null
        const participa = participacoesAtivas.some((p) => p.clienteId === clienteId)
        return participa ? partidaAtiva.id : null
      }

      const lancamentosAGerar = prepararLancamentosConsumo(
        clienteIds,
        descricaoItem,
        valorTotal,
        itemId,
        obterPartidaIdDoCliente,
      )
      lancamentosAGerar.forEach((lancamento) => adicionarLancamento(lancamento))
      recarregar()
      return lancamentosAGerar
    },
    [recarregar],
  )

  return {
    clientes,
    grupos,
    lancamentos,
    itensConsumo,
    saldoDoCliente,
    extratoDoCliente,
    registrarPagamento,
    registrarPagamentoGrupo,
    marcarSaida,
    marcarSaidaGrupo,
    lancarConsumo,
  }
}
