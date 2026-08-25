import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { agruparClientesPorGrupo, type Bloco } from '@/domain/rules/agruparClientesPorGrupo'
import { ComandaBloco } from '@/ui/components/ComandaBloco'
import { useComandas } from '@/ui/hooks/useComandas'
import { cn } from '@/ui/lib/utils'

function chaveDoBloco(bloco: Bloco) {
  return bloco.grupoId ?? bloco.membros[0].id
}

export function ComandasPage() {
  const {
    clientes,
    grupos,
    saldoDoCliente,
    extratoDoCliente,
    registrarPagamento,
    registrarPagamentoGrupo,
    marcarSaida,
    marcarSaidaGrupo,
  } = useComandas()

  const [expandidoId, setExpandidoId] = useState<string | null>(null)
  const [outrasAbertas, setOutrasAbertas] = useState(false)

  function toggle(chave: string) {
    setExpandidoId((atual) => (atual === chave ? null : chave))
  }

  const presentes = clientes.filter((c) => c.presente)
  const blocosPresentes = agruparClientesPorGrupo(presentes, grupos)
  const ausentesComSaldo = clientes.filter((c) => !c.presente && saldoDoCliente(c.id) !== 0)

  function renderBloco(bloco: Bloco) {
    const chave = chaveDoBloco(bloco)
    return (
      <ComandaBloco
        key={chave}
        bloco={bloco}
        expandido={expandidoId === chave}
        onToggle={() => toggle(chave)}
        saldoDoCliente={saldoDoCliente}
        extratoDoCliente={extratoDoCliente}
        onRegistrarPagamento={registrarPagamento}
        onRegistrarPagamentoGrupo={registrarPagamentoGrupo}
        onMarcarSaida={marcarSaida}
        onMarcarSaidaGrupo={marcarSaidaGrupo}
      />
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Comandas</h2>

      {clientes.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      )}

      {clientes.length > 0 && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Presentes</h3>
            {blocosPresentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente presente no momento.</p>
            ) : (
              <div className="space-y-2">{blocosPresentes.map(renderBloco)}</div>
            )}
          </div>

          {ausentesComSaldo.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setOutrasAbertas((atual) => !atual)}
                className="flex items-center gap-1 text-sm font-semibold text-muted-foreground"
              >
                <ChevronDown
                  className={cn('size-4 transition-transform', outrasAbertas && 'rotate-180')}
                />
                Outras pendências ({ausentesComSaldo.length})
              </button>

              {outrasAbertas && (
                <div className="space-y-2">
                  {ausentesComSaldo.map((cliente) => renderBloco({ membros: [cliente] }))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
