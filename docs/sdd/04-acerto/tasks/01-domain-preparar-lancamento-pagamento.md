# 01 — Domain: preparar lançamento de pagamento

**Status:** ✅ Concluído

Nova regra pura em `domain/rules/prepararLancamentoPagamento.ts`, no mesmo formato de `prepararLancamentosConsumo.ts` (retorna `Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>`, quem persiste é a camada de cima).

Assinatura sugerida:

```ts
prepararLancamentoPagamento(
  clienteId: string,
  valor: number,
  descricao: string,
): Omit<LancamentoFinanceiro, 'id' | 'criadoEm'> | null
```

Regras (seção 11.1 de `regras.md`):

- `valor <= 0` → retorna `null` (nada a lançar).
- `tipoId` sempre `TIPO_LANCAMENTO_IDS.pagamento`.
- `partidaId` sempre `null` — pagamento é acerto geral do cliente, não pertence a uma partida.
- `itemId` sempre `null`.
- `valor` sempre positivo (o próprio valor recebido, sem inverter sinal — diferente de `prepararLancamentosConsumo`, que gera valores negativos).
- `descricao`: usa o texto recebido (trim); se vier vazio, cai no padrão `"Pagamento"`.

Critério de pronto: função pura, sem import de nenhum `data/*Repo`, usada pelo hook da tarefa 02.
