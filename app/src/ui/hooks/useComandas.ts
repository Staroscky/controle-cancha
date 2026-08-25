import { useCallback, useState } from 'react'
import { definirPresencaCliente, listarClientes } from '@/data/clientesRepo'
import { listarGrupos } from '@/data/gruposRepo'
import { adicionarLancamento, listarLancamentos, listarLancamentosPorCliente } from '@/data/lancamentosRepo'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import { prepararLancamentoPagamento } from '@/domain/rules/prepararLancamentoPagamento'
import {
  prepararLancamentosPagamentoGrupo,
  type ItemPagamentoGrupo,
} from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import type { Cliente } from '@/domain/types/Cliente'
import type { Grupo } from '@/domain/types/Grupo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'

export function useComandas() {
  const [clientes, setClientes] = useState<Cliente[]>(() => listarClientes())
  const [grupos, setGrupos] = useState<Grupo[]>(() => listarGrupos())
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(() => listarLancamentos())

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

  return {
    clientes,
    grupos,
    lancamentos,
    saldoDoCliente,
    extratoDoCliente,
    registrarPagamento,
    registrarPagamentoGrupo,
    marcarSaida,
    marcarSaidaGrupo,
  }
}
