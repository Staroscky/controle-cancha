# 04 — UI: lançar consumo

**Status:** ✅ Concluído

`ui/components/LancarConsumoSheet.tsx` — `Sheet` principal do fluxo (seção 5 de `arquitetura.md`):

1. **Item**: alternância entre "Do catálogo" (`<select>` estilizado, mesmo padrão do seletor de cliente em `MontagemEquipes.tsx`, listando `itens` do hook) e "Avulso" (campos "Descrição" + "Valor" digitados na hora) — seção 10 de `regras.md`. Selecionar um item do catálogo pré-preenche o valor, mas pode ser ajustado antes de confirmar (mesma ideia do "valor sugerido" da seção 10).
2. **Clientes**: lista de clientes **presentes** (`cliente.presente`), cada um como um botão de alternância (toggle, mesmo padrão visual do seletor de equipe em `MontagemEquipes.tsx`) para selecionar quem divide o item. Nenhum cliente ausente aparece (seção 3.1).
3. **Validação antes de confirmar**: precisa de descrição/valor válidos (valor > 0) e pelo menos 1 cliente selecionado — `Toast` de erro (`sonner`) caso contrário.
4. Ao confirmar, chama `onLancar(descricao, valor, itemId, clienteIds)` (hook da tarefa 02), mostra `Toast` de sucesso resumindo o lançamento (ex.: "Cerveja lançada para 3 clientes") e fecha o Sheet.

Critério de pronto: testado com 1 cliente selecionado (lançamento único, valor cheio) e com 3 clientes (três lançamentos "1/3 <item>"), tanto com item do catálogo quanto avulso.
