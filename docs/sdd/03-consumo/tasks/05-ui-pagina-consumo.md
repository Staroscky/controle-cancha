# 05 — UI: aba Consumo

**Status:** ✅ Concluído

Substituir o placeholder de `ui/pages/ConsumoPage.tsx` pela tela real, montando o hook `useConsumo` (tarefa 02) com os componentes das tarefas 03 e 04, no mesmo formato de `PartidaPage.tsx` (cabeçalho com título + ações à direita).

- Cabeçalho: título "Consumo" + botões "Novo item" (`NovoItemConsumoSheet`) e "Lançar consumo" (`LancarConsumoSheet`).
- Lista simples do catálogo (`nome` + `valor` formatado em `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, mesmo formatador usado em `PartidaPage.tsx`/`ClientesPage.tsx`) — só leitura, sem edição (fora de escopo, ver `spec.md`).
- Estado vazio: mensagem quando não há itens no catálogo e/ou nenhum cliente presente (reaproveitar `listarClientes` para saber se há alguém presente antes de habilitar "Lançar consumo").

Critério de pronto: `npm run build` passa; fluxo completo testado manualmente no navegador (cadastrar item → lançar consumo do catálogo → lançar avulso → conferir no LocalStorage/pela aba Partida que o indicativo de consumação mínima reage ao novo lançamento quando o cliente está em partida ativa).
