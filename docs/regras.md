# Controle de Partidas de Bocha

## 1. Objetivo

Criar um controle simples para partidas de bocha, permitindo registrar participantes, equipes, lados, resultado da partida e a lógica de consumação.

A aplicação será local e utilizará **LocalStorage** para persistência dos dados.

O sistema **não controlará a pontuação da bocha**. Os clientes informarão manualmente o vencedor ao final da partida.

---

## 2. Estrutura das equipes

Existem duas equipes, cadastradas na tabela `equipes` (seção 12):

- 🔵 Azul
- 🟡 Amarela

Cada equipe pode ter até **8 clientes**.

A cancha é dividida em dois lados:

- **Cima**
- **Baixo**

A definição do lado é **opcional**. Não é obrigatório informar quem está no lado de cima ou de baixo.

Quando o lado for informado, cada lado pode ter até:

- 4 clientes da equipe Azul
- 4 clientes da equipe Amarela

Portanto:

- Máximo de 8 clientes por equipe.
- Máximo de 16 clientes por partida.
- O lado pode ficar não definido para um cliente.

### Exemplo

```text
                 CIMA
        ┌─────────────────────┐
        │ 🔵 Azul    4        │
        │ 🟡 Amarela 4        │
        └─────────────────────┘

                BAIXO
        ┌─────────────────────┐
        │ 🔵 Azul    4        │
        │ 🟡 Amarela 4        │
        └─────────────────────┘
```

---

## 3. Entrada e saída de clientes

Clientes podem:

- Entrar antes ou durante a partida.
- Sair durante a partida.
- Sair após a conclusão da partida.
- Trocar de lado, caso essa seja uma regra adotada pelos clientes.

A entrada e a saída devem ser registradas na participação do cliente.

### Entrada

Ao entrar em uma partida, o cliente apenas passa a fazer parte da participação. **Nenhum lançamento financeiro é gerado nesse momento** — ele ainda não consumiu nada, então não existe débito de consumação na entrada.

A verificação da consumação mínima só acontece no fechamento da partida, comparando o que o cliente realmente consumiu com o valor mínimo configurado (ver seção 7).

Exemplo:

```text
Consumação mínima configurada = R$ 6,00

Cliente que entra:
Nenhum lançamento gerado
```

### Saída

Ao sair, o cliente mantém o **status financeiro atual** e fica desvinculado da partida.

Se sair antes da conclusão e sua equipe perder posteriormente, ele **não será considerado perdedor e não receberá a cobrança da derrota**.

Exemplo:

```text
João entra:
Nenhum lançamento gerado

João consome R$ 4 no bar:
Lançamento de consumo = -R$ 4

João sai antes do fechamento da partida:
Sua equipe perde depois.
João não recebe cobrança de derrota nem verificação de consumação mínima,
pois não estava mais ativo no fechamento da partida.
```

A quantidade de clientes ativos de cada equipe influencia diretamente no cálculo quando a partida termina.

---

## 3.1. Presença do cliente no estabelecimento

Além da participação em uma partida específica (seção 3), existe um controle mais simples: **o cliente está ou não está no estabelecimento agora**.

- Cada cliente tem um campo `presente` (sim/não), controlado manualmente pelo dono ao registrar a chegada ou a saída.
- É um **flag simples**, sem histórico de horários de entrada/saída — cada marcação apenas sobrescreve o estado atual.
- É um conceito diferente da participação em partida: um cliente pode estar presente e não estar jogando nenhuma partida (só consumindo), e pode sair de uma partida sem sair do estabelecimento.
- Um cliente só pode ser adicionado a uma partida (seção 2) ou entrar no rateio de um consumo (seção 10) se estiver marcado como presente.
- **Sair do estabelecimento não exige saldo zerado.** O cliente pode sair com saldo pendente; o saldo continua registrado normalmente e pode ser acertado depois (seção 11), inclusive com o cliente já ausente.
- Registrar um pagamento (seção 11.1) não marca o cliente como "saiu" automaticamente — o sistema apenas **sugere** essa ação, e o dono decide.

---

## 4. Início da partida

A definição de quem começa a partida é feita pelos próprios clientes.

Essa informação não precisa ser controlada pelo sistema.

---

## 5. Resultado da partida

A partida é disputada normalmente até que os clientes determinem o vencedor.

O sistema não controla:

- Pontuação.
- Rodadas.
- Quantidade de bochas.
- Quem inicia cada jogada.
- Regras esportivas detalhadas.

Ao terminar a partida, os clientes informam:

- 🔵 Azul venceu; ou
- 🟡 Amarela venceu.

Não existe empate.

---

# 6. Regra financeira

A configuração de uma partida tem **exatamente dois valores**:

- **Valor de consumo mínimo** — usado só para calcular o indicativo da seção 7. Pode ser **R$ 0** (nesse caso nenhum indicativo é exibido).
- **Valor da partida por cliente** — usado para gerar `cobrança de derrota` / `crédito de vitória`. Pode ser **R$ 0** (nesse caso o resultado da partida não gera nenhum lançamento financeiro, só o registro de quem venceu).

Ambos têm um **valor padrão**, configurado uma vez no sistema (ou no conjunto de partidas), que é usado para pré-preencher uma nova partida. Esse padrão pode ser sobrescrito por partida — e os valores efetivamente usados ficam sempre armazenados na própria partida, para preservar o histórico mesmo que o padrão mude depois.

Exemplo padrão:

```text
Consumo mínimo = R$ 6,00
Valor da partida por cliente = R$ 6,00
```

Outra partida pode utilizar (sobrescrevendo o padrão):

```text
Consumo mínimo = R$ 10,00
Valor da partida por cliente = R$ 5,00
```

Ou até zerar os dois, se os clientes só quiserem jogar sem regra financeira nenhuma:

```text
Consumo mínimo = R$ 0,00
Valor da partida por cliente = R$ 0,00
```

---

## 7. Consumação mínima (indicador calculado) e crédito dos vencedores

Regra simples, em duas partes independentes:

**Parte 1 — Consumação mínima é só um indicador calculado, não é armazenado**

O cliente consome livremente durante a partida (bebidas, comida etc.), e cada compra gera um lançamento de `consumo` real (seção 10) — isso não tem relação com vitória ou derrota, e é o único lançamento financeiro ligado ao consumo.

Não existe nenhuma estrutura nova para guardar isso. O mínimo é **acumulado entre todas as partidas em que o cliente participou** (não só a partida atual) — se um cliente jogou 3 partidas com mínimo de R$ 5 cada, o mínimo total exigido dele é R$ 15. A cada momento (na tela de montagem da partida), o sistema simplesmente calcula:

```text
minimoAcumulado = soma do valor mínimo configurado de cada partida em que o cliente participou
consumoAcumulado = soma dos lançamentos de consumo do cliente vinculados a essas mesmas partidas
faltante = minimoAcumulado - consumoAcumulado

Se faltante > 0:
    mostra um indicativo visual (ex.: "faltam R$ X para o mínimo")
Se faltante <= 0:
    não mostra nada (mínimo já atingido)
```

É só uma conta feita na hora de exibir, para o dono do estabelecimento saber quem ainda não bateu o mínimo acumulado. Não afeta o saldo do cliente, não é persistido, e pode ser ignorado. Consumo avulso (fora de partida, `partida_id` nulo) não entra nessa conta — só o consumo vinculado às partidas em que o cliente participou.

**Parte 2 — Crédito de vitória (vem do perdedor, sempre referenciando a partida)**

1. Cada perdedor ativo gera um lançamento fixo de `cobrança de derrota` (`valor da partida por cliente`).
2. Esses valores são somados, formando o **crédito total da partida**.
3. Esse crédito é dividido igualmente entre os vencedores ativos e lançado como `crédito de vitória`.

### Fórmula

```text
Crédito total da partida =
quantidade de perdedores ativos × valor da partida por cliente

Crédito de cada vencedor =
Crédito total da partida ÷ quantidade de vencedores ativos
```

### Lançamento financeiro gerado (registro em `lancamentos_financeiros`)

```text
lancamentos_financeiros
├── cliente_id     → referência ao cliente
├── partida_id     → referência obrigatória à partida de origem
├── tipo_id        → Consumo | Crédito partida | Débito partida
├── valor          → positivo (crédito) ou negativo (débito)
└── descricao      → nome do item consumido (ex.: "Cerveja", "1/3 Cerveja")
                      ou o motivo do crédito/débito (ex.: "Crédito de vitória")
```

O saldo de cada cliente é sempre a soma desses lançamentos financeiros — o indicativo de consumação mínima é apenas visual, calculado na hora, e nunca entra nessa soma.

### Exemplo — perdedor que consumiu abaixo do mínimo

```text
Mínimo acumulado = R$ 6      |  Consumo acumulado = R$ 2
→ Indicativo na tela de partida: "faltam R$ 4 para o mínimo" (não afeta o saldo)
Cobrança de derrota = -R$ 6
------------------------------------------------
Saldo financeiro gerado pela partida: -R$ 6
```

### Exemplo — vencedor que consumiu acima do mínimo

```text
Mínimo = R$ 6      |  Consumo real = R$ 9
→ Nenhum indicativo (consumo já superou o mínimo)
Crédito de vitória = +R$ 6 (numa partida 4×4, ver fórmula acima)
------------------------------------------------
Saldo financeiro gerado pela partida: +R$ 6
```

---

## 8. Pagamento dos perdedores

Cada cliente perdedor ativo gera **um único lançamento financeiro**, vinculado ao id da partida:

- `cobrança de derrota` → valor = `valor da partida por cliente`.

Além disso, se o consumo acumulado dele (seção 7) ficou abaixo do mínimo acumulado, isso aparece como um **indicativo calculado na hora** — mas isso não é um lançamento financeiro e não afeta o saldo do cliente.

### Exemplo: 4 × 4

```text
Cobrança de derrota = -R$ 6
```

Se esse cliente também consumiu abaixo do mínimo, o indicativo aparece na tela — o saldo financeiro dele continua sendo apenas -R$ 6 pela derrota.

---

## 9. Exemplo com equipes de tamanhos diferentes

### 8 vencedores × 4 perdedores

A equipe Azul possui 8 clientes e vence.

A equipe Amarela possui 4 clientes e perde.

Os perdedores geram (cobrança de derrota):

```text
4 × R$ 6 = R$ 24
```

Esse valor é dividido entre os 8 vencedores (crédito de vitória):

```text
R$ 24 ÷ 8 = R$ 3 por vencedor
```

Saldo financeiro de cada vencedor:

```text
+R$ 3 (crédito de vitória)
```

Saldo financeiro de cada perdedor:

```text
-R$ 6 (cobrança de derrota)
```

Independentemente de vitória ou derrota, qualquer cliente cujo consumo acumulado ficou abaixo do mínimo acumulado (seção 7) mostra um **indicativo calculado na hora** — sem impacto nesses valores de saldo.

---

## 10. Registro de consumo (com divisão entre clientes)

### Catálogo de itens (opcional, para agilizar)

O dono pode cadastrar previamente os itens mais comuns numa tabela `itens_consumo` (nome + valor), tipo uma planilha de preços — assim, na hora de lançar, ele só seleciona o item da lista em vez de digitar tudo de novo. Também dá pra lançar um item avulso (digitando descrição e valor na hora) para o que não está cadastrado.

Itens do catálogo podem ser editados (nome e valor, já que os preços mudam com o tempo) ou removidos a qualquer momento. Editar ou remover um item do catálogo não altera lançamentos de consumo já feitos com ele — a descrição e o valor de cada lançamento são gravados no momento do lançamento, independentes do cadastro.

```text
itens_consumo
├── id
├── nome     → ex.: "Cerveja"
└── valor    → ex.: R$ 6,00 (valor sugerido, pode ser ajustado no lançamento)
```

### Lançando o consumo

Ao registrar um item consumido, o dono do estabelecimento:

1. Escolhe o item do catálogo (ou digita descrição + valor na hora, se for avulso).
2. Seleciona **quais clientes** estão dividindo aquele item.

O sistema gera um lançamento em `lancamentos_financeiros` **por cliente selecionado**:

```text
Se apenas 1 cliente for selecionado:
    tipo_id = Consumo
    descricao = "<item>"
    valor = -valor total

Se X clientes forem selecionados (X > 1):
    tipo_id = Consumo
    descricao = "1/X <item>"
    valor = -(valor total ÷ X)
```

### Consumo sem partida ativa

Um cliente pode finalizar as partidas do dia e continuar no estabelecimento só consumindo. Nesse caso, o lançamento de consumo é feito **sem `partida_id`** (fica vinculado só ao cliente). Se o cliente ainda estiver participando de alguma partida no momento do lançamento, o `partida_id` é preenchido normalmente, para que aquele consumo conte na verificação do mínimo daquela partida (seção 7).

### Exemplo — 1 cliente, durante uma partida

```text
Item: Cerveja, R$ 6,00
Selecionado: João (ativo na partida #12)

→ lançamento: cliente=João, partida_id=12, tipo=Consumo, valor=-R$ 6,00, descricao="Cerveja"
```

### Exemplo — 3 clientes dividindo

```text
Item: Cerveja, R$ 6,00
Selecionados: João, Maria, Pedro (todos ativos na partida #12)

→ 3 lançamentos, cada um:
   partida_id = 12
   tipo = Consumo
   valor = -R$ 2,00
   descricao = "1/3 Cerveja"
```

### Exemplo — cliente que já terminou de jogar

```text
Item: Refrigerante, R$ 5,00
Selecionado: João (já finalizou todas as partidas do dia)

→ lançamento: cliente=João, partida_id=null, tipo=Consumo, valor=-R$ 5,00, descricao="Refrigerante"
```

É esse consumo real (soma de todos os lançamentos de consumo do cliente vinculados a uma partida) que entra na soma do consumo acumulado usada pelo indicativo da seção 7 — o mínimo comparado é a soma dos mínimos de todas as partidas em que o cliente participou, não só o mínimo desta partida isolada.

Exemplo:

```text
João
Equipe: Azul
Participou de 2 partidas hoje, mínimo R$ 6,00 cada → mínimo acumulado R$ 12,00
Consumo real somado nas duas partidas: R$ 15,00
→ Consumo acumulado já superou o mínimo acumulado, nenhum indicativo exibido.
```

O sistema deve permitir identificar quanto cada cliente:

- Consumiu de fato (em partidas e fora delas).
- Deve pagar (consumo + eventual cobrança de derrota).
- Recebeu da partida (crédito de vitória, se vencedor).
- Ainda possui de saldo acumulado.

---

## 11. Várias partidas e acerto no final

Os clientes normalmente podem disputar **mais de uma partida antes de acertar a conta**.

Cada partida deve gerar um lançamento financeiro individual para cada participante, mas o pagamento não precisa ocorrer imediatamente.

O saldo do cliente deve ser acumulado entre as partidas.

### Exemplo

João participa de três partidas:

```text
Partida 1: -R$ 6
Partida 2: +R$ 3
Partida 3: -R$ 12
------------------
Saldo acumulado: -R$ 15
```

O acerto financeiro ocorre somente ao final do conjunto de partidas.

O sistema deve apresentar o saldo consolidado de cada cliente.

### Conjunto de partidas

Várias partidas podem ser agrupadas em um conjunto:

```text
Conjunto
├── Configuração financeira
├── Partida 1
├── Partida 2
├── Partida 3
└── Acerto final
```

A configuração financeira pode ser definida para o conjunto ou individualmente para uma partida. Quando uma partida possuir valores próprios, eles prevalecem sobre a configuração geral do conjunto.

Cada partida deve armazenar os valores efetivamente utilizados.

---

## 11.1. Registro de pagamento (quitação de saldo)

Além dos lançamentos gerados automaticamente pelo sistema (consumo, crédito de vitória, cobrança de derrota), o dono do estabelecimento pode registrar manualmente que um cliente **pagou** parte ou todo o saldo devedor — geralmente na tela de Acerto.

- Existe um 4º tipo fixo em `tipos_lancamento`: **Pagamento**.
- `partida_id` é sempre **nulo** — pagamento é um acerto geral do cliente, não pertence a uma partida específica.
- `valor` é sempre **positivo** (reduz a dívida), igual ao valor efetivamente recebido. Pode ser parcial (não precisa zerar o saldo de uma vez).
- `descricao` é livre (ex.: "Pagamento em dinheiro", "Pix").
- Registrar um pagamento **não marca o cliente como "saiu" do estabelecimento automaticamente** — o sistema apenas sugere essa ação logo em seguida (seção 3.1), e o dono decide se confirma ou deixa o cliente presente.

### Exemplo

```text
Saldo devedor de João: -R$ 15,00

João paga R$ 15,00 no balcão:
→ lançamento: cliente=João, partida_id=null, tipo=Pagamento, valor=+R$ 15,00, descricao="Pagamento em dinheiro"

Novo saldo de João: R$ 0,00
Sistema sugere: "Marcar João como saiu do estabelecimento?"
```

---

## 12. Modelo de dados (tabelas)

Oito tabelas, ligadas por id:

```text
clientes
├── id
├── nome            → único, normalizado (ver regra abaixo)
└── presente        → sim/não — está no estabelecimento agora (ver seção 3.1)

equipes
├── id
└── nome            → "Azul" ou "Amarela" (dado fixo, cadastrado uma vez)

tipos_lancamento
├── id
└── nome            → "Consumo" | "Crédito partida" | "Débito partida" | "Pagamento"
                       (dado fixo, cadastrado uma vez)

itens_consumo
├── id
├── nome            → ex.: "Cerveja" (catálogo opcional, agiliza o lançamento)
└── valor           → valor sugerido, pode ser ajustado no lançamento

configuracao_padrao
├── id
├── valor_minimo_consumacao   → valor padrão sugerido (pode ser 0)
└── valor_partida_por_cliente → valor padrão sugerido (pode ser 0)

partidas
├── id
├── data_hora
├── equipe_vencedora_id  → FK para equipes
├── status
├── valor_minimo_consumacao    → valor efetivamente usado nessa partida
├── valor_partida_por_cliente  → valor efetivamente usado nessa partida
└── conjunto_id (opcional)

participacoes
├── id
├── cliente_id      → FK para clientes
├── partida_id      → FK para partidas
├── equipe_id       → FK para equipes
├── lado            → Cima, Baixo ou não definido
├── entrada
├── saida           → quando aplicável
└── status          → ativo ou saiu

lancamentos_financeiros
├── id
├── cliente_id      → FK para clientes
├── partida_id      → FK para partidas (opcional — ver regra abaixo)
├── tipo_id         → FK para tipos_lancamento
├── item_id         → FK para itens_consumo (opcional, só quando veio do catálogo)
├── valor           → positivo (crédito) ou negativo (débito)
├── descricao       → texto livre explicando o lançamento
└── criado_em
```

### Regra: nome do cliente único e normalizado

Antes de salvar ou comparar um nome de cliente:

1. Remove espaços no início e no fim (trim).
2. Colapsa espaços duplos (ou mais) entre palavras em um único espaço.
3. Aplica a convenção de capitalização: primeira letra de cada palavra em maiúscula, resto em minúscula — exceto preposições (`da`, `de`, `do`, `das`, `dos`), que ficam sempre em minúsculo, mesmo se digitadas em maiúsculo. A primeira palavra do nome é sempre capitalizada, mesmo que coincida com uma preposição.
4. Só depois disso verifica unicidade (comparação case-insensitive) — "João Silva", " joão SILVA " e "João  Silva" (espaço duplo) são tratados como o **mesmo nome** e não podem gerar dois cadastros.

Exemplo: `"joao DA silva"` → `"Joao da Silva"`.

### Regra: `partida_id` obrigatório ou não em `lancamentos_financeiros`

```text
Se tipo_id = Crédito partida ou Débito partida:
    partida_id é obrigatório (só existem por causa do resultado de uma partida)

Se tipo_id = Consumo:
    partida_id é opcional
    → preenchido se o cliente estiver ativo numa partida no momento do lançamento
    → nulo se o cliente já finalizou as partidas e está só consumindo

Se tipo_id = Pagamento:
    partida_id é sempre nulo (acerto geral do cliente, não pertence a uma partida — ver seção 11.1)
```

Por que separar assim:

- `configuracao_padrao` guarda só os valores sugeridos para pré-preencher uma nova partida (ou conjunto). É só um ponto de partida — os valores que realmente valem ficam sempre copiados para dentro de `partidas`, então mudar o padrão depois não afeta partidas já criadas.
- `equipes` evita repetir os nomes "Azul"/"Amarela" como texto solto em `participacoes` e `partidas` — se um dia mudar o nome ou adicionar outra equipe, é uma linha só.
- `tipos_lancamento` faz o mesmo para a natureza do lançamento: em vez de comparar texto livre pra saber se é consumo ou resultado de partida, o sistema consulta pelo `tipo_id`. As 4 linhas são fixas: `Consumo`, `Crédito partida`, `Débito partida`, `Pagamento`.
- `itens_consumo` é um catálogo opcional para agilizar o lançamento de consumo — não impede lançar um item avulso digitando na hora.
- `descricao` continua livre, mas agora só carrega o detalhe legível — o item consumido ("Cerveja", "1/3 Cerveja") ou o motivo do crédito/débito ("Crédito de vitória", "Cobrança de derrota"). A categorização confiável fica no `tipo_id`, não no texto.
- `participacoes` guarda só o vínculo do cliente com a partida (equipe, lado, entrada/saída) — dados que existem uma vez por participação.
- `lancamentos_financeiros` referencia diretamente `cliente_id` e `tipo_id`; `partida_id` é opcional para permitir consumo fora de partida (cliente que só ficou consumindo). Se `valor_partida_por_cliente` da partida for R$ 0, não há necessidade de gerar lançamentos de `Crédito partida`/`Débito partida` (o valor seria zero); da mesma forma, se `valor_minimo_consumacao` for R$ 0, o indicativo da seção 7 nunca aparece.

### Exemplos de linha em `lancamentos_financeiros`

```text
cliente=João | partida_id=12   | tipo=Consumo          | descricao="Cerveja"            | valor=-6,00
cliente=João | partida_id=12   | tipo=Consumo          | descricao="1/3 Cerveja"        | valor=-2,00
cliente=João | partida_id=12   | tipo=Crédito partida  | descricao="Crédito de vitória"  | valor=+6,00
cliente=João | partida_id=12   | tipo=Débito partida   | descricao="Cobrança de derrota" | valor=-6,00
cliente=João | partida_id=null | tipo=Consumo          | descricao="Refrigerante"        | valor=-5,00
cliente=João | partida_id=null | tipo=Pagamento        | descricao="Pagamento em dinheiro" | valor=+15,00
```

O saldo de um cliente e o consumo real numa partida (usado no indicativo da seção 7) são sempre **calculados** a partir de `lancamentos_financeiros`, nunca campos armazenados à parte — assim não existe risco de o número ficar dessincronizado do histórico.

---

## 13. Consultas típicas sobre as tabelas

```text
Saldo acumulado do cliente =
soma de valor em lancamentos_financeiros
onde cliente_id = X

Consumo real do cliente numa partida =
soma (em módulo) de valor em lancamentos_financeiros
onde cliente_id = X e partida_id = Y e tipo_id = Consumo

Extrato de uma partida =
todos os lancamentos_financeiros onde partida_id = Y

Consumo do cliente fora de partida =
todos os lancamentos_financeiros onde cliente_id = X e partida_id é nulo

Clientes ativos de uma partida =
todos os participacoes onde partida_id = Y e status = "ativo"

Clientes presentes no estabelecimento agora =
todos os clientes onde presente = true

Clientes com saldo pendente =
clientes cujo saldo acumulado (soma de lancamentos_financeiros) é diferente de zero
```

---

## 14. Persistência

A aplicação utilizará:

> **LocalStorage**

Não será necessário backend ou banco de dados.

O histórico das partidas poderá permanecer armazenado localmente no navegador.

---

## 14.1. Telas da interface

A interface é dividida em 4 abas. Essa divisão é uma sugestão de UX — não muda o modelo de dados descrito na seção 12.

### Aba Clientes

- Lista todos os clientes cadastrados, com busca por nome (nome normalizado, seção 12).
- Cada linha mostra: nome, indicador de presença (Presente / Ausente) e saldo acumulado (destacado quando negativo).
- Filtros/abas internas: **Presentes agora** · **Todos** · **Com saldo pendente** (saldo ≠ 0).
- Ações disponíveis:
  - Cadastrar novo cliente.
  - Marcar chegada (`presente = true`) — não gera lançamento (seção 3.1).
  - Marcar saída (`presente = false`) — permitido mesmo com saldo pendente (seção 3.1).
  - Abrir o extrato do cliente (todos os lançamentos, de todas as partidas e avulsos).

### Aba Partida

- Monta a partida atual: adiciona clientes às equipes 🔵 Azul / 🟡 Amarela e, opcionalmente, a um lado (Cima/Baixo), respeitando os limites de 4 por lado / 8 por equipe (seção 2).
- Só oferece para seleção clientes marcados como **presentes** (seção 3.1).
- Permite entrada e saída de participantes durante a partida (seção 3) — sair da partida é independente de sair do estabelecimento.
- Permite inverter as equipes da partida ativa de uma vez (quem está no Azul vai para o Amarela e vice-versa), preservando o lado de cada participante.
- Ao concluir, o dono informa a equipe vencedora (🔵 ou 🟡). O sistema calcula automaticamente:
  - `Débito partida` (cobrança de derrota) para cada perdedor ativo.
  - `Crédito partida` (crédito de vitória) dividido entre os vencedores ativos.
  - (seção 7 e 8)
- Exibe, para cada cliente ativo na partida, o indicativo calculado de consumação mínima **acumulada entre todas as partidas em que ele participou** (seção 7, "faltam R$ X para o mínimo"), sem afetar o saldo.
- Mostra um histórico das partidas já concluídas (data, equipe vencedora, quantidade de participantes ativos, valor por cliente); cada item expande e mostra os participantes ativos agrupados por equipe. A partir de uma partida do histórico, é possível criar uma nova partida reaproveitando os mesmos clientes, repetindo a equipe e o lado exatos de cada um — usando os valores da configuração padrão atual (não os valores da partida antiga). Cliente que não está mais presente no estabelecimento é ignorado nessa cópia (seção 3.1).
- É possível limpar o histórico (apagar os registros de partidas concluídas da lista). Isso não desfaz nenhum lançamento financeiro já gerado por essas partidas — créditos e débitos continuam valendo no saldo do cliente normalmente.

### Aba Consumo

- Fluxo de lançamento: escolher item (do catálogo `itens_consumo` ou avulso, com descrição e valor digitados na hora) e selecionar quais clientes dividem.
- A lista de seleção só mostra clientes **presentes** (seção 3.1).
- Gera um lançamento de `Consumo` por cliente selecionado, rateando o valor se for mais de um (seção 10).
- O `partida_id` do lançamento é preenchido automaticamente se o cliente estiver ativo em alguma partida no momento; senão fica nulo (consumo fora de partida).

### Aba Acerto

- Mostra o extrato por partida, por cliente ou o saldo consolidado de todos os clientes (seção 11).
- Separa visualmente **pendências** (saldo ≠ 0) de **clientes em dia** (saldo = 0) — independente de estarem presentes ou ausentes.
- Ação "Registrar pagamento" em um cliente com saldo pendente: abre um campo com o valor sugerido (o saldo devedor em módulo, editável para pagamento parcial) e gera um lançamento de `Pagamento` (seção 11.1).
- Depois de registrar o pagamento, sugere marcar o cliente como "saiu do estabelecimento" (ação opcional, um clique).

---

## 15. Fora do escopo

Não faz parte do controle:

- Pontuação da bocha.
- Contagem dos 24 pontos.
- Controle das rodadas.
- Quantidade de bochas utilizadas.
- Definição de quem começa.
- Ranking de clientes.
- Ranking de equipes.
- Estatísticas esportivas.
- Sistema de login.
- Backend ou banco de dados remoto.

---

## 16. Regra financeira resumida

### Entrada do cliente

```text
Nenhum lançamento é gerado na entrada.
O cliente só passa a fazer parte da participação.
```

### Consumação mínima (indicativo calculado na hora, não é lançamento nem dado armazenado)

```text
minimoAcumulado = soma do valor mínimo de todas as partidas em que o cliente participou
consumoAcumulado = soma do consumo real do cliente vinculado a essas partidas
faltante = minimoAcumulado - consumoAcumulado

Se faltante > 0:
    mostra indicativo (ex.: "faltam R$ X para o mínimo")
    na tela de partida

Se faltante <= 0:
    nenhum indicativo
```

### Cliente perdedor ativo

```text
Lançamento "cobrança de derrota" = -valor da partida por cliente
```

### Cliente vencedor ativo

```text
Lançamento "crédito de vitória" = +crédito recebido

onde:
crédito recebido =
  (quantidade de perdedores × valor da partida por cliente)
  ÷ quantidade de vencedores
```

Os lançamentos financeiros (`consumo`, `crédito de vitória`, `cobrança de derrota`) referenciam o id da partida. O indicativo de consumação mínima é só uma conta feita na hora de exibir — nunca é armazenado nem é um lançamento.

### Cliente que saiu antes da conclusão

```text
Mantém apenas os lançamentos já gerados até a saída
(ex.: consumo real já lançado).

Não participa:
- da verificação de consumação mínima da partida
- da divisão entre vencedores
- da cobrança de derrota
```

### Pagamento (quitação manual de saldo)

```text
Lançamento "Pagamento" = +valor recebido (parcial ou total)
partida_id sempre nulo
Não marca o cliente como "saiu" automaticamente — apenas sugere (seção 3.1)
```

### Saldo acumulado

```text
Saldo acumulado =
soma de todos os lançamentos
de todas as partidas
```

O acerto pode ocorrer somente ao final de um conjunto de partidas.

A quantidade de clientes deve considerar somente os clientes **ativos no momento da conclusão da partida**.

A presença no estabelecimento (seção 3.1) é independente da participação em partida e do saldo financeiro — controla apenas quem está fisicamente no local agora.
