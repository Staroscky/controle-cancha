# 05 — Camada data

**Status:** ✅ Concluído

`storage.ts` com `getItem`/`setItem` genéricos sobre `localStorage` (JSON.stringify/parse com fallback seguro), e um repositório por tabela que usa esse genérico:

- `clientesRepo` — `listarClientes`, `buscarClientePorId`, `adicionarCliente` (valida nome único via `normalizarNomeCliente`), `definirPresencaCliente`
- `partidasRepo`, `participacoesRepo`, `lancamentosRepo` — CRUD mínimo necessário, ainda não consumidos pela UI (entram na feature 02)
- `itensConsumoRepo`, `configuracaoRepo` — idem, entram nas features 02/03

Critério de pronto: cada repo é um módulo concreto sem interface/porta formal (seção 3 de `arquitetura.md` — sem abstração para cenário futuro hipotético).
