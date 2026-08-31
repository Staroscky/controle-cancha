import { describe, expect, it } from 'vitest'
import { prepararEstornoLancamento } from '@/domain/rules/prepararEstornoLancamento'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

const ORIGINAL: LancamentoFinanceiro = {
  id: 'lancamento-1',
  clienteId: 'cliente-1',
  partidaId: 'partida-1',
  tipoId: TIPO_LANCAMENTO_IDS.consumo,
  itemId: 'item-1',
  valor: -10,
  descricao: 'Cerveja',
  observacao: 'Valor original: R$ 30,00',
  loteId: 'lote-1',
  criadoEm: '2026-08-31T12:00:00.000Z',
}

describe('prepararEstornoLancamento', () => {
  it('inverte o valor e referencia o lançamento original', () => {
    const estorno = prepararEstornoLancamento(ORIGINAL)

    expect(estorno).toMatchObject({
      clienteId: ORIGINAL.clienteId,
      partidaId: ORIGINAL.partidaId,
      tipoId: ORIGINAL.tipoId,
      itemId: ORIGINAL.itemId,
      loteId: ORIGINAL.loteId,
      observacao: ORIGINAL.observacao,
      valor: 10,
      descricao: 'Estorno: Cerveja',
      estornaLancamentoId: ORIGINAL.id,
    })
  })

  it('não inclui id nem criadoEm do original (são gerados ao persistir)', () => {
    const estorno = prepararEstornoLancamento(ORIGINAL)

    expect(estorno).not.toHaveProperty('id')
    expect(estorno).not.toHaveProperty('criadoEm')
  })

  it('lançamento sem loteId/observacao gera estorno com loteId/observacao nulos', () => {
    const semLote: LancamentoFinanceiro = { ...ORIGINAL, loteId: undefined, observacao: undefined }

    const estorno = prepararEstornoLancamento(semLote)

    expect(estorno.loteId).toBeNull()
    expect(estorno.observacao).toBeNull()
  })
})
