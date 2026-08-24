import { useCallback, useState } from 'react'
import {
  adicionarItemConsumo,
  editarItemConsumo,
  listarItensConsumo,
  removerItemConsumo,
} from '@/data/itensConsumoRepo'
import { adicionarLancamento } from '@/data/lancamentosRepo'
import { listarParticipacoesPorPartida } from '@/data/participacoesRepo'
import { listarPartidas } from '@/data/partidasRepo'
import { prepararLancamentosConsumo } from '@/domain/rules/prepararLancamentosConsumo'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'

function obterItensOrdenados(): ItemConsumo[] {
  return listarItensConsumo().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function useConsumo() {
  const [itens, setItens] = useState<ItemConsumo[]>(() => obterItensOrdenados())

  const cadastrarItem = useCallback((nome: string, valor: number) => {
    const item = adicionarItemConsumo(nome, valor)
    setItens(obterItensOrdenados())
    return item
  }, [])

  const editarItem = useCallback((id: string, nome: string, valor: number) => {
    editarItemConsumo(id, nome, valor)
    setItens(obterItensOrdenados())
  }, [])

  const removerItem = useCallback((id: string) => {
    removerItemConsumo(id)
    setItens(obterItensOrdenados())
  }, [])

  const lancar = useCallback(
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

      const lancamentos = prepararLancamentosConsumo(
        clienteIds,
        descricaoItem,
        valorTotal,
        itemId,
        obterPartidaIdDoCliente,
      )
      lancamentos.forEach((lancamento) => adicionarLancamento(lancamento))
      return lancamentos
    },
    [],
  )

  return {
    itens,
    cadastrarItem,
    editarItem,
    removerItem,
    lancar,
  }
}
