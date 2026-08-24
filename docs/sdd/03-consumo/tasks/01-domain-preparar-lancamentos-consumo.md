# 01 — Domain: dividir consumo entre clientes

**Status:** ✅ Concluído

Nova regra pura em `domain/rules/prepararLancamentosConsumo.ts`, no mesmo formato de `prepararLancamentosFechamentoPartida.ts` (retorna `Omit<LancamentoFinanceiro, 'id' | 'criadoEm'>[]`, quem persiste é a camada de cima).

Assinatura sugerida:

```ts
prepararLancamentosConsumo(
  clienteIds: string[],
  descricaoItem: string,
  valorTotal: number,
  itemId: string | null,
  obterPartidaIdDoCliente: (clienteId: string) => string | null,
): LancamentoAGerar[]
```

Regras (seção 10 de `regras.md`):

- `clienteIds.length === 0` ou `valorTotal <= 0` → retorna lista vazia.
- 1 cliente → `descricao = descricaoItem`, `valor = -valorTotal`.
- X clientes (X > 1) → `descricao = "1/X " + descricaoItem`, `valor = -(valorTotal / X)` para cada um.
- `tipoId` sempre `TIPO_LANCAMENTO_IDS.consumo`.
- `partidaId` de cada lançamento vem de `obterPartidaIdDoCliente(clienteId)` — a função não decide sozinha se o cliente está em partida, só recebe a resposta já resolvida (essa resolução depende de repositório e fica na tarefa 02, para manter `domain/` sem I/O, seguindo a separação da seção 2 de `arquitetura.md`).
- Sem arredondamento manual na divisão — mesmo comportamento de `calcularCreditoVitoria`.

Critério de pronto: função pura, sem import de nenhum `data/*Repo`, usada pelo hook da tarefa 02.
