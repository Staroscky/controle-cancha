import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { agruparClientesPorGrupo, type Bloco } from '@/domain/rules/agruparClientesPorGrupo'
import { ComandaBloco } from '@/ui/components/ComandaBloco'
import { ComandaDrawer } from '@/ui/components/ComandaDrawer'
import { LancarConsumoSheet } from '@/ui/components/LancarConsumoSheet'
import { Input } from '@/ui/components/ui/input'
import { useComandas } from '@/ui/hooks/useComandas'
import { cn } from '@/ui/lib/utils'

export function ComandasPage() {
  const {
    clientes,
    grupos,
    itensConsumo,
    saldoDoCliente,
    extratoDoCliente,
    lancarConsumo,
    registrarPagamento,
    registrarPagamentoGrupo,
    marcarSaida,
    marcarSaidaGrupo,
    excluirHistorico,
    excluirHistoricoGrupo,
  } = useComandas()

  const [blocoAberto, setBlocoAberto] = useState<Bloco | null>(null)
  const [outrasAbertas, setOutrasAbertas] = useState(false)
  const [filtro, setFiltro] = useState('')

  const presentes = clientes.filter((c) => c.presente)
  const blocosPresentes = agruparClientesPorGrupo(presentes, grupos)
  const ausentesComSaldo = clientes.filter((c) => !c.presente && saldoDoCliente(c.id) !== 0)

  const termo = filtro.trim().toLowerCase()
  const correspondeAoFiltro = (nomes: (string | undefined)[]) =>
    !termo || nomes.some((nome) => nome?.toLowerCase().includes(termo))

  const blocosPresentesFiltrados = blocosPresentes.filter((bloco) =>
    correspondeAoFiltro([bloco.nome, ...bloco.membros.map((m) => m.nome)]),
  )
  const ausentesComSaldoFiltrados = ausentesComSaldo.filter((cliente) =>
    correspondeAoFiltro([cliente.nome, grupos.find((g) => g.id === cliente.grupoId)?.nome]),
  )

  function renderBloco(bloco: Bloco) {
    const chave = bloco.grupoId ?? bloco.membros[0].id
    return <ComandaBloco key={chave} bloco={bloco} onAbrir={setBlocoAberto} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Comandas</h2>
        {presentes.length > 0 && (
          <LancarConsumoSheet
            itens={itensConsumo}
            clientes={presentes}
            grupos={grupos}
            onLancar={lancarConsumo}
          />
        )}
      </div>

      {clientes.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      )}

      {clientes.length > 0 && (
        <>
          <Input
            placeholder="Filtrar por nome ou grupo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="h-8 max-w-64"
          />

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Presentes</h3>
            {blocosPresentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente presente no momento.</p>
            ) : blocosPresentesFiltrados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum resultado para "{filtro}".</p>
            ) : (
              <div className="space-y-2">{blocosPresentesFiltrados.map(renderBloco)}</div>
            )}
          </div>

          {ausentesComSaldoFiltrados.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setOutrasAbertas((atual) => !atual)}
                className="flex items-center gap-1 text-sm font-semibold text-muted-foreground"
              >
                <ChevronDown
                  className={cn('size-4 transition-transform', outrasAbertas && 'rotate-180')}
                />
                Outras pendências ({ausentesComSaldoFiltrados.length})
              </button>

              {outrasAbertas && (
                <div className="space-y-2">
                  {ausentesComSaldoFiltrados.map((cliente) => renderBloco({ membros: [cliente] }))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ComandaDrawer
        bloco={blocoAberto}
        onFechar={() => setBlocoAberto(null)}
        saldoDoCliente={saldoDoCliente}
        extratoDoCliente={extratoDoCliente}
        onRegistrarPagamento={registrarPagamento}
        onRegistrarPagamentoGrupo={registrarPagamentoGrupo}
        onMarcarSaida={marcarSaida}
        onMarcarSaidaGrupo={marcarSaidaGrupo}
        onExcluirHistorico={excluirHistorico}
        onExcluirHistoricoGrupo={excluirHistoricoGrupo}
      />
    </div>
  )
}
