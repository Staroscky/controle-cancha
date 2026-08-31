import { describe, expect, it } from 'vitest'
import { descricaoSemPrefixoDeRateio } from '@/domain/rules/descricaoSemPrefixoDeRateio'

describe('descricaoSemPrefixoDeRateio', () => {
  it('remove o prefixo "1/N " de um item dividido', () => {
    expect(descricaoSemPrefixoDeRateio('1/3 Cerveja')).toBe('Cerveja')
    expect(descricaoSemPrefixoDeRateio('1/12 Cerveja')).toBe('Cerveja')
  })

  it('descrição sem prefixo de rateio fica igual', () => {
    expect(descricaoSemPrefixoDeRateio('Cerveja')).toBe('Cerveja')
  })
})
