export function getItem<T>(chave: string, valorPadrao: T): T {
  const bruto = localStorage.getItem(chave)
  if (!bruto) return valorPadrao

  try {
    return JSON.parse(bruto) as T
  } catch {
    return valorPadrao
  }
}

export function setItem<T>(chave: string, valor: T): void {
  localStorage.setItem(chave, JSON.stringify(valor))
}
