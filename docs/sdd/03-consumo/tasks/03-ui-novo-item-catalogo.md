# 03 — UI: cadastrar item no catálogo

**Status:** ✅ Concluído

`ui/components/NovoItemConsumoSheet.tsx` — `Sheet` (seção 5 de `arquitetura.md`) com campos "Nome" e "Valor sugerido", no mesmo estilo de `CriarPartidaSheet.tsx` (validação simples, `Toast` de confirmação/erro via `sonner`, fecha o Sheet ao salvar).

- Valor deve ser um número não negativo (mesma validação de `CriarPartidaSheet`).
- Ao salvar, chama `onCadastrar(nome, valor)` (prop vinda do hook `useConsumo`, tarefa 02).

Critério de pronto: item cadastrado aparece imediatamente na lista de seleção da tarefa 04.
