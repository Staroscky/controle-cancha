# 01 — Clientes

**Status:** ✅ Concluído

## Objetivo

Estabelecer a base técnica do projeto (stack, arquitetura em camadas) e entregar a primeira fatia funcional de ponta a ponta: a aba **Clientes**, provando que `domain` → `data` → `ui` funciona como desenhado em `docs/arquitetura.md`.

## Escopo entregue

- Scaffold do projeto: Vite + React + TypeScript, Tailwind CSS v4, shadcn/ui (Radix, preset Nova), `vite-plugin-pwa` (offline).
- Estrutura de pastas `src/domain`, `src/data`, `src/ui` (seção 2 de `arquitetura.md`).
- Tipos de domínio das 8 entidades do modelo de dados (seção 12 de `regras.md`).
- Regras de negócio puras em `domain/rules`: `normalizarNomeCliente`, `calcularSaldo`, `calcularConsumoRealNaPartida`, `calcularIndicativoConsumacao`, `calcularCreditoVitoria`.
- Camada `data`: `storage.ts` genérico sobre LocalStorage + repositórios (`clientesRepo`, `partidasRepo`, `participacoesRepo`, `lancamentosRepo`, `itensConsumoRepo`, `configuracaoRepo`).
- Shell da UI com as 4 abas (Tabs do shadcn); aba **Clientes** funcional: cadastro via `Sheet`, feedback via `Toast` (sonner), marcar presença/saída, saldo exibido por cliente.
- Convenção de capitalização de nome de cliente (preposições `da`/`de`/`do`/`das`/`dos` em minúsculo — seção "nome do cliente único e normalizado" de `regras.md`).
- Testes unitários (Vitest) para todo `domain/rules`, em `tests/` na raiz do projeto (fora de `src/`).

## Fora de escopo

- Abas Partida, Consumo e Acerto — ficam para as features [02](../02-partida/spec.md), 03 e 04.
- Edição da configuração padrão (`configuracao_padrao`) pela UI — o repositório existe, mas ainda não há tela; entra como pré-requisito da feature 02.

## Referências

- `docs/arquitetura.md` — todas as seções (stack, camadas, princípio de simplicidade, UI/UX, e a seção 2.1 de testes, adicionada durante esta feature).
- `docs/regras.md` — seção 3.1 (presença no estabelecimento), seção 12 (modelo de dados e nome normalizado), seção 14.1 (Aba Clientes).
