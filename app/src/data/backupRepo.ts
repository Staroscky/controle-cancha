const PREFIXO = 'bocha:'
const VERSAO_ATUAL = 1

export interface Backup {
  versao: number
  exportadoEm: string
  dados: Record<string, unknown>
}

function listarChavesBocha(): string[] {
  const chaves: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i)
    if (chave && chave.startsWith(PREFIXO)) chaves.push(chave)
  }
  return chaves
}

export function exportarBackup(): Backup {
  const dados: Record<string, unknown> = {}

  for (const chave of listarChavesBocha()) {
    const bruto = localStorage.getItem(chave)
    if (bruto === null) continue

    try {
      dados[chave] = JSON.parse(bruto)
    } catch {
      continue
    }
  }

  return { versao: VERSAO_ATUAL, exportadoEm: new Date().toISOString(), dados }
}

export function importarBackup(conteudo: unknown): void {
  if (!conteudo || typeof conteudo !== 'object') {
    throw new Error('Arquivo inválido.')
  }

  const dados = (conteudo as { dados?: unknown }).dados
  if (!dados || typeof dados !== 'object') {
    throw new Error('Arquivo inválido: dados de backup não encontrados.')
  }

  listarChavesBocha().forEach((chave) => localStorage.removeItem(chave))

  Object.entries(dados as Record<string, unknown>).forEach(([chave, valor]) => {
    if (!chave.startsWith(PREFIXO)) return
    localStorage.setItem(chave, JSON.stringify(valor))
  })
}
