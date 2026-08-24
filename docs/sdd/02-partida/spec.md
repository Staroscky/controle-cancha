# 02 — Partida

**Status:** ✅ Concluído

## Objetivo

Implementar a aba **Partida**: montar equipes/lados com clientes presentes, controlar entrada e saída de participantes durante o jogo, e ao concluir a partida gerar automaticamente os lançamentos financeiros de vitória/derrota.

## Escopo

Baseado nas seções 2 a 9 e 14.1 (Aba Partida) de `docs/regras.md`:

- **Configuração padrão**: tela/Sheet para ver e editar `valor_minimo_consumacao` e `valor_partida_por_cliente` (seção 6). Pré-requisito para criar uma partida com valores sensatos.
- **Criar partida**: pré-preenchida com os valores padrão, mas cada partida pode sobrescrever os dois valores (ficam gravados na própria partida, seção 6).
- **Montar equipes**: adicionar clientes **presentes** (seção 3.1) à equipe 🔵 Azul ou 🟡 Amarela e, opcionalmente, a um lado (Cima/Baixo) — respeitando os limites da seção 2 (4 por lado por equipe, 8 por equipe, 16 por partida). Lado é sempre opcional.
- **Entrada durante a partida**: adicionar participante não gera lançamento nenhum (seção 3).
- **Saída durante a partida**: participante sai, mantém o status financeiro atual, fica de fora da verificação de mínimo e da divisão de vitória/derrota quando a partida fechar (seção 3).
- **Indicativo de consumação mínima**: para cada cliente ativo na partida, mostrar "faltam R$ X para o mínimo" quando aplicável (`calcularIndicativoConsumacao`, já implementada) — não é lançamento, só exibição.
- **Concluir partida**: dono informa a equipe vencedora (sem empate). O sistema gera, para os participantes **ativos** no momento do fechamento:
  - `Débito partida` (cobrança de derrota) = `valor_partida_por_cliente`, um por perdedor ativo.
  - `Crédito partida` (crédito de vitória) = crédito total ÷ vencedores ativos, dividido entre os vencedores ativos (`calcularCreditoVitoria`, já implementada — falta só a orquestração que gera e persiste os lançamentos).
  - Se `valor_partida_por_cliente` for R$ 0, nenhum lançamento de crédito/débito é gerado (seção 12).
- **Histórico de partidas**: lista das partidas já concluídas (data, equipe vencedora, participantes ativos, valor por cliente), visível na própria aba Partida (adicionado na tarefa 08, depois da entrega inicial). Cada linha expande e mostra os participantes ativos agrupados por equipe.
- **Reaproveitar participantes**: a partir de uma partida do histórico, criar uma nova partida com os mesmos clientes, repetindo equipe e lado exatos — usando os valores da configuração padrão atual, não os da partida antiga. Clientes que hoje estão ausentes são ignorados na cópia (tarefa 08).
- **Limpar histórico**: apaga os registros de partidas concluídas da lista (com confirmação via `AlertDialog`). Não afeta os lançamentos financeiros já gerados — o saldo dos clientes permanece intacto (tarefa 08).
- **Inverter equipes**: na partida ativa, troca todo mundo de time de uma vez (quem está no Azul vai para o Amarela e vice-versa), preservando o lado de cada um (tarefa 09).

## Fora de escopo

- Conjunto de partidas e acerto financeiro consolidado — feature 04 (Acerto).
- Lançamento de consumo durante a partida — feature 03 (Consumo), embora o indicativo de mínimo já leve em conta os lançamentos de consumo existentes.
- Pontuação, rodadas, quantidade de bochas, quem começa — fora de escopo do produto inteiro (seção 15).

## Referências

- `docs/regras.md` — seções 2 (estrutura das equipes), 3 (entrada/saída), 3.1 (presença), 4 (início), 5 (resultado), 6 (regra financeira), 7 (consumação mínima e crédito de vitória), 8 (pagamento dos perdedores), 9 (exemplo com equipes de tamanhos diferentes), 14.1 (Aba Partida).
- `docs/arquitetura.md` — seção 5 (diretrizes de UI/UX: `Sheet` para montar a partida, `AlertDialog` para confirmar o fechamento).
