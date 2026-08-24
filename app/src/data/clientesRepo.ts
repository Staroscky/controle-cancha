import { normalizarNomeCliente } from '../domain/rules/normalizarNomeCliente'
import type { Cliente } from '../domain/types/Cliente'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:clientes'

export function listarClientes(): Cliente[] {
  return getItem<Cliente[]>(CHAVE, [])
}

export function buscarClientePorId(id: string): Cliente | undefined {
  return listarClientes().find((c) => c.id === id)
}

export function adicionarCliente(nome: string): Cliente {
  const nomeNormalizado = normalizarNomeCliente(nome)
  const clientes = listarClientes()

  const jaExiste = clientes.some(
    (c) => c.nome.toLowerCase() === nomeNormalizado.toLowerCase(),
  )
  if (jaExiste) {
    throw new Error(`Já existe um cliente cadastrado como "${nomeNormalizado}".`)
  }

  const cliente: Cliente = {
    id: crypto.randomUUID(),
    nome: nomeNormalizado,
    presente: false,
  }

  setItem(CHAVE, [...clientes, cliente])
  return cliente
}

export function definirPresencaCliente(id: string, presente: boolean): void {
  const clientes = listarClientes().map((c) =>
    c.id === id ? { ...c, presente } : c,
  )
  setItem(CHAVE, clientes)
}
