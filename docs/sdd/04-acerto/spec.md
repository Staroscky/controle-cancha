# 04 — Acerto

**Status:** ✅ Concluído

## Objetivo

Implementar a aba **Acerto**: saldo consolidado de cada cliente, extrato individual agrupado por partida, e registro de pagamento (quitação manual de saldo).

## Escopo

Baseado nas seções 11, 11.1, 13 e 14.1 (Aba Acerto) de `docs/regras.md`:

- **Saldo consolidado**: lista de todos os clientes com o saldo acumulado (`calcularSaldo`, já implementada), somando lançamentos de todas as partidas e avulsos (seção 11).
- **Pendências vs. em dia**: a lista é dividida em duas seções — clientes com saldo ≠ 0 (pendências) e clientes com saldo = 0 (em dia) — independente de estarem presentes ou ausentes (seção 14.1).
- **Extrato do cliente**: ao abrir o extrato de um cliente, mostra todos os seus lançamentos agrupados por partida (data + equipe vencedora de cada partida referenciada) e um grupo à parte para lançamentos sem partida (`partidaId = null`) — consumo avulso e pagamentos (seção 13). Isso cobre também a consulta "extrato de uma partida" da seção 13: dentro do extrato do cliente, cada partida aparece como um grupo separado; não existe uma tela de extrato por partida à parte.
- **Registrar pagamento** (seção 11.1): ação disponível para clientes com saldo pendente. Abre um formulário com valor sugerido = saldo devedor em módulo (editável, permite pagamento parcial) e descrição livre (ex.: "Pagamento em dinheiro", "Pix"). Gera um lançamento `Pagamento`, `partidaId = null`, `valor` sempre positivo.
- **Sugestão de marcar saída**: depois de registrar um pagamento, o sistema sugere (uma ação de um clique, não automática) marcar o cliente como "saiu do estabelecimento" (`presente = false`) — o dono decide se aceita (seção 3.1 e 11.1).

## Fora de escopo

- Conjunto de partidas (agrupar partidas com configuração financeira própria, seção 11) — o campo `conjuntoId` já existe no modelo, mas nenhuma feature cria ou gerencia conjuntos; fica para quando isso virar necessidade real.
- Ação "abrir extrato do cliente" a partir da aba Clientes (mencionada na seção 14.1, Aba Clientes) — o extrato passa a existir só na aba Acerto, para não duplicar a mesma tela em dois lugares.
- Editar ou excluir um pagamento já registrado.
- Qualquer exportação do extrato (PDF, impressão, CSV).

## Referências

- `docs/regras.md` — seção 3.1 (pagamento não marca saída automaticamente, só sugere), seção 11 (saldo acumulado entre partidas, conjunto de partidas), seção 11.1 (registro de pagamento), seção 12 (tipo `Pagamento`, `partidaId` sempre nulo), seção 13 (consultas de saldo e extrato), seção 14.1 (Aba Acerto).
- `docs/arquitetura.md` — seção 5 (diretrizes de UI/UX: `Sheet` para registrar pagamento, `Dialog` para ver o extrato do cliente, `Toast` para feedback e sugestão de marcar saída).
