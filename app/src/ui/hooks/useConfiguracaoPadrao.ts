import { useCallback, useState } from 'react'
import { atualizarConfiguracaoPadrao, obterConfiguracaoPadrao } from '@/data/configuracaoRepo'
import type { ConfiguracaoPadrao } from '@/domain/types/ConfiguracaoPadrao'

export function useConfiguracaoPadrao() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoPadrao>(() =>
    obterConfiguracaoPadrao(),
  )

  const atualizar = useCallback(
    (valores: Pick<ConfiguracaoPadrao, 'valorMinimoConsumacao' | 'valorPartidaPorCliente'>) => {
      const atualizada = atualizarConfiguracaoPadrao(valores)
      setConfiguracao(atualizada)
      return atualizada
    },
    [],
  )

  return { configuracao, atualizar }
}
