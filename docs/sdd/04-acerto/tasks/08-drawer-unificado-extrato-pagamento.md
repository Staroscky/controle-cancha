# 08 — Drawer único: extrato + pagamento

Terceira rodada da feature (depois de 01-06 e do redesenho 07), pedida pelo dono depois de usar a versão em accordion: ele quer abrir a comanda (cliente ou grupo) num drawer só, com o extrato sempre visível em cima e a ação de fechar conta fixa embaixo, em vez de expandir a linha na própria lista e abrir extrato/pagamento como overlays separados.

## Mudanças

- **Lista de Presentes deixa de expandir em linha**: cada bloco (`ComandaBloco`) passa a ser só uma linha clicável — nome(s) do cliente/grupo, sem saldo visível (mantém a regra de privacidade da seção 14.1: saldo só aparece depois de abrir a comanda). Clicar abre um novo componente `ComandaDrawer` (`Sheet`) com aquele cliente/grupo carregado. Isso substitui o estado `expandidoId` por "qual comanda está aberta no drawer" — mesma regra de só uma comanda visível por vez, agora garantida pelo próprio `Sheet` (abrir outro fecha o anterior).
- **Abas internas só quando é grupo com mais de um membro**: dentro do `ComandaDrawer`, uma `Tabs` (shadcn) com aba **"Geral"** (padrão, primeira) + uma aba por membro (nome do cliente). Cliente sem grupo não tem abas — o drawer mostra o conteúdo direto.
- **Conteúdo de cada aba = extrato em cima, fechamento fixo embaixo**:
  - **Aba "Geral"** (grupo): topo lista **todos** os membros (devedores e em dia) com o saldo individual de cada um — vermelho quando negativo, verde quando ≥ 0 (mesma cor da Aba Clientes/extrato individual); quem deve ainda mostra "paga X / fica devendo Y" com base no valor digitado no rodapé. Rodapé fixo com campo de valor (sugerido = soma das dívidas do grupo, editável) e botão **"Fechar grupo"**. Confirmar aciona a mesma regra de alocação já existente (`alocarPagamentoGrupo` + `prepararLancamentosPagamentoGrupo`), sem mudança de domínio.
  - **Correção pós-implementação**: a primeira versão só listava devedores na aba "Geral" (em dia viravam uma linha de texto "Já em dia: ...") e usava, tanto ali quanto no "Saldo atual" do extrato, a cor neutra que `ExtratoClienteDialog` já usava para débito (só o crédito ganhava verde). O dono pediu para manter a mesma lógica de cor que a Aba Clientes sempre teve (saldo negativo em vermelho); corrigido introduzindo `corDoSaldo` (vermelho/verde por sinal) separado de `corDoValor`/`corDoIcone` (que seguem regendo só as linhas de lançamento individuais do extrato, não os saldos-resumo).
  - **Aba de um membro** (dentro de grupo, ou cliente sem grupo): topo = extrato individual completo, mesma ordem/ícones/cores de hoje (`ExtratoClienteDialog`); rodapé fixo com campo de valor (sugerido = saldo devedor em módulo, editável para pagamento parcial) e botão **"Fechar de [nome]"**. Confirmar gera o lançamento de `Pagamento` individual (mesma regra da seção 11.1).
- **Botão do rodapé é contextual e único**: nunca aparecem "Fechar grupo" e "Fechar individual" ao mesmo tempo — o rótulo e a ação trocam conforme a aba ativa (Geral → grupo; aba de um membro → só aquela pessoa).
- **Botão de fechar só aparece quando há saldo devedor** na aba ativa — mesma regra atual (cliente/grupo em crédito ou zerado não mostra ação de pagamento).
- **Sugestão de marcar saída** continua igual: toast com ação de um clique depois de confirmar o pagamento (individual ou de grupo), dentro do próprio fluxo do drawer.

## Componentes afetados

- `ComandaBloco.tsx` — perde o accordion (`expandido`/`ChevronDown`) e os triggers próprios de `ExtratoClienteDialog`/`RegistrarPagamentoSheet`/`RegistrarPagamentoGrupoSheet`; vira só a linha clicável que abre o `ComandaDrawer` com o bloco selecionado.
- `ComandaDrawer.tsx` (novo) — `Sheet` que recebe o bloco (cliente ou grupo) selecionado; monta as abas quando aplicável e renderiza extrato + rodapé de fechamento por aba.
- `ExtratoClienteDialog.tsx`, `RegistrarPagamentoSheet.tsx`, `RegistrarPagamentoGrupoSheet.tsx` — deixam de ser componentes com `Sheet`/`Dialog` e trigger próprios; seu conteúdo (lista de lançamentos, campo de valor sugerido, revisão de alocação em grupo) é reaproveitado como pedaços internos do `ComandaDrawer` em vez de overlays independentes.
- `ComandasPage.tsx` — troca o estado `expandidoId` (uma linha expandida por vez) pelo estado "comanda aberta no drawer" (qual bloco, e se grupo, qual aba ativa).

## Fora desta rodada

- Nenhuma mudança de domínio ou regra de cálculo: `alocarPagamentoGrupo`, `prepararLancamentosPagamentoGrupo`, `prepararLancamentoPagamento` continuam iguais — é reorganização de UI.
- Continua sem saldo de grupo como conceito de domínio (aba "Geral" é só uma revisão de UI, mesma ressalva do `spec.md`).
- Continua sem editar/excluir pagamento já registrado.
