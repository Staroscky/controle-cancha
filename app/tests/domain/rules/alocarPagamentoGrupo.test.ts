import { describe, expect, it } from 'vitest'
import { alocarPagamentoGrupo } from '@/domain/rules/alocarPagamentoGrupo'

const JOAO = 'joao'
const MARIA = 'maria'
const ZEZINHO = 'zezinho'

describe('alocarPagamentoGrupo', () => {
  it('valor igual à soma das dívidas quita todo mundo', () => {
    const itens = alocarPagamentoGrupo(
      [
        { clienteId: JOAO, valorDevido: 10 },
        { clienteId: MARIA, valorDevido: 5 },
        { clienteId: ZEZINHO, valorDevido: 3 },
      ],
      18,
    )

    expect(itens).toEqual([
      { clienteId: JOAO, valor: 10 },
      { clienteId: MARIA, valor: 5 },
      { clienteId: ZEZINHO, valor: 3 },
    ])
  })

  it('valor menor que a soma abate de quem deve mais para quem deve menos, deixando o resto de fora', () => {
    // João 10, Maria 5, Zezinho 3 — paga 12: João quita, Maria paga só 2, Zezinho fica de fora.
    const itens = alocarPagamentoGrupo(
      [
        { clienteId: JOAO, valorDevido: 10 },
        { clienteId: MARIA, valorDevido: 5 },
        { clienteId: ZEZINHO, valorDevido: 3 },
      ],
      12,
    )

    expect(itens).toEqual([
      { clienteId: JOAO, valor: 10 },
      { clienteId: MARIA, valor: 2 },
    ])
  })

  it('valor maior que a soma das dívidas quita todo mundo e ignora o excedente', () => {
    const itens = alocarPagamentoGrupo(
      [
        { clienteId: JOAO, valorDevido: 10 },
        { clienteId: MARIA, valorDevido: 5 },
      ],
      100,
    )

    expect(itens).toEqual([
      { clienteId: JOAO, valor: 10 },
      { clienteId: MARIA, valor: 5 },
    ])
  })

  it.each([0, -10])('valor <= 0 (%i) não gera itens', (valorPago) => {
    expect(alocarPagamentoGrupo([{ clienteId: JOAO, valorDevido: 10 }], valorPago)).toEqual([])
  })

  it('lista de devedores vazia retorna lista vazia', () => {
    expect(alocarPagamentoGrupo([], 50)).toEqual([])
  })
})
