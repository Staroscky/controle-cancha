# 01 — UI: configuração padrão

**Status:** 📝 Planejado

Tela/Sheet para ver e editar `configuracaoRepo` (`valorMinimoConsumacao`, `valorPartidaPorCliente`). Acessível a partir da aba Partida (ex.: botão "Configuração padrão" perto do botão de criar partida).

- `ui/hooks/useConfiguracaoPadrao.ts` — encapsula `obterConfiguracaoPadrao`/`atualizarConfiguracaoPadrao`.
- Formulário em `Sheet` (dois campos numéricos, aceitam R$ 0) — validação: não permitir valores negativos.

Critério de pronto: editar os valores, recarregar a página e ver os valores persistidos.
