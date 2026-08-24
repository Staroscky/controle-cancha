# 03 — UI: montagem de equipes e lados

**Status:** 📝 Planejado

Componente para adicionar clientes **presentes** (`clientesRepo`, filtrando `presente: true`) à partida ativa, escolhendo equipe (Azul/Amarela) e, opcionalmente, lado (Cima/Baixo).

- Validação de limites (seção 2 de `regras.md`): máx. 4 por lado por equipe, 8 por equipe, 16 por partida — bloquear a ação e mostrar o motivo via `Toast` quando o limite for excedido, em vez de deixar adicionar e falhar depois.
- Botão de remover participante (saída durante a partida) — `AlertDialog` de confirmação, já que afeta o cálculo do fechamento (seção 3).
- Layout inspirado no exemplo da seção 2 (dois blocos, Cima/Baixo, com contagem por equipe).

Critério de pronto: testado manualmente respeitando e violando cada limite (tela deve impedir violação).
