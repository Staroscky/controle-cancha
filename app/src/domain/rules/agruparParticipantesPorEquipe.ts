import type { Cliente } from '../types/Cliente'
import { EQUIPES } from '../types/Equipe'
import type { Lado, Participacao } from '../types/Participacao'
import type { Bloco } from './agruparClientesPorGrupo'

const ORDEM_LADOS: Lado[] = ['Cima', 'Baixo', null]

function emojiEquipe(nome: string): string {
  return nome === 'Azul' ? '🔵' : '🟡'
}

/** Agrupa os participantes ativos de uma partida por equipe e lado, para facilitar a divisão de consumo. */
export function agruparParticipantesPorEquipe(
  participacoesAtivas: Participacao[],
  clientes: Cliente[],
): Bloco[] {
  const blocos: Bloco[] = []

  for (const equipe of EQUIPES) {
    for (const lado of ORDEM_LADOS) {
      const membros = participacoesAtivas
        .filter((p) => p.equipeId === equipe.id && p.lado === lado)
        .map((p) => clientes.find((c) => c.id === p.clienteId))
        .filter((c): c is Cliente => !!c)

      if (membros.length === 0) continue

      blocos.push({
        grupoId: `${equipe.id}|${lado ?? 'sem-lado'}`,
        nome: `${emojiEquipe(equipe.nome)} ${equipe.nome}${lado ? ` · ${lado}` : ''}`,
        membros,
      })
    }
  }

  return blocos
}
