import { describe, expect, it } from 'vitest'
import { prepararLancamentoPagamento } from '@/domain/rules/prepararLancamentoPagamento'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

const CLIENTE_1 = 'cliente-1'

describe('prepararLancamentoPagamento', () => {
  it('valor > 0 retorna o lançamento com os campos fixos de pagamento', () => {
    const lancamento = prepararLancamentoPagamento(CLIENTE_1, 50, 'Pix')

    expect(lancamento).toMatchObject({
      clienteId: CLIENTE_1,
      tipoId: TIPO_LANCAMENTO_IDS.pagamento,
      partidaId: null,
      itemId: null,
      valor: 50,
      descricao: 'Pix',
    })
  })

  it.each([0, -10])('valor <= 0 (%i) retorna null', (valor) => {
    expect(prepararLancamentoPagamento(CLIENTE_1, valor, 'Pix')).toBeNull()
  })

  it('descricao com espaços nas pontas é gravada com trim()', () => {
    const lancamento = prepararLancamentoPagamento(CLIENTE_1, 50, '  Pagamento em dinheiro  ')

    expect(lancamento?.descricao).toBe('Pagamento em dinheiro')
  })

  it.each(['', '   '])('descricao vazia ou só espaços (%j) cai no padrão "Pagamento"', (descricao) => {
    const lancamento = prepararLancamentoPagamento(CLIENTE_1, 50, descricao)

    expect(lancamento?.descricao).toBe('Pagamento')
  })
})
