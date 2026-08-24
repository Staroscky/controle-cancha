import type { ConfiguracaoPadrao } from '../domain/types/ConfiguracaoPadrao'
import { getItem, setItem } from './storage'

const CHAVE = 'bocha:configuracaoPadrao'

const CONFIGURACAO_INICIAL: ConfiguracaoPadrao = {
  id: 'padrao',
  valorMinimoConsumacao: 0,
  valorPartidaPorCliente: 0,
}

export function obterConfiguracaoPadrao(): ConfiguracaoPadrao {
  return getItem<ConfiguracaoPadrao>(CHAVE, CONFIGURACAO_INICIAL)
}

export function atualizarConfiguracaoPadrao(
  valores: Pick<ConfiguracaoPadrao, 'valorMinimoConsumacao' | 'valorPartidaPorCliente'>,
): ConfiguracaoPadrao {
  const configuracao: ConfiguracaoPadrao = { id: 'padrao', ...valores }
  setItem(CHAVE, configuracao)
  return configuracao
}
