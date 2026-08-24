import { useCallback, useState } from 'react'
import { adicionarCliente, definirPresencaCliente, listarClientes } from '@/data/clientesRepo'
import type { Cliente } from '@/domain/types/Cliente'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() => listarClientes())

  const recarregar = useCallback(() => {
    setClientes(listarClientes())
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

  return { clientes, cadastrar, definirPresenca }
}
