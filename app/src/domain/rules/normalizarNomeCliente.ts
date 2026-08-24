export function normalizarNomeCliente(nome: string): string {
  return nome.trim().replace(/\s+/g, ' ')
}
