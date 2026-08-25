import { ExtratoClienteDialog } from '@/ui/components/ExtratoClienteDialog'
import { RegistrarPagamentoSheet } from '@/ui/components/RegistrarPagamentoSheet'
import { useAcerto, type ItemSaldoCliente } from '@/ui/hooks/useAcerto'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function AcertoPage() {
  const { clientes, extratoDoCliente, pendencias, emDia, registrarPagamento, marcarSaida } =
    useAcerto()

  function renderItem(item: ItemSaldoCliente) {
    return (
      <li
        key={item.cliente.id}
        className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
      >
        <div className="flex items-center gap-2">
          <span>{item.cliente.nome}</span>
          <span className={item.saldo < 0 ? 'text-destructive' : 'text-emerald-600'}>
            {formatoMoeda.format(item.saldo)}
          </span>
        </div>
        <div className="flex gap-2">
          <ExtratoClienteDialog
            cliente={item.cliente}
            lancamentos={extratoDoCliente(item.cliente.id)}
          />
          {item.saldo < 0 && (
            <RegistrarPagamentoSheet
              cliente={item.cliente}
              saldo={item.saldo}
              onRegistrar={registrarPagamento}
              onSugerirSaida={marcarSaida}
            />
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Acerto</h2>

      {clientes.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      )}

      {clientes.length > 0 && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Pendências</h3>
            {pendencias.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma pendência — todo mundo em dia.</p>
            ) : (
              <ul className="space-y-2">{pendencias.map((item) => renderItem(item))}</ul>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Em dia</h3>
            {emDia.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente em dia no momento.</p>
            ) : (
              <ul className="space-y-2">{emDia.map((item) => renderItem(item))}</ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
