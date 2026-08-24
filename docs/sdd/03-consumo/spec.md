# 03 — Consumo

**Status:** ✅ Concluído

## Objetivo

Implementar a aba **Consumo**: lançar itens consumidos (do catálogo `itens_consumo` ou avulsos) e dividir o valor entre os clientes selecionados, gerando um lançamento de `Consumo` por cliente, com `partida_id` preenchido automaticamente quando o cliente estiver ativo na partida em andamento.

Boa parte da base já existe de features anteriores (tipos `ItemConsumo`/`LancamentoFinanceiro`, `itensConsumoRepo`, `lancamentosRepo`, `calcularConsumoRealNaPartida`) — falta a regra de divisão, o fio que resolve a partida ativa do cliente e a UI da aba, que hoje é só um placeholder (`ConsumoPage.tsx`).

## Escopo

Baseado na seção 10 e 14.1 (Aba Consumo) de `docs/regras.md`:

- **Catálogo de itens**: cadastrar, editar (nome + valor sugerido) e remover um item em `itens_consumo`, reaproveitando `itensConsumoRepo`. Remover um item do catálogo não afeta lançamentos de consumo já feitos com ele (a descrição e o valor ficam gravados no próprio lançamento).
- **Lançamento avulso**: descrição + valor digitados na hora, para o que não está no catálogo (seção 10).
- **Seleção de clientes**: a lista de seleção só mostra clientes **presentes** (seção 3.1), igual ao padrão já usado em Montagem de Equipes.
- **Divisão do valor** (seção 10):
  - 1 cliente selecionado → `descricao = "<item>"`, `valor = -valor total`.
  - X clientes selecionados (X > 1) → `descricao = "1/X <item>"`, `valor = -(valor total ÷ X)` para cada um.
- **`partida_id` automático** (seção 10 e regra de `partida_id` opcional da seção 12): se o cliente está `ativo` na partida com `status: 'em_andamento'` no momento do lançamento, o lançamento leva o id dessa partida; caso contrário `partida_id = null` (consumo fora de partida).
- Cada lançamento gerado é do tipo `Consumo` e persistido via `lancamentosRepo.adicionarLancamento` (já existe).

## Fora de escopo

- Extrato consolidado, saldo por cliente e registro de pagamento — feature 04 (Acerto).
- Editar ou remover lançamentos já criados — não está descrito em `regras.md` e não é necessário para o fluxo de lançamento.
- Categorização de itens do catálogo — cogitado, mas adiado; quando entrar, deve virar uma entidade própria (não um campo de texto livre).
- Qualquer regra de arredondamento além da divisão direta (`valor total ÷ X`) — mesmo comportamento já adotado em `calcularCreditoVitoria` (feature 02), sem tratamento especial de centavos.

## Referências

- `docs/regras.md` — seção 3.1 (só clientes presentes participam), seção 10 (registro de consumo com divisão, catálogo, consumo sem partida ativa), seção 12 (modelo de `lancamentos_financeiros`, `item_id` opcional, `partida_id` opcional para `Consumo`), seção 14.1 (Aba Consumo).
- `docs/arquitetura.md` — seção 5 (diretrizes de UI/UX: `Sheet` para lançar consumo, `Toast` para feedback).
