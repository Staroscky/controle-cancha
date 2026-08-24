import { describe, expect, it } from 'vitest'
import { normalizarNomeCliente } from '@/domain/rules/normalizarNomeCliente'

describe('normalizarNomeCliente', () => {
  it.each([
    ['  João   Silva  ', 'João Silva'],
    ['joão', 'João'],
    ['JOÃO SILVA', 'João Silva'],
    ['joao da silva', 'Joao da Silva'],
    ['joao DA silva', 'Joao da Silva'],
    ['maria dos santos', 'Maria dos Santos'],
    ['pedro DAS neves', 'Pedro das Neves'],
    ['ana de souza', 'Ana de Souza'],
    ['carlos do vale', 'Carlos do Vale'],
    ['da silva', 'Da Silva'],
    ['', ''],
    ['   ', ''],
  ])('normaliza "%s" para "%s"', (entrada, esperado) => {
    expect(normalizarNomeCliente(entrada)).toBe(esperado)
  })

  it('não altera um nome que já está normalizado', () => {
    expect(normalizarNomeCliente('João da Silva')).toBe('João da Silva')
  })

  it('colapsa múltiplos espaços entre palavras em um único espaço', () => {
    expect(normalizarNomeCliente('João     da     Silva')).toBe('João da Silva')
  })
})
