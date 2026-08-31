// Script de uso local (dev). NÃO faz parte do app.
//
// Como usar:
// 1. Abra o app rodando no navegador (ex.: http://localhost:5173).
// 2. Abra o DevTools (F12) > aba Console.
// 3. Cole o conteúdo deste arquivo inteiro e dê Enter.
// 4. Recarregue a página (F5) para ver os itens/categorias na tela de Consumo.
//
// Idempotente: pode rodar de novo sem duplicar categorias/itens já existentes
// (verifica pelo nome). Usa as mesmas chaves e formato que o app grava no
// localStorage (ver src/data/categoriasConsumoRepo.ts e itensConsumoRepo.ts).

; (function seedCatalogoConsumo() {
  const CHAVE_CATEGORIAS = 'bocha:categoriasConsumo'
  const CHAVE_ITENS = 'bocha:itensConsumo'

  const CATALOGO_PADRAO = [
    {
      nome: 'Cervejas',
      icone: 'beer',
      itens: [
        { nome: 'Heineken 600ml', valor: 18 },
        { nome: 'Heineken 330ml', valor: 12 },
        { nome: 'Original 600ml', valor: 15 },
        { nome: 'Brahma Zero 350ml', valor: 6 },
      ],
    },
    {
      nome: 'Refrigerantes e água',
      icone: 'cupSoda',
      itens: [
        { nome: 'Coca-Cola lata', valor: 6 },
        { nome: 'Guaraná lata', valor: 6 },
        { nome: 'Água mineral sem gás', valor: 5 },
        { nome: 'Água mineral com gás', valor: 5 },
        { nome: 'Água mineral com gás', valor: 5 },
      ],
    },
  ]

  function lerJson(chave) {
    try {
      return JSON.parse(localStorage.getItem(chave)) || []
    } catch {
      return []
    }
  }

  const categorias = lerJson(CHAVE_CATEGORIAS)
  const itens = lerJson(CHAVE_ITENS)

  const categoriaIdPorNome = new Map(categorias.map((c) => [c.nome, c.id]))
  const nomesItensExistentes = new Set(itens.map((i) => i.nome))

  let categoriasCriadas = 0
  let itensCriados = 0

  for (const grupo of CATALOGO_PADRAO) {
    let categoriaId = categoriaIdPorNome.get(grupo.nome)
    if (!categoriaId) {
      categoriaId = crypto.randomUUID()
      categorias.push({ id: categoriaId, nome: grupo.nome, icone: grupo.icone })
      categoriaIdPorNome.set(grupo.nome, categoriaId)
      categoriasCriadas++
    }

    for (const item of grupo.itens) {
      if (nomesItensExistentes.has(item.nome)) continue
      itens.push({ id: crypto.randomUUID(), nome: item.nome, valor: item.valor, categoriaId })
      nomesItensExistentes.add(item.nome)
      itensCriados++
    }
  }

  localStorage.setItem(CHAVE_CATEGORIAS, JSON.stringify(categorias))
  localStorage.setItem(CHAVE_ITENS, JSON.stringify(itens))

  console.log(
    `[seed-catalogo-consumo] ${categoriasCriadas} categoria(s) e ${itensCriados} item(ns) adicionados. Recarregue a página.`,
  )
})()
