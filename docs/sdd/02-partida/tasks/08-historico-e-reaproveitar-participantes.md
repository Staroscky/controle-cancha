# 08 — Histórico de partidas e reaproveitar participantes

**Status:** ✅ Concluído

Adição pós-entrega, pedida depois que a feature já estava marcada concluída: a aba Partida também deveria mostrar um histórico das partidas já encerradas, e permitir criar uma nova partida reaproveitando os participantes de uma partida do histórico (comum quando o mesmo grupo joga várias partidas seguidas).

- `ui/hooks/usePartidaAtiva.ts` ganhou `historico` (partidas com `status: 'concluida'`, mais recente primeiro) e `criarComParticipantes(partidaOrigemId)`.
- `criarComParticipantes`:
  - Usa a **configuração padrão atual** para os valores da nova partida (não copia os valores da partida de origem — evita reaplicar um valor antigo sem o dono perceber).
  - Repete **equipe e lado exatos** de cada participação que estava `ativo` na partida de origem (decisão confirmada com o usuário).
  - Cliente que hoje está `presente: false` é **ignorado silenciosamente** na cópia (regra da seção 3.1 — só presentes entram em partida); a UI informa quantos foram ignorados no toast.
  - Não cria a partida se nenhum participante da origem estiver presente hoje.
- `ui/components/HistoricoPartidas.tsx` — lista as partidas concluídas (data, equipe vencedora, quantidade de participantes ativos, valor por cliente) com um botão "Nova partida com estes participantes" por linha. O botão fica desabilitado enquanto já existe uma partida em andamento (mesma regra de "só uma partida ativa por vez" que já valia para o botão "Nova partida").

**Segunda rodada de ajustes, pedida logo em seguida:**

- Cada linha do histórico expande (clique no texto/chevron) mostrando os participantes ativos daquela partida, agrupados por equipe — igual ao layout de `MontagemEquipes`, mas somente leitura. Implementado com `useState` local (`expandidaId`) em vez de um componente `Accordion`/`Collapsible` novo, já que não havia nenhum primitive desse tipo instalado e é só um toggle simples.
- Botão "Limpar histórico" no cabeçalho da seção, atrás de `AlertDialog` (ação destrutiva, seção 5 de `arquitetura.md`) com `AlertDialogAction variant="destructive"`. `data/partidasRepo.ts` ganhou `limparHistoricoPartidas()`, que remove só os registros de partida com `status: 'concluida'` — os lançamentos financeiros (créditos/débitos já gerados) **não são apagados**, o saldo dos clientes continua intacto. O diálogo de confirmação deixa isso explícito para o dono não confundir com "estornar cobranças".

Testado manualmente: reaproveitar participantes com equipe/lado preservados, toast com contagem de ignorados por ausência, botão desabilitado com partida ativa, criação bloqueada quando todos os participantes da origem estão ausentes, expandir/recolher uma linha do histórico mostrando os nomes corretos por equipe, limpar histórico com confirmação e conferir que os saldos dos clientes na aba Clientes não mudam.
