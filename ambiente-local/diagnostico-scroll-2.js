// Script de diagnóstico #2 (dev). NÃO faz parte do app.
// Precisa ser colado no Console do DevTools (usa getEventListeners, que só existe lá).
//
// Como usar:
// 1. Abra o dropdown "Item do catálogo" e deixe aberto.
// 2. Cole este script inteiro no Console (F12) e dê Enter.
// 3. Tente rolar com a rodinha do mouse sobre a lista (mesmo sem rolar, já ajuda).
// 4. Copie tudo que apareceu a partir de "[diagnostico2]" e envie de volta.

;(function diagnosticoScroll2() {
  const lista = document.querySelector('[data-slot="command-list"]')
  if (!lista) {
    console.log('[diagnostico2] Não encontrei [data-slot="command-list"]. O dropdown está aberto?')
    return
  }

  console.log('[diagnostico2] ---- listeners de wheel/scroll por elemento, da lista até o document ----')
  let el = lista
  while (el) {
    const info = typeof getEventListeners === 'function' ? getEventListeners(el) : null
    const wheelListeners = info ? (info.wheel || []) : 'getEventListeners indisponível (use o Console do DevTools, não um snippet salvo)'
    console.log('[diagnostico2] elemento:', el, ' data-slot=', el.getAttribute && el.getAttribute('data-slot'))
    console.log('[diagnostico2]   listeners de wheel:', wheelListeners)
    el = el.parentElement
  }
  console.log('[diagnostico2] ---- listeners de wheel no window ----')
  console.log('[diagnostico2]', typeof getEventListeners === 'function' ? getEventListeners(window).wheel : 'indisponível')

  console.log('[diagnostico2] ---- defaultPrevented no fim da propagação (fase de bubble no document) ----')
  document.addEventListener('wheel', (e) => {
    console.log('[diagnostico2] bubble chegou no document: defaultPrevented=', e.defaultPrevented, ' cancelable=', e.cancelable)
  })

  console.log('[diagnostico2] Pronto. Agora tente rolar a lista com a rodinha do mouse.')
})()
