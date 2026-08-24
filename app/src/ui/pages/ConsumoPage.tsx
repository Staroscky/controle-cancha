import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { listarClientes } from '@/data/clientesRepo'
import type { ItemConsumo } from '@/domain/types/ItemConsumo'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/ui/alert-dialog'
import { Button } from '@/ui/components/ui/button'
import { EditarItemConsumoSheet } from '@/ui/components/EditarItemConsumoSheet'
import { LancarConsumoSheet } from '@/ui/components/LancarConsumoSheet'
import { NovoItemConsumoSheet } from '@/ui/components/NovoItemConsumoSheet'
import { useConsumo } from '@/ui/hooks/useConsumo'

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ConsumoPage() {
  const { itens, cadastrarItem, editarItem, removerItem, lancar } = useConsumo()
  const clientes = listarClientes()
  const existeClientePresente = clientes.some((c) => c.presente)
  const [itemParaRemover, setItemParaRemover] = useState<ItemConsumo | null>(null)

  function handleConfirmarRemocao() {
    if (!itemParaRemover) return
    removerItem(itemParaRemover.id)
    toast.success('Item removido do catálogo.')
    setItemParaRemover(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Consumo</h2>
        <div className="flex gap-2">
          <NovoItemConsumoSheet onCadastrar={cadastrarItem} />
          {existeClientePresente && (
            <LancarConsumoSheet itens={itens} clientes={clientes} onLancar={lancar} />
          )}
        </div>
      </div>

      {!existeClientePresente && (
        <p className="text-sm text-muted-foreground">
          Nenhum cliente presente no momento. Marque a chegada de algum cliente para lançar consumo.
        </p>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Catálogo de itens</h3>
        {itens.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum item cadastrado ainda.</p>
        )}
        <ul className="space-y-2">
          {itens.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-md border p-3">
              <span>{item.nome}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{formatoMoeda.format(item.valor)}</span>
                <EditarItemConsumoSheet item={item} onEditar={editarItem} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  title="Remover item"
                  onClick={() => setItemParaRemover(item)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AlertDialog
        open={!!itemParaRemover}
        onOpenChange={(open) => !open && setItemParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item do catálogo?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemParaRemover?.nome ?? 'Este item'} deixará de aparecer na lista de itens do
              catálogo. Lançamentos de consumo já feitos com ele não são afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarRemocao}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
