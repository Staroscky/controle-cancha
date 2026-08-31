import { describe, expect, it } from 'vitest'
import { prepararLancamentosConsumo } from '@/domain/rules/prepararLancamentosConsumo'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const CLIENTE_1 = 'cliente-1'
const CLIENTE_2 = 'cliente-2'
const CLIENTE_3 = 'cliente-3'
const ITEM_ID = 'item-1'

const semPartida = () => null

describe('prepararLancamentosConsumo', () => {
  it('1 cliente selecionado gera 1 lançamento sem prefixo e valor cheio negativo', () => {
    const lancamentos = prepararLancamentosConsumo([CLIENTE_1], 'Cerveja', 10, ITEM_ID, semPartida)

    expect(lancamentos).toHaveLength(1)
    expect(lancamentos[0]).toMatchObject({
      clienteId: CLIENTE_1,
      descricao: 'Cerveja',
      valor: -10,
      itemId: ITEM_ID,
      tipoId: TIPO_LANCAMENTO_IDS.consumo,
      partidaId: null,
    })
  })

  it('3 clientes selecionados geram 3 lançamentos "1/3 <item>" com valor dividido', () => {
    const lancamentos = prepararLancamentosConsumo(
      [CLIENTE_1, CLIENTE_2, CLIENTE_3],
      'Cerveja',
      30,
      ITEM_ID,
      semPartida,
    )

    expect(lancamentos).toHaveLength(3)
    expect(lancamentos.every((l) => l.descricao === '1/3 Cerveja')).toBe(true)
    expect(lancamentos.every((l) => l.valor === -10)).toBe(true)
  })

  it('clienteIds vazio retorna lista vazia', () => {
    const lancamentos = prepararLancamentosConsumo([], 'Cerveja', 10, ITEM_ID, semPartida)

    expect(lancamentos).toEqual([])
  })

  it.each([0, -5])('valorTotal <= 0 (%i) retorna lista vazia', (valorTotal) => {
    const lancamentos = prepararLancamentosConsumo([CLIENTE_1], 'Cerveja', valorTotal, ITEM_ID, semPartida)

    expect(lancamentos).toEqual([])
  })

  it('cada lançamento reflete o partidaId resolvido individualmente para o cliente', () => {
    const obterPartidaIdDoCliente = (clienteId: string) =>
      clienteId === CLIENTE_1 ? 'partida-1' : null

    const lancamentos = prepararLancamentosConsumo(
      [CLIENTE_1, CLIENTE_2],
      'Cerveja',
      20,
      ITEM_ID,
      obterPartidaIdDoCliente,
    )

    const doCliente1 = lancamentos.find((l) => l.clienteId === CLIENTE_1)
    const doCliente2 = lancamentos.find((l) => l.clienteId === CLIENTE_2)
    expect(doCliente1?.partidaId).toBe('partida-1')
    expect(doCliente2?.partidaId).toBeNull()
  })

  it('item dividido entre vários clientes gera observação automática com o valor original', () => {
    const lancamentos = prepararLancamentosConsumo(
      [CLIENTE_1, CLIENTE_2],
      'Cerveja',
      12,
      ITEM_ID,
      semPartida,
    )

    expect(lancamentos.every((l) => l.observacao === `Valor original: ${formatoMoeda.format(12)}`)).toBe(
      true,
    )
  })

  it('item para 1 único cliente não gera observação', () => {
    const lancamentos = prepararLancamentosConsumo([CLIENTE_1], 'Cerveja', 10, ITEM_ID, semPartida)

    expect(lancamentos[0].observacao).toBeNull()
  })

  it('item dividido propaga o loteId recebido igualmente para todos os lançamentos', () => {
    const lancamentos = prepararLancamentosConsumo(
      [CLIENTE_1, CLIENTE_2, CLIENTE_3],
      'Cerveja',
      30,
      ITEM_ID,
      semPartida,
      'lote-1',
    )

    expect(lancamentos.every((l) => l.loteId === 'lote-1')).toBe(true)
  })

  it('1 único cliente ignora o loteId recebido (fica null, sem sentido pra rateio)', () => {
    const lancamentos = prepararLancamentosConsumo([CLIENTE_1], 'Cerveja', 10, ITEM_ID, semPartida, 'lote-1')

    expect(lancamentos[0].loteId).toBeNull()
  })

  it('loteId não informado (parâmetro omitido) resulta em null', () => {
    const lancamentos = prepararLancamentosConsumo([CLIENTE_1, CLIENTE_2], 'Cerveja', 20, ITEM_ID, semPartida)

    expect(lancamentos.every((l) => l.loteId === null)).toBe(true)
  })
})
