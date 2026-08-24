import { useCallback, useState } from 'react'
import {
  adicionarCliente,
  agruparClientes,
  definirPresencaCliente,
  listarClientes,
  removerClienteDoGrupo,
} from '@/data/clientesRepo'
import { listarGrupos, renomearGrupo } from '@/data/gruposRepo'
import type { Cliente } from '@/domain/types/Cliente'
import type { Grupo } from '@/domain/types/Grupo'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() => listarClientes())
  const [grupos, setGrupos] = useState<Grupo[]>(() => listarGrupos())

  const recarregar = useCallback(() => {
    setClientes(listarClientes())
    setGrupos(listarGrupos())
  }, [])

  const cadastrar = useCallback(
    (nome: string) => {
      const cliente = adicionarCliente(nome)
      recarregar()
      return cliente
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
    definirPresenca,
    agrupar,
    desagrupar,
    renomearGrupoDoBloco,
  }
}
