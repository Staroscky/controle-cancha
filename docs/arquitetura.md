# Arquitetura do Projeto

Este documento registra as decisões técnicas do projeto — stack, organização de pastas e diretrizes de UI/UX. Deve ser consultado antes de iniciar a implementação e sempre que uma nova tela/interação for desenhada. As regras de negócio ficam em `docs/regras.md`; aqui só entra **como** o sistema é construído.

---

## 1. Stack tecnológica

- **Vite + React + TypeScript** — sem framework de servidor (Next etc.), pois o app é 100% client-side, sem backend.
- **Tailwind CSS** — estilização utilitária.
- **shadcn/ui** (CLI v4, pacote `shadcn`) — componentes de UI, instalados via `npx shadcn@latest`.
- **vite-plugin-pwa** — transforma o app em PWA instalável, com service worker para funcionar **offline** após a primeira visita (uso previsto: notebook do estabelecimento, sem depender de internet no dia a dia).
- **LocalStorage** — persistência dos dados (ver seção 14 de `regras.md`). Sem backend, sem banco de dados remoto.

---

## 2. Camadas do projeto

O código é dividido em 3 camadas, com uma regra de dependência de mão única: `ui` → `data`/`domain`, nunca o contrário.

```text
src/
├── domain/          # tipos + regras de negócio puras (sem I/O, sem framework)
│   ├── types/          # Cliente, Partida, Participacao, Lancamento...
│   └── rules/           # calcularSaldo, calcularCreditoVitoria,
│                        # calcularIndicativoConsumacao (seção 7 de regras.md)
│
├── data/            # leitura/escrita dos dados — hoje sobre LocalStorage
│   ├── clientesRepo.ts
│   ├── partidasRepo.ts
│   ├── participacoesRepo.ts
│   ├── lancamentosRepo.ts
│   └── storage.ts      # get/set genérico do localStorage, usado pelos repos acima
│
└── ui/              # React + shadcn — só importa de data/ e domain/
    ├── pages/           # uma por aba (Clientes, Partida, Consumo, Acerto)
    ├── components/       # componentes pequenos, organizados por tela/domínio
    └── hooks/
```

- `domain/` não conhece `localStorage` nem React — é a lógica de negócio pura, testável isolada.
- `data/` não decide regra de negócio — só guarda/recupera dados. As contas (crédito de vitória, saldo etc.) vêm de `domain/rules`.
- `ui/` nunca chama `localStorage` diretamente, só as funções de `data/`.

---

## 3. Princípio de simplicidade (sem abstrações desnecessárias)

Decisão deliberada: **sem** camada de interfaces/ports formais, **sem** adapters, **sem** container de injeção de dependência. As 3 camadas acima são módulos concretos que se importam diretamente.

A separação entre `data/` e `domain/`/`ui/` já é suficiente para permitir evolução futura (ex.: transformar em app web com backend real): quando isso acontecer, reescreve-se o *conteúdo* das funções de `data/` para chamar uma API em vez do `localStorage`, mantendo o mesmo nome de função, mesma assinatura, mesmo retorno. Como TypeScript é estruturalmente tipado, o resto do código (domain e ui) não precisa de nenhum contrato formal declarado para continuar funcionando — só a assinatura precisa bater.

Preferir sempre a solução mais simples que resolve o problema atual, evitando abstrações para cenários hipotéticos futuros.

---

## 4. Convenção de tamanho de arquivo

Arquivos pequenos, um assunto por arquivo:

- Um arquivo por entidade em `domain/types/`.
- Uma função de cálculo por arquivo em `domain/rules/`.
- Um repositório por tabela em `data/`.
- Um componente por arquivo em `ui/components/`; se uma página tem várias seções visuais, cada seção vira um componente filho e a `page` só monta o layout.

---

## 5. Diretrizes de UI/UX (consultar sempre ao desenhar uma tela)

**Nunca usar os diálogos nativos do navegador** — `alert()`, `confirm()`, `prompt()`. Eles bloqueiam a thread, não podem ser estilizados e destoam de um app com shadcn. Toda comunicação com o usuário usa os componentes do shadcn/ui:

| Situação | Componente shadcn |
|---|---|
| Confirmação de ação destrutiva ou importante (ex.: excluir cliente, finalizar partida, registrar pagamento) | `AlertDialog` |
| Formulário ou fluxo que precisa de mais espaço sem sair da tela atual (ex.: cadastrar cliente, lançar consumo, montar partida) | `Sheet` (drawer lateral) |
| Feedback rápido de uma ação concluída (ex.: "Pagamento registrado", "Cliente cadastrado", erro de validação) | `Toast` (via `sonner`, integrado ao shadcn) |
| Conteúdo informativo pontual (ex.: ver extrato de um cliente, detalhe de uma partida) | `Dialog` |

Essa tabela é o ponto de partida — qualquer nova interação deve ser mapeada para um desses componentes (ou justificar a exceção) antes de implementar.
