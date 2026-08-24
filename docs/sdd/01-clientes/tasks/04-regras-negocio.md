# 04 — Regras de negócio

**Status:** ✅ Concluído

Uma função por arquivo em `domain/rules/`, todas puras (sem I/O):

- `normalizarNomeCliente` — trim + colapso de espaços (depois estendida na tarefa de convenção de nome, ver `07-convencao-nome-cliente.md`)
- `calcularSaldo` — soma de todos os lançamentos de um cliente
- `calcularConsumoRealNaPartida` — soma em módulo dos lançamentos de tipo Consumo de um cliente numa partida
- `calcularIndicativoConsumacao` — usa `calcularConsumoRealNaPartida`; retorna o valor faltante para o mínimo, ou 0 se já atingido (seção 7 de `regras.md`)
- `calcularCreditoVitoria` — fórmula da seção 7: crédito total (perdedores × valor por cliente) dividido pelos vencedores ativos

Critério de pronto: funções implementadas e usadas pela camada `ui` (tarefa 06) sem a `ui` acessar `localStorage` diretamente.
