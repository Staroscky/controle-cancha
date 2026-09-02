# 07 — Catálogo obrigatório (remoção do lançamento avulso)

**Status:** ✅ Concluído

## Objetivo

Exigir que todo lançamento de `Consumo` venha de um item do catálogo (`itens_consumo`) — remover a opção **"Avulso"** (descrição + valor digitados na hora) do fluxo de lançamento e de correção de consumo. Quando o item desejado não existir no catálogo, o dono precisa navegar até a **Aba Consumo** e cadastrá-lo lá antes de lançar — **sem** atalho de cadastro rápido dentro do Sheet de lançamento (decisão explícita: nada de criar item "na hora" a partir do fluxo de lançamento).

## Escopo

- `LancarConsumoSheet.tsx`: remove o toggle "Do catálogo" / "Avulso" (`Origem`) e o campo de descrição livre — só resta a `Combobox` de item do catálogo. `onLancar` passa a receber sempre um `itemId` não nulo; sem item selecionado, o botão "Confirmar" fica bloqueado (mesmo padrão de validação já usado pra "selecione ao menos 1 cliente").
- Catálogo vazio (`itens.length === 0`): a mensagem atual ("Nenhum item cadastrado no catálogo.") passa a ser o único caminho — sem CTA de criar ali dentro; o dono sai do Sheet e vai até a Aba Consumo cadastrar.
- Correção de lançamento (`ComandaDrawer.tsx` → fluxo de `onCorrigir`, seção 11.3 de `docs/regras.md`): mesmo formulário, mesma regra — corrigir um `Consumo` passa a exigir escolher um item do catálogo, **mesmo quando o lançamento original é um avulso histórico** (`itemId = null`, lançado antes desta mudança).
- `descricao`/`valor` continuam copiados do item pro lançamento no momento do lançamento (comportamento já atual pra itens de catálogo) — inalterado.
- Lançamentos de `Consumo` já existentes com `itemId = null` (avulsos lançados antes desta mudança) **não são migrados nem alterados** — o histórico permanece como está (seção 11.3: histórico nunca é apagado); só passam a não poder mais ser corrigidos "avulsamente" (item acima).

## Fora de escopo

- Cadastro rápido/inline de item dentro do fluxo de lançamento de consumo — decisão explícita do dono: não fazer, sempre navegar até a Aba Consumo.
- Categorização obrigatória de item (categoria do item continua opcional, seção 10).
- Migração/backfill de lançamentos avulsos antigos para um `itemId`.
- Mudanças na visão consolidada (feature 06) além de deixar de precisar do fallback por `descricao`+valor no agrupamento — isso é consequência, não escopo desta feature.
- Bloquear a remoção de um item do catálogo que já tem lançamentos — regra já existente (remover item não afeta lançamentos passados, seção 10) e não muda aqui.

## Referências

- `docs/regras.md` — seção 10 ("Catálogo de itens (opcional, para agilizar)" — o texto precisa deixar de descrever o avulso como alternativa quando esta feature entrar), seção 11.3 (correção/remoção de lançamento).
- `docs/sdd/06-comanda-consolidacao/spec.md` — motivação original da decisão: agrupamento determinístico por `itemId` na visão consolidada, sem heurística por descrição+valor.
- Código: `app/src/ui/components/LancarConsumoSheet.tsx`, `ComandaDrawer.tsx` (correção de consumo), `app/src/ui/pages/ConsumoPage.tsx` (cadastro de item do catálogo já existe lá — é pra onde o dono deve navegar).
