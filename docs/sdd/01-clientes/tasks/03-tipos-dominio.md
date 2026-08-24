# 03 — Tipos de domínio

**Status:** ✅ Concluído

Um arquivo por entidade em `domain/types/`, seguindo o modelo de dados da seção 12 de `docs/regras.md`: `Cliente`, `Equipe`, `TipoLancamento`, `ItemConsumo`, `ConfiguracaoPadrao`, `Partida`, `Participacao`, `LancamentoFinanceiro`.

Decisão tomada durante a tarefa: `Equipe` e `TipoLancamento` são dados fixos (2 e 4 linhas, respectivamente, que nunca mudam) — em vez de um repositório com CRUD sobre LocalStorage, cada arquivo de tipo exporta também os ids fixos (`EQUIPE_IDS`, `TIPO_LANCAMENTO_IDS`) e a lista completa (`EQUIPES`, `TIPOS_LANCAMENTO`) como constantes. Resolve o mesmo problema que a tabela do doc resolveria (não comparar por texto solto) com menos código.

Critério de pronto: `npm run build` (typecheck) passa com os 8 tipos criados.
