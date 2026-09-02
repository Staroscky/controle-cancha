# 06 — Comanda consolidada

**Status:** Planejado

## Objetivo

Adicionar uma segunda visualização na comanda (drawer da Aba Comandas), ao lado do **extrato** cronológico já existente (`ExtratoCliente.tsx`): a visão **consolidada**, que resume o consumo do cliente/grupo agrupado por item — no formato que estabelecimentos costumam entregar pro cliente conferir e pagar (quantidade × item, subtotal, ajustes, saldo), em vez da lista lançamento a lançamento do extrato.

## Escopo

Baseado no extrato atual (`ExtratoCliente.tsx`, `agruparLancamentosPorDia`, `calcularSaldo`, `lancamentoEstaCorrigido`) e seções 13 e 14.1 de `docs/regras.md`:

- **Sempre o último dia disponível**: usa o mesmo grupo "mais recente" que o extrato já calcula (`agruparLancamentosPorDia` + injeção do dia de hoje quando vazio) — sem navegação entre dias como o extrato tem.
- **Saldo anterior**: quando o `saldoAnterior` desse grupo for diferente de zero (positivo ou negativo), mostra uma linha própria "Saldo anterior" no topo, antes dos itens do dia — mesma semântica da `LinhaSaldo` já usada no extrato.
- **Itens agrupados**: lançamentos de `Consumo` ativos (não estornados/corrigidos — mesmo critério de `lancamentoEstaCorrigido` do extrato) do dia são agrupados por item, mostrando quantidade + nome + valor total do grupo. Chave de agrupamento = `itemId` quando presente; enquanto o lançamento avulso (sem `itemId`) existir, precisa de um fallback por `descricao` + valor unitário — ver observação sobre catálogo obrigatório abaixo.
- **Linhas de resumo (não itemizadas)**: `Crédito partida`, `Débito partida`, `Pagamento` e `Uso de crédito` não são "produto" — aparecem como linhas somadas por tipo abaixo da lista de itens (ex.: "Resultado das partidas", "Pagamentos", "Uso de crédito"), não item a item.
- **Rodapé**: saldo final do dia, mesma linha de destaque (`LinhaSaldo` com `enfase`) já usada no extrato.
- **Alternância Extrato ↔ Consolidada**: dentro do mesmo drawer (`ComandaDrawer.tsx`), por cliente/aba. O controle visual exato (toggle, tabs secundárias, etc.) fica pra decidir na tarefa de implementação.

## Fora de escopo (por enquanto)

- Implementação em si — este documento só registra a decisão discutida; nenhum código foi alterado.
- Exportação/impressão da comanda consolidada (extrato hoje também é só tela — sem PDF/print/CSV).
- **Obrigar item de catálogo em todo lançamento de Consumo (remover o fluxo avulso)**: virou feature própria, `docs/sdd/07-catalogo-obrigatorio/spec.md` — não faz parte desta feature. Enquanto ela não entrar, a consolidada precisa do fallback de agrupamento por `descricao`+valor unitário descrito acima, pros lançamentos avulsos (sem `itemId`).

## Referências

- `docs/regras.md` — seção 10 (catálogo opcional / avulso, seção "Catálogo de itens"), seção 11.3 (correção/remoção, `lancamentoEstaCorrigido`), seção 13 (consultas de saldo e extrato), seção 14.1 (Aba Comandas, extrato do cliente).
- `docs/sdd/04-acerto/spec.md` e `tasks/08-drawer-unificado-extrato-pagamento.md` — extrato/drawer atuais que esta feature estende.
- `docs/sdd/07-catalogo-obrigatorio/spec.md` — feature separada que, se implementada antes desta, elimina o fallback por `descricao`+valor no agrupamento de itens.
- Código: `app/src/ui/components/ExtratoCliente.tsx`, `ComandaDrawer.tsx`, `app/src/domain/rules/agruparLancamentosPorDia.ts`, `calcularSaldo.ts`, `lancamentoEstaCorrigido.ts`.
