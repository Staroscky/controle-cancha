/**
 * Arredonda um valor monetário para duas casas decimais, sempre para cima quando sobrar
 * fração de centavo (ex.: dividir R$ 16 entre 3 clientes não pode perder centavo pra menos
 * e deixar a casa no prejuízo). O toFixed(8) intermediário descarta só o ruído de ponto
 * flutuante do JS (casas bem além do centavo), preservando a fração real da divisão.
 */
export function arredondarMoedaParaCima(valor: number): number {
  const centavos = Number((valor * 100).toFixed(8))
  return Math.ceil(centavos) / 100
}
