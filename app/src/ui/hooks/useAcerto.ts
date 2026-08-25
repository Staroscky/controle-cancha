import { useCallback, useState } from 'react'
import { definirPresencaCliente, listarClientes } from '@/data/clientesRepo'
import { adicionarLancamento, listarLancamentos, listarLancamentosPorCliente } from '@/data/lancamentosRepo'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import { prepararLancamentoPagamento } from '@/domain/rules/prepararLancamentoPagamento'
import type { Cliente } from '@/domain/types/Cliente'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'

export type ItemSaldoCliente = {
  cliente: Cliente
  saldo: number
}

export function useAcerto() {
  const [clientes, setClientes] = useState<Cliente[]>(() => listarClientes())
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(() => listarLancamentos())

  const recarregar = useCallback(() => {
    setClientes(listarClientes())
    setLancamentos(listarLancamentos())
  }, [])

  const itens: ItemSaldoCliente[] = clientes.map((cliente) => ({
    cliente,
    saldo: calcularSaldo(lancamentos, cliente.id),
  }))
  const pendencias = itens.filter((item) => item.saldo !== 0)
  const emDia = itens.filter((item) => item.saldo === 0)

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

  const marcarSaida = useCallback(
    (clienteId: string) => {
      definirPresencaCliente(clienteId, false)
      recarregar()
    },
    [recarregar],
  )

  return {
    clientes,
    lancamentos,
    pendencias,
    emDia,
    extratoDoCliente,
    registrarPagamento,
    marcarSaida,
  }
}
