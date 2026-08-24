# SDD — Spec-Driven Development

Cada feature do produto é executada como uma pasta numerada aqui dentro, na **ordem de execução** (`01-`, `02-`, `03-`...). Isso mantém o histórico de decisão de cada parte do sistema junto do código, sem depender só de commits soltos.

`docs/arquitetura.md` e `docs/regras.md` continuam sendo a fonte da verdade para **como o sistema é construído** e **quais são as regras de negócio**. As pastas aqui em `sdd/` são o **plano e o registro de execução** de cada feature — elas referenciam as seções desses dois documentos em vez de duplicá-las.

## Estrutura de cada feature

```text
NN-nome-da-feature/
├── spec.md              # o que a feature entrega, escopo, fora de escopo, seções de regras.md/arquitetura.md relevantes
├── tasks/                # quebra da implementação em tarefas, numeradas na ordem em que devem ser executadas
│   ├── 01-....md
│   ├── 02-....md
│   └── ...
└── verificacao-final.md # checklist a rodar antes de marcar a feature como concluída
```

- **`spec.md`** começa com um cabeçalho `Status: Planejado | Em andamento | Concluído`. Só é atualizado para `Concluído` depois que `verificacao-final.md` estiver todo marcado.
- **`tasks/`** é a lista de trabalho — cada arquivo é uma unidade pequena e concreta (ideia: uma tarefa gera um commit ou um conjunto pequeno de arquivos). Tarefas de uma feature já concluída ficam registradas como documentação do que foi feito, não são apagadas depois.
- **`verificacao-final.md`** é sempre a mesma espinha dorsal (build, testes, teste manual, docs em dia) mais os itens específicos da feature. Nenhuma feature é considerada pronta sem passar por ela.

## Roadmap

| # | Feature | Status | Referência em `regras.md` |
|---|---|---|---|
| [01](01-clientes/spec.md) | Clientes | ✅ Concluído | seção 3.1, 12, 14.1 (Aba Clientes) |
| [02](02-partida/spec.md) | Partida | 📝 Planejado | seções 2–9, 14.1 (Aba Partida) |
| 03 | Consumo | ⏳ Ainda não especificado | seção 10, 14.1 (Aba Consumo) |
| 04 | Acerto | ⏳ Ainda não especificado | seções 11, 11.1, 13, 14.1 (Aba Acerto) |

As features 03 e 04 ganham sua própria pasta com `spec.md` e `tasks/` quando a 02 estiver concluída — especificar muito à frente tende a ficar desatualizado antes de virar código.
