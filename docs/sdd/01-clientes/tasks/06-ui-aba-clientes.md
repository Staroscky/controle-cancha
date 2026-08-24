# 06 — UI: aba Clientes

**Status:** ✅ Concluído

- `App.tsx`: shell com `Tabs` do shadcn (Clientes / Partida / Consumo / Acerto) e `Toaster` montado uma vez.
- `ui/hooks/useClientes.ts`: encapsula `clientesRepo`, expõe `clientes`, `cadastrar`, `definirPresenca`, recarregando o estado local após cada mutação (LocalStorage não é reativo por si só).
- `ui/pages/ClientesPage.tsx`: lista de clientes com badge Presente/Ausente e saldo (via `calcularSaldo`); cadastro em `Sheet` (conforme tabela de UI/UX da seção 5 de `arquitetura.md` — formulário usa `Sheet`, feedback usa `Toast`).
- `PartidaPage`, `ConsumoPage`, `AcertoPage`: placeholders "em desenvolvimento", substituídos nas features seguintes.

Critério de pronto: testado manualmente no navegador — cadastro, marcar presença/saída, saldo exibido, persistência após reload, sem erros no console.
