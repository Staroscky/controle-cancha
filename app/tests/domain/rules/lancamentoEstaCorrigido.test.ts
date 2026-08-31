import { describe, expect, it } from 'vitest'
import { lancamentoEstaCorrigido } from '@/domain/rules/lancamentoEstaCorrigido'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { TIPO_LANCAMENTO_IDS } from '@/domain/types/TipoLancamento'

function criarLancamento(overrides: Partial<LancamentoFinanceiro>): LancamentoFinanceiro {
  return {
    id: 'lancamento-1',
    clienteId: 'cliente-1',
    partidaId: null,
    tipoId: TIPO_LANCAMENTO_IDS.pagamento,
    itemId: null,
    valor: 10,
    descricao: 'Pagamento',
    criadoEm: '2026-08-31T12:00:00.000Z',
    ...overrides,
  }
}

describe('lancamentoEstaCorrigido', () => {
  it('sem nenhum estorno referenciando o id, retorna false', () => {
    const original = criarLancamento({ id: 'lancamento-1' })

    expect(lancamentoEstaCorrigido(original, [original])).toBe(false)
  })

  it('com um estorno referenciando o id, retorna true', () => {
    const original = criarLancamento({ id: 'lancamento-1' })
    const estorno = criarLancamento({ id: 'lancamento-2', estornaLancamentoId: 'lancamento-1', valor: -10 })

    expect(lancamentoEstaCorrigido(original, [original, estorno])).toBe(true)
  })

  it('numa cadeia de 2 correções, só a versão mais antiga conta como corrigida', () => {
    const original = criarLancamento({ id: 'lancamento-1' })
    const estornoDoOriginal = criarLancamento({
      id: 'lancamento-2',
      estornaLancamentoId: 'lancamento-1',
      valor: -10,
    })
    const relancamento = criarLancamento({ id: 'lancamento-3' })
    const estornoDoRelancamento = criarLancamento({
      id: 'lancamento-4',
      estornaLancamentoId: 'lancamento-3',
      valor: -10,
    })
    const versaoAtual = criarLancamento({ id: 'lancamento-5' })
    const todos = [original, estornoDoOriginal, relancamento, estornoDoRelancamento, versaoAtual]

    expect(lancamentoEstaCorrigido(original, todos)).toBe(true)
    expect(lancamentoEstaCorrigido(relancamento, todos)).toBe(true)
    expect(lancamentoEstaCorrigido(versaoAtual, todos)).toBe(false)
  })
})
