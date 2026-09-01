import { describe, expect, it } from 'vitest'
import { calcularResumoFinanceiro } from '@/domain/rules/calcularResumoFinanceiro'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

function criarLancamento(overrides: Partial<LancamentoFinanceiro> = {}): LancamentoFinanceiro {
  return {
    id: crypto.randomUUID(),
    clienteId: 'cliente-1',
    partidaId: null,
    tipoId: TIPO_LANCAMENTO_IDS.consumo,
    itemId: null,
    valor: 0,
    descricao: '',
    criadoEm: new Date(0).toISOString(),
    ...overrides,
  }
}

describe('calcularResumoFinanceiro', () => {
  it('retorna tudo zerado quando não há lançamentos', () => {
    expect(calcularResumoFinanceiro([])).toEqual({
      faturamentoConsumo: 0,
      recebidoEmCaixa: 0,
      quantidadeVendas: 0,
      ticketMedio: 0,
    })
  })

  it('converte o débito de Consumo (negativo) em faturamento positivo e calcula o ticket médio', () => {
    const lancamentos = [
      criarLancamento({ valor: -10 }),
      criarLancamento({ valor: -5 }),
    ]
    const resumo = calcularResumoFinanceiro(lancamentos)
    expect(resumo.faturamentoConsumo).toBe(15)
    expect(resumo.quantidadeVendas).toBe(2)
    expect(resumo.ticketMedio).toBe(7.5)
  })

  it('um estorno de Consumo cancela o lançamento original no faturamento e não conta como venda', () => {
    const lancamentos = [
      criarLancamento({ id: 'venda-1', valor: -10 }),
      criarLancamento({ valor: 10, estornaLancamentoId: 'venda-1' }),
    ]
    const resumo = calcularResumoFinanceiro(lancamentos)
    expect(resumo.faturamentoConsumo).toBe(0)
    expect(resumo.quantidadeVendas).toBe(0)
  })

  it('um item dividido entre vários clientes (mesmo loteId) conta como uma única venda', () => {
    const lancamentos = [
      criarLancamento({ valor: -5, loteId: 'lote-1', clienteId: 'a' }),
      criarLancamento({ valor: -5, loteId: 'lote-1', clienteId: 'b' }),
    ]
    const resumo = calcularResumoFinanceiro(lancamentos)
    expect(resumo.faturamentoConsumo).toBe(10)
    expect(resumo.quantidadeVendas).toBe(1)
  })

  it('Débito partida e Crédito partida não entram no faturamento (transferência entre clientes, seção 7)', () => {
    const lancamentos = [
      criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.debitoPartida, valor: -20 }),
      criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.debitoPartida, valor: -20 }),
      criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.creditoPartida, valor: 40 }),
    ]
    const resumo = calcularResumoFinanceiro(lancamentos)
    expect(resumo.faturamentoConsumo).toBe(0)
    expect(resumo.quantidadeVendas).toBe(0)
  })

  it('recebidoEmCaixa soma só os lançamentos de Pagamento, sem entrar no faturamento', () => {
    const lancamentos = [
      criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.pagamento, valor: 30 }),
      criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.usoCredito, valor: -15 }),
      criarLancamento({ tipoId: TIPO_LANCAMENTO_IDS.consumo, valor: -15 }),
    ]
    const resumo = calcularResumoFinanceiro(lancamentos)
    expect(resumo.recebidoEmCaixa).toBe(30)
    expect(resumo.faturamentoConsumo).toBe(15)
  })
})
