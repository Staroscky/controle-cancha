# 07 — Redesenho: Acerto → Comandas

Segunda rodada da feature, pedida depois da primeira versão (tasks 01-06) já estar funcionando: o dono queria ver os grupos formados na Aba Clientes também na hora de acertar, poder acertar um grupo inteiro numa ação só, e não deixar o saldo de um cliente visível na tela enquanto acerta com outro.

## Mudanças

- **Nome**: aba "Acerto" → "Comandas" (`app/src/App.tsx`, `ComandasPage.tsx`, `useComandas.ts`).
- **Agrupamento visual**: lógica de blocos por `grupoId` (antes só em `QuadroPresenca.tsx`) extraída para `app/src/domain/rules/agruparClientesPorGrupo.ts`, reaproveitada pela nova `ComandasPage`.
- **Ocultar valor até expandir**: `ComandaBloco.tsx` — cada cliente/grupo começa recolhido (só nome); saldo e ações só renderizam quando expandido. Estado `expandidoId` na página é único para toda a tela, então expandir uma linha recolhe qualquer outra.
- **Pagamento em grupo**: `RegistrarPagamentoGrupoSheet.tsx` — revisão com **um único campo de valor** para o grupo (sugerido = soma das dívidas, editável), confirmação única. `app/src/domain/rules/alocarPagamentoGrupo.ts` distribui esse valor abatendo de quem deve mais para quem deve menos (quem deve menos fica parcial ou de fora se o valor não cobrir todo mundo); `app/src/domain/rules/prepararLancamentosPagamentoGrupo.ts` transforma essa alocação em um lançamento de `Pagamento` por membro pago (reaproveita `prepararLancamentoPagamento`), sem mudar o modelo de dados.
- **Outras pendências**: dropdown fechado por padrão para clientes ausentes com saldo ≠ 0 — separado do bloco de presentes.

## Ajustes finos (pós-revisão)

- **Drawer de "Pagar grupo" mais largo**: `RegistrarPagamentoGrupoSheet.tsx` foi de `sm:max-w-sm` (padrão do `Sheet`) para `sm:max-w-md`, e a linha de cada membro passou a empilhar "devia" e "paga / fica devendo" em vez de tudo numa linha só — o texto quebrava de forma estranha na largura padrão.
- **Ordem do extrato corrigida e invertida**: `ExtratoClienteDialog.tsx` — o comparador antigo (`a.criadoEm < b.criadoEm ? 1 : -1`) nunca retornava `0` para lançamentos com o mesmo `criadoEm` (comum quando um pagamento em grupo ou um consumo dividido gera vários lançamentos na mesma sincronia), o que viola o contrato de comparador e podia embaralhar a ordem entre eles. Corrigido para um comparador de 3 vias; a pedido do dono, a ordem também passou de mais-recente-primeiro para **mais-antigo-primeiro**.
- **Cor do extrato por tipo, ícone e não a cor do valor**: primeira tentativa trocou a cor do valor de vermelho/verde por sinal para uma cor por `tipoId`. Revisto: vermelho/verde por sinal era bom e ficou; o que faltava era identificar o tipo do lançamento. `iconeDoLancamento` mapeia `tipoId` → ícone (lucide-react) exibido à esquerda da descrição: `Receipt` para `Consumo`, `Trophy` para `Crédito partida`/`Débito partida` (evento de jogo), `Banknote` para `Pagamento`.

## Fora desta rodada

- Continua sem saldo consolidado por grupo no modelo de dados (ver "Fora de escopo" em `spec.md`).
- Continua sem editar/excluir pagamento já registrado.
