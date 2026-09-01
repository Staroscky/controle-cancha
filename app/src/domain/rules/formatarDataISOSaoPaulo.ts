const formatoDataISO = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * Formata a data no fuso de São Paulo como YYYY-MM-DD, independente do fuso
 * configurado no dispositivo (evita datas trocadas perto da virada UTC).
 */
export function formatarDataISOSaoPaulo(data: Date = new Date()): string {
  return formatoDataISO.format(data)
}
