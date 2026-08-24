# 07 — Convenção de capitalização do nome do cliente

**Status:** ✅ Concluído

Correção pedida depois da primeira versão: nomes devem ser salvos com a primeira letra de cada palavra maiúscula, exceto preposições (`da`, `de`, `do`, `das`, `dos`), que ficam em minúsculo — a não ser que sejam a primeira palavra do nome.

- `normalizarNomeCliente` estendida para aplicar a capitalização depois do trim/colapso de espaços.
- `docs/regras.md` atualizado (seção "nome do cliente único e normalizado") com a regra e um exemplo (`"joao DA silva"` → `"Joao da Silva"`).

Critério de pronto: validado manualmente no navegador com um nome contendo preposição.
