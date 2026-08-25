import { describe, expect, it } from 'vitest'
import { prepararLancamentosPagamentoGrupo } from '@/domain/rules/prepararLancamentosPagamentoGrupo'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

const CLIENTE_1 = 'cliente-1'
const CLIENTE_2 = 'cliente-2'
const CLIENTE_3 = 'cliente-3'

describe('prepararLancamentosPagamentoGrupo', () => {
  it('gera um lançamento por item com valor > 0, todos com a mesma descrição', () => {
    const lancamentos = prepararLancamentosPagamentoGrupo(
      [
        { clienteId: CLIENTE_1, valor: 20 },
        { clienteId: CLIENTE_2, valor: 15 },
      ],
      'Pagamento em grupo — pago por Fulano',
    )

    expect(lancamentos).toHaveLength(2)
    expect(lancamentos).toEqual([
      expect.objectContaining({
        clienteId: CLIENTE_1,
        tipoId: TIPO_LANCAMENTO_IDS.pagamento,
        partidaId: null,
        itemId: null,
        valor: 20,
        descricao: 'Pagamento em grupo — pago por Fulano',
      }),
      expect.objectContaining({
        clienteId: CLIENTE_2,
        valor: 15,
        descricao: 'Pagamento em grupo — pago por Fulano',
      }),
    ])
  })

  it('ignora itens com valor <= 0, mantendo os demais', () => {
    const lancamentos = prepararLancamentosPagamentoGrupo(
      [
        { clienteId: CLIENTE_1, valor: 20 },
        { clienteId: CLIENTE_2, valor: 0 },
        { clienteId: CLIENTE_3, valor: -5 },
      ],
      'Pix',
    )

    expect(lancamentos).toHaveLength(1)
    expect(lancamentos[0].clienteId).toBe(CLIENTE_1)
  })

  it('lista vazia retorna lista vazia', () => {
    expect(prepararLancamentosPagamentoGrupo([], 'Pix')).toEqual([])
  })
})
