# 01 — UI: configuração padrão

**Status:** ✅ Concluído

Tela/Sheet para ver e editar `configuracaoRepo` (`valorMinimoConsumacao`, `valorPartidaPorCliente`). Acessível a partir da aba Partida (ex.: botão "Configuração padrão" perto do botão de criar partida).

- `ui/hooks/useConfiguracaoPadrao.ts` — encapsula `obterConfiguracaoPadrao`/`atualizarConfiguracaoPadrao`.
- Formulário em `Sheet` (dois campos numéricos, aceitam R$ 0) — validação: não permitir valores negativos.

Critério de pronto: editar os valores, recarregar a página e ver os valores persistidos.

**Decisão/correção durante a implementação:** `ui/hooks/useConfiguracaoPadrao` guarda o estado localmente com `useState` (mesmo padrão de `useClientes`). Chamar o hook em dois componentes ao mesmo tempo (o Sheet de configuração e o Sheet de criar partida, ambos dentro de `PartidaPage`) cria duas instâncias de estado independentes — salvar no primeiro não atualiza o segundo até a página recarregar, já que não existe um store global. Corrigido fazendo `PartidaPage` chamar o hook uma única vez e passar `configuracao`/`onAtualizar` como props para `ConfiguracaoPadraoSheet`. Vale a mesma regra para qualquer hook futuro nesse estilo: se duas partes da árvore precisam do mesmo estado sincronizado, o hook deve ser chamado uma vez no ancestral comum, nunca duas vezes de forma independente.
