/** Remove o prefixo "1/N " de um item dividido (seção 10 de docs/regras.md), voltando ao nome
 * "limpo" do item — usado ao reabrir uma correção e ao exibir a divisão de um lançamento. */
export function descricaoSemPrefixoDeRateio(descricao: string): string {
  return descricao.replace(/^1\/\d+ /, '')
}
