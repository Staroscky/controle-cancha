import { describe, expect, it } from 'vitest'
import { podeLimparHistorico } from '@/domain/rules/podeLimparHistorico'

describe('podeLimparHistorico', () => {
  it('permite quando o saldo está exatamente zerado', () => {
    expect(podeLimparHistorico(0)).toBe(true)
  })

  it('permite pra ruído de ponto flutuante bem abaixo do centavo', () => {
    expect(podeLimparHistorico(0.1 + 0.2 - 0.3)).toBe(true)
  })

  it('bloqueia quando há débito em aberto (saldo negativo)', () => {
    expect(podeLimparHistorico(-6)).toBe(false)
  })

  it('bloqueia quando há crédito em aberto (saldo positivo)', () => {
    expect(podeLimparHistorico(6)).toBe(false)
  })
})
