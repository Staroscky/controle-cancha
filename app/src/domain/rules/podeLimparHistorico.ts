/** Só permite limpar o histórico financeiro de um cliente quando o saldo dele está zerado —
 * evita apagar o registro de um crédito ou débito em aberto (seção 11 de docs/regras.md). */
export function podeLimparHistorico(saldo: number): boolean {
  return Math.abs(saldo) < 0.005
}
