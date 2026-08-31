// Script de diagnóstico (dev). NÃO faz parte do app.
//
// Como usar:
// 1. Abra o dropdown "Item do catálogo" (Comandas > Lançar consumo) e deixe aberto.
// 2. Cole este script inteiro no Console (F12) e dê Enter.
// 3. Tente rolar com a rodinha do mouse sobre a lista.
// 4. Copie tudo que apareceu no console (a partir de "[diagnostico]") e envie de volta.

;(function diagnosticoScroll() {
  const lista = document.querySelector('[data-slot="command-list"]')
  const popoverContent = document.querySelector('[data-slot="popover-content"]')
  const sheetContent = document.querySelector('[data-slot="sheet-content"]')

  if (!lista) {
    console.log('[diagnostico] Não encontrei [data-slot="command-list"]. O dropdown está aberto?')
    return
  }

  console.log('[diagnostico] ---- estado inicial ----')
  console.log('[diagnostico] scrollTop=%s scrollHeight=%s clientHeight=%s', lista.scrollTop, lista.scrollHeight, lista.clientHeight)
  console.log('[diagnostico] overflowY computado =', getComputedStyle(lista).overflowY)
  console.log('[diagnostico] html tem data-scroll-locked? ', document.documentElement.hasAttribute('data-scroll-locked'))
  console.log('[diagnostico] popover é descendente do sheet-content? ', sheetContent ? sheetContent.contains(popoverContent) : 'sheet-content não encontrado')

  let contFaseCaptura = 0
  let contFaseAlvo = 0
  document.addEventListener(
    'wheel',
    (e) => {
      contFaseCaptura++
      console.log('[diagnostico] wheel chegou no document (fase captura) #%s defaultPrevented=%s', contFaseCaptura, e.defaultPrevented)
    },
    { capture: true },
  )

  lista.addEventListener('wheel', (e) => {
    contFaseAlvo++
    console.log('[diagnostico] wheel chegou na LISTA (elemento alvo) #%s deltaY=%s scrollTop antes=%s', contFaseAlvo, e.deltaY, lista.scrollTop)
    setTimeout(() => {
      console.log('[diagnostico] scrollTop depois=%s', lista.scrollTop)
    }, 0)
  })

  console.log('[diagnostico] Listeners instalados. Agora tente rolar a lista com a rodinha do mouse.')
})()
