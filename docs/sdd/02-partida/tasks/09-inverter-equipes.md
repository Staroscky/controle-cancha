# 09 — Inverter equipes

**Status:** ✅ Concluído

Adição pós-entrega: botão para trocar de time todo mundo que está na partida ativa de uma vez — quem está no 🔵 Azul vai para o 🟡 Amarela e vice-versa. Útil quando os clientes decidem trocar de lado do "campeonato" no meio da sessão sem precisar remover e readicionar cada participante manualmente.

- `data/participacoesRepo.ts` ganhou `inverterEquipesDaPartida(partidaId)`: percorre todas as participações daquela partida (ativas e que já saíram, sem distinção — é só uma troca de rótulo, não afeta cálculo nenhum) e troca `equipeId` de `azul` para `amarela` e vice-versa.
- **O lado (Cima/Baixo) de cada participação não muda** — só a equipe. Faz sentido porque o lado é posição física na cancha, independente de qual time joga ali.
- `ui/hooks/usePartidaAtiva.ts` ganhou `inverterEquipes()`.
- Botão "Inverter equipes" (ícone `ArrowLeftRight`) no cabeçalho de `MontagemEquipes`, ao lado de "Adicionar participante". Desabilitado quando não há nenhum participante ativo. Sem `AlertDialog` de confirmação — é uma troca não destrutiva e reversível (clicar de novo desfaz), então `Toast` de feedback ("Equipes invertidas.") é suficiente, seguindo a tabela da seção 5 de `arquitetura.md`.

Testado manualmente: com participantes em ambos os lados (Cima/Baixo) nas duas equipes, invertido e conferido que cada cliente trocou de equipe mantendo o mesmo lado.
