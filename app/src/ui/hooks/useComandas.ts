import { useCallback, useState } from 'react'
import { listarCategoriasConsumoOrdenadas } from '@/data/categoriasConsumoRepo'
import { definirPresencaCliente, listarClientes } from '@/data/clientesRepo'
import { listarGrupos } from '@/data/gruposRepo'
import { listarItensConsumoOrdenados } from '@/data/itensConsumoRepo'
import { adicionarLancamento, listarLancamentos, listarLancamentosPorCliente } from '@/data/lancamentosRepo'
import { listarParticipacoesPorPartida } from '@/data/participacoesRepo'
import { listarPartidas } from '@/data/partidasRepo'
import { calcularSaldo } from '@/domain/rules/calcularSaldo'
import { prepararEstornoLancamento } from '@/domain/rules/prepararEstornoLancamento'
import { prepararLancamentoPagamento } from '@/domain/rules/prepararLancamentoPagamento'
import { prepararLancamentosConsumo } from '@/domain/rules/prepararLancamentosConsumo'
import {
  prepararLancamentosPagamentoGrupo,
  type ItemPagamentoGrupo,
} from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import { prepararLancamentosUsoCreditoGrupo } from '@/domain/rules/prepararLancamentosUsoCreditoGrupo'
import { prepararLancamentoUsoCredito } from '@/domain/rules/prepararLancamentoUsoCredito'
import type { CategoriaConsumo } from '@/domain/types/CategoriaConsumo'
import type { Cliente } from '@/domain/types/Cliente'
import type { Grupo } from '@/domain/types/Grupo'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

/** Resolve o partidaId de cada cliente com base na partida em andamento agora (mesma regra usada
 * ao lançar consumo e ao corrigir um lançamento de consumo). */
function criarResolvedorPartidaAtiva() {
  const partidaAtiva = listarPartidas().find((p) => p.status === 'em_andamento')
  const participacoesAtivas = partidaAtiva
    ? listarParticipacoesPorPartida(partidaAtiva.id).filter((p) => p.status === 'ativo')
    : []

  return (clienteId: string): string | null => {
    if (!partidaAtiva) return null
    const participa = participacoesAtivas.some((p) => p.clienteId === clienteId)
    return participa ? partidaAtiva.id : null
  }
}

export function useComandas() {
  const [clientes, setClientes] = useState<Cliente[]>(() => listarClientes())
  const [grupos, setGrupos] = useState<Grupo[]>(() => listarGrupos())
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(() => listarLancamentos())
  const [itensConsumo] = useState<ItemConsumo[]>(() => listarItensConsumoOrdenados())
  const [categoriasConsumo] = useState<CategoriaConsumo[]>(() => listarCategoriasConsumoOrdenadas())

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
    (itens: ItemPagamentoGrupo[], descricao: string, usosCredito: ItemPagamentoGrupo[] = []): boolean => {
      const novosLancamentos = [
        ...prepararLancamentosPagamentoGrupo(itens, descricao),
        ...prepararLancamentosUsoCreditoGrupo(usosCredito, descricao),
      ]
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

  const lancarConsumo = useCallback(
    (descricaoItem: string, valorTotal: number, itemId: string | null, clienteIds: string[]) => {
      const obterPartidaIdDoCliente = criarResolvedorPartidaAtiva()
      const loteId = clienteIds.length > 1 ? crypto.randomUUID() : null
      const lancamentosAGerar = prepararLancamentosConsumo(
        clienteIds,
        descricaoItem,
        valorTotal,
        itemId,
        obterPartidaIdDoCliente,
        loteId,
      )
      lancamentosAGerar.forEach((lancamento) => adicionarLancamento(lancamento))
      recarregar()
      return lancamentosAGerar
    },
    [recarregar],
  )

  // Corrige um lançamento de Consumo (seção 11.3 de docs/regras.md): estorna todos os lançamentos
  // originais informados (o item inteiro, se dividido entre vários clientes) e relança a versão
  // corrigida, que pode inclusive mudar quem participa da divisão.
  const corrigirConsumo = useCallback(
    (
      originais: LancamentoFinanceiro[],
      descricaoItem: string,
      valorTotal: number,
      itemId: string | null,
      clienteIds: string[],
    ): boolean => {
      const obterPartidaIdDoCliente = criarResolvedorPartidaAtiva()
      const novoLoteId = clienteIds.length > 1 ? crypto.randomUUID() : null
      const lancamentosAGerar = prepararLancamentosConsumo(
        clienteIds,
        descricaoItem,
        valorTotal,
        itemId,
        obterPartidaIdDoCliente,
        novoLoteId,
      )
      if (lancamentosAGerar.length === 0) return false

      originais.forEach((original) => adicionarLancamento(prepararEstornoLancamento(original)))
      lancamentosAGerar.forEach((lancamento) => adicionarLancamento(lancamento))
      recarregar()
      return true
    },
    [recarregar],
  )

  // Corrige um lançamento de Pagamento ou Uso de crédito (seção 11.3 de docs/regras.md): estorna
  // o original e relança com o valor/descrição/cliente corretos — cobre tanto valor errado quanto
  // ter lançado para a pessoa errada.
  const corrigirPagamentoOuCredito = useCallback(
    (original: LancamentoFinanceiro, clienteId: string, valor: number, descricao: string): boolean => {
      const preparar =
        original.tipoId === TIPO_LANCAMENTO_IDS.usoCredito
          ? prepararLancamentoUsoCredito
          : prepararLancamentoPagamento
      const novo = preparar(clienteId, valor, descricao)
      if (!novo) return false

      adicionarLancamento(prepararEstornoLancamento(original))
      adicionarLancamento(novo)
      recarregar()
      return true
    },
    [recarregar],
  )

  // Remove um lançamento sem relançar nada no lugar (seção 11.3 de docs/regras.md): estorna todos
  // os originais informados (o lote inteiro, se for um item dividido) e não gera substituto.
  const removerLancamento = useCallback(
    (originais: LancamentoFinanceiro[]): boolean => {
      if (originais.length === 0) return false

      originais.forEach((original) => adicionarLancamento(prepararEstornoLancamento(original)))
      recarregar()
      return true
    },
    [recarregar],
  )

  return {
    clientes,
    grupos,
    lancamentos,
    itensConsumo,
    categoriasConsumo,
    saldoDoCliente,
    extratoDoCliente,
    registrarPagamento,
    registrarPagamentoGrupo,
    marcarSaida,
    marcarSaidaGrupo,
    lancarConsumo,
    corrigirConsumo,
    corrigirPagamentoOuCredito,
    removerLancamento,
  }
}
