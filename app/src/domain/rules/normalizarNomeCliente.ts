const PREPOSICOES = new Set(['da', 'de', 'do', 'das', 'dos'])

export function normalizarNomeCliente(nome: string): string {
  const nomeComEspacosNormalizados = nome.trim().replace(/\s+/g, ' ')

  return nomeComEspacosNormalizados
    .split(' ')
    .map((palavra, indice) => {
      const palavraMinuscula = palavra.toLowerCase()
      if (indice > 0 && PREPOSICOES.has(palavraMinuscula)) {
        return palavraMinuscula
      }
      return palavraMinuscula.charAt(0).toUpperCase() + palavraMinuscula.slice(1)
    })
    .join(' ')
}
