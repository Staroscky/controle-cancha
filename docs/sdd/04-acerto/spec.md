# 04 — Acerto

**Status:** ✅ Concluído

> A pasta mantém o nome de execução `04-acerto`, mas a aba aparece na UI como **"Comandas"** — ver seção 14.1 de `docs/regras.md` e `tasks/07-redesign-comandas.md`.

## Objetivo

Implementar a aba **Comandas**: lista dos clientes presentes (agrupados como na Aba Clientes), saldo e extrato individual, registro de pagamento (quitação manual de saldo, individual ou em grupo).

## Escopo

Baseado nas seções 11, 11.1, 13 e 14.1 (Aba Comandas) de `docs/regras.md`:

- **Presentes agrupados**: primeiro bloco lista os clientes presentes, exibidos nos mesmos grupos formados na Aba Clientes (`grupoId`); saldo fica oculto até a linha (cliente ou grupo) ser expandida, e só uma linha fica expandida por vez na tela (privacidade entre clientes diferentes).
- **Pagamento em grupo**: dentro de um grupo expandido, "Pagar grupo" abre uma revisão com um único campo de valor (sugerido = soma das dívidas do grupo, editável) e confirma numa única ação. O valor informado é alocado automaticamente de quem deve mais para quem deve menos (`alocarPagamentoGrupo`); se não cobrir todo mundo, quem deve menos fica com pagamento parcial ou de fora. Por baixo gera um lançamento de `Pagamento` por membro que recebeu alguma parcela (mesma regra da seção 11.1), sem alterar o modelo de dados (`LancamentoFinanceiro` continua ligado a um único `clienteId`).
- **Outras pendências**: dropdown fechado por padrão com os clientes **ausentes** que ainda têm saldo ≠ 0.
- **Extrato do cliente**: ao abrir o extrato de um cliente, mostra todos os seus lançamentos, do mais antigo para o mais recente (seção 13). O valor continua vermelho (débito) ou verde (crédito); um ícone por tipo (`Consumo`, `Crédito partida`/`Débito partida`, `Pagamento`) identifica de onde veio cada lançamento.
- **Registrar pagamento** (seção 11.1): ação disponível para clientes com saldo pendente, individual ou dentro da revisão de grupo. Valor sugerido = saldo devedor em módulo (editável, permite pagamento parcial) e descrição livre (ex.: "Pagamento em dinheiro", "Pix"). Gera lançamento(s) `Pagamento`, `partidaId = null`, `valor` sempre positivo.
- **Sugestão de marcar saída**: depois de registrar um pagamento (individual ou em grupo), o sistema sugere (uma ação de um clique, não automática) marcar o(s) cliente(s) como "saiu do estabelecimento" (`presente = false`) — o dono decide se aceita (seção 3.1 e 11.1).

## Fora de escopo

- Conjunto de partidas (agrupar partidas com configuração financeira própria, seção 11) — o campo `conjuntoId` já existe no modelo, mas nenhuma feature cria ou gerencia conjuntos; fica para quando isso virar necessidade real.
- Ação "abrir extrato do cliente" a partir da aba Clientes (mencionada na seção 14.1, Aba Clientes) — o extrato passa a existir só na aba Comandas, para não duplicar a mesma tela em dois lugares.
- Editar ou excluir um pagamento já registrado.
- Qualquer exportação do extrato (PDF, impressão, CSV).
- Saldo de grupo como conceito de domínio (ex.: uma tabela `saldo_grupo`) — "pagar grupo" é só uma revisão de UI que gera pagamentos individuais; não existe saldo consolidado por grupo no modelo de dados.

## Referências

- `docs/regras.md` — seção 3.1 (pagamento não marca saída automaticamente, só sugere), seção 11 (saldo acumulado entre partidas, conjunto de partidas), seção 11.1 (registro de pagamento), seção 12 (tipo `Pagamento`, `partidaId` sempre nulo), seção 13 (consultas de saldo e extrato), seção 14.1 (Aba Comandas).
- `docs/arquitetura.md` — seção 5 (diretrizes de UI/UX: `Sheet` para registrar pagamento, `Dialog` para ver o extrato do cliente, `Toast` para feedback e sugestão de marcar saída).
