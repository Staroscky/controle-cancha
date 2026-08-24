# 03 — UI: montagem de equipes e lados

**Status:** ✅ Concluído

Componente para adicionar clientes **presentes** (`clientesRepo`, filtrando `presente: true`) à partida ativa, escolhendo equipe (Azul/Amarela) e, opcionalmente, lado (Cima/Baixo).

- Validação de limites (seção 2 de `regras.md`): máx. 4 por lado por equipe, 8 por equipe, 16 por partida — bloquear a ação e mostrar o motivo via `Toast` quando o limite for excedido, em vez de deixar adicionar e falhar depois.
- Botão de remover participante (saída durante a partida) — `AlertDialog` de confirmação, já que afeta o cálculo do fechamento (seção 3).
- Layout inspirado no exemplo da seção 2 (dois blocos, Cima/Baixo, com contagem por equipe).

Critério de pronto: testado manualmente respeitando e violando cada limite (tela deve impedir violação).

**Decisão tomada durante a implementação:** o projeto não tinha um componente `Select` do shadcn instalado (só os listados em `arquitetura.md`). Em vez de adicionar uma dependência nova para um único campo, a escolha de cliente usa um `<select>` nativo estilizado como os demais campos, e equipe/lado usam pares de `Button` em modo toggle (mesmo padrão visual de seleção usado em outros lugares do app). Validado manualmente: criação de partida, montagem 4×4 e 8×4, adicionar/remover participante, limite de lado/equipe, indicativo de consumação (via lançamento de consumo injetado manualmente, já que a aba Consumo ainda não existe) e fechamento com valores zerados — todos sem erros no console.
