import type { Lado, Participacao } from '../domain/types/Participacao'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:participacoes'

export function listarParticipacoes(): Participacao[] {
  return getItem<Participacao[]>(CHAVE, [])
}

export function listarParticipacoesPorPartida(partidaId: string): Participacao[] {
  return listarParticipacoes().filter((p) => p.partidaId === partidaId)
}

export function adicionarParticipacao(
  clienteId: string,
  partidaId: string,
  equipeId: string,
  lado: Lado = null,
): Participacao {
  const participacao: Participacao = {
    id: crypto.randomUUID(),
    clienteId,
    partidaId,
    equipeId,
    lado,
    entrada: new Date().toISOString(),
    saida: null,
    status: 'ativo',
  }
  setItem(CHAVE, [...listarParticipacoes(), participacao])
  return participacao
}

export function registrarSaidaParticipacao(id: string): void {
  const participacoes = listarParticipacoes().map((p) =>
    p.id === id ? { ...p, saida: new Date().toISOString(), status: 'saiu' as const } : p,
  )
  setItem(CHAVE, participacoes)
}
