import { useCallback, useState } from 'react'
import {
  adicionarCliente,
  agruparClientes,
  definirPresencaCliente,
  listarClientes,
  removerCliente,
  removerClienteDoGrupo,
  renomearCliente,
} from '@/data/clientesRepo'
import { listarGrupos, renomearGrupo } from '@/data/gruposRepo'
import { listarLancamentos, removerLancamentosDoCliente } from '@/data/lancamentosRepo'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import { podeLimparHistorico } from '@/domain/rules/podeLimparHistorico'
import type { Cliente } from '@/domain/types/Cliente'
import type { Grupo } from '@/domain/types/Grupo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'

export function useClientes() {
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

  const limparHistorico = useCallback(
    (id: string): boolean => {
      if (!podeLimparHistorico(calcularSaldo(lancamentos, id))) return false
      removerLancamentosDoCliente(id)
      recarregar()
      return true
    },
    [lancamentos, recarregar],
  )

  const cadastrar = useCallback(
    (nome: string) => {
      const cliente = adicionarCliente(nome)
      recarregar()
      return cliente
    },
    [recarregar],
  )

  const renomear = useCallback(
    (id: string, nome: string) => {
      renomearCliente(id, nome)
      recarregar()
    },
    [recarregar],
  )

  const remover = useCallback(
    (id: string) => {
      removerCliente(id)
      recarregar()
    },
    [recarregar],
  )

  const definirPresenca = useCallback(
    (id: string, presente: boolean) => {
      definirPresencaCliente(id, presente)
      recarregar()
    },
    [recarregar],
  )

  const agrupar = useCallback(
    (idArrastado: string, idDestino: string) => {
      agruparClientes(idArrastado, idDestino)
      recarregar()
    },
    [recarregar],
  )

  const desagrupar = useCallback(
    (id: string) => {
      removerClienteDoGrupo(id)
      recarregar()
    },
    [recarregar],
  )

  const renomearGrupoDoBloco = useCallback(
    (grupoId: string, nome: string) => {
      renomearGrupo(grupoId, nome)
      recarregar()
    },
    [recarregar],
  )

  return {
    clientes,
    grupos,
    cadastrar,
    renomear,
    remover,
    definirPresenca,
    agrupar,
    desagrupar,
    renomearGrupoDoBloco,
    saldoDoCliente,
    limparHistorico,
  }
}
