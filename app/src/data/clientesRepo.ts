import { normalizarNomeCliente } from '../domain/rules/normalizarNomeCliente'
import type { Cliente } from '../domain/types/Cliente'
import { criarGrupo, removerGrupo } from './gruposRepo'
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

export function renomearCliente(id: string, nome: string): void {
  const nomeNormalizado = normalizarNomeCliente(nome)
  const clientes = listarClientes()

  const jaExiste = clientes.some(
    (c) => c.id !== id && c.nome.toLowerCase() === nomeNormalizado.toLowerCase(),
  )
  if (jaExiste) {
    throw new Error(`Já existe um cliente cadastrado como "${nomeNormalizado}".`)
  }

  const atualizados = clientes.map((c) => (c.id === id ? { ...c, nome: nomeNormalizado } : c))
  setItem(CHAVE, atualizados)
}

export function removerCliente(id: string): void {
  const clientes = listarClientes()
  const cliente = clientes.find((c) => c.id === id)
  if (!cliente) return

  const grupoId = cliente.grupoId
  const restantes = clientes.filter((c) => c.id !== id)

  if (grupoId) {
    const aindaTemNoGrupo = restantes.filter((c) => c.grupoId === grupoId)
    if (aindaTemNoGrupo.length <= 1) {
      const limpos = restantes.map((c) =>
        c.grupoId === grupoId ? { ...c, grupoId: undefined } : c,
      )
      setItem(CHAVE, limpos)
      removerGrupo(grupoId)
      return
    }
  }

  setItem(CHAVE, restantes)
}

export function definirPresencaCliente(id: string, presente: boolean): void {
  let clientes = listarClientes().map((c) => (c.id === id ? { ...c, presente } : c))

  const clienteAlterado = clientes.find((c) => c.id === id)
  const grupoId = clienteAlterado?.grupoId
  if (grupoId) {
    // Toda mudança de presença desvincula do grupo (mesma regra de removerClienteDoGrupo):
    // o grupo representa a mesa da visita atual, então tanto sair quanto chegar de novo
    // encerram o vínculo com a mesa anterior — cada chegada começa sem mesa definida.
    clientes = clientes.map((c) => (c.id === id ? { ...c, grupoId: undefined } : c))
    const restantes = clientes.filter((c) => c.grupoId === grupoId)
    if (restantes.length <= 1) {
      clientes = clientes.map((c) => (c.grupoId === grupoId ? { ...c, grupoId: undefined } : c))
      removerGrupo(grupoId)
    }
  }

  setItem(CHAVE, clientes)
}

export function agruparClientes(idArrastado: string, idDestino: string): void {
  if (idArrastado === idDestino) return

  const clientes = listarClientes()
  const arrastado = clientes.find((c) => c.id === idArrastado)
  const destino = clientes.find((c) => c.id === idDestino)
  if (!arrastado || !destino) return

  const grupoAntigo = arrastado.grupoId
  const grupoId = destino.grupoId ?? criarGrupo().id

  let atualizados = clientes.map((c) =>
    c.id === idArrastado || c.id === idDestino ? { ...c, grupoId } : c,
  )

  if (grupoAntigo && grupoAntigo !== grupoId) {
    const restantes = atualizados.filter((c) => c.grupoId === grupoAntigo)
    if (restantes.length <= 1) {
      atualizados = atualizados.map((c) =>
        c.grupoId === grupoAntigo ? { ...c, grupoId: undefined } : c,
      )
      removerGrupo(grupoAntigo)
    }
  }

  setItem(CHAVE, atualizados)
}

export function removerClienteDoGrupo(id: string): void {
  const clientes = listarClientes()
  const cliente = clientes.find((c) => c.id === id)
  const grupoId = cliente?.grupoId
  if (!grupoId) return

  const atualizados = clientes.map((c) => (c.id === id ? { ...c, grupoId: undefined } : c))

  const restantes = atualizados.filter((c) => c.grupoId === grupoId)
  if (restantes.length <= 1) {
    const limpos = atualizados.map((c) =>
      c.grupoId === grupoId ? { ...c, grupoId: undefined } : c,
    )
    setItem(CHAVE, limpos)
    removerGrupo(grupoId)
    return
  }

  setItem(CHAVE, atualizados)
}
