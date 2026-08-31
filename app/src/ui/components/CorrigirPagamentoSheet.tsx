import { useState } from 'react'
import { toast } from 'sonner'
import type { Cliente } from '@/domain/types/Cliente'
import type { LancamentoFinanceiro } from '@/domain/types/LancamentoFinanceiro'
import { Button } from '@/ui/components/ui/button'
import { Combobox } from '@/ui/components/ui/combobox'
import { Input } from '@/ui/components/ui/input'
import { Label } from '@/ui/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/components/ui/sheet'

type CorrigirPagamentoSheetProps = {
  lancamento: LancamentoFinanceiro | null
  clientes: Cliente[]
  onOpenChange: (aberto: boolean) => void
  onCorrigir: (clienteId: string, valor: number, descricao: string) => boolean
}

/** Corrige um lançamento de Pagamento ou Uso de crédito (seção 11.3 de docs/regras.md): estorna o
 * original e relança com o valor, a descrição e o cliente corretos — cobre tanto valor errado
 * quanto ter lançado para a pessoa errada.
 *
 * Sempre controlado pelo pai (open = `!!lancamento`); o pai deve passar `key={lancamento?.id}` no
 * ponto de uso pra remontar o componente a cada novo alvo — é assim que o formulário é
 * pré-preenchido de novo a cada correção, sem precisar de um efeito sincronizando com a prop. */
export function CorrigirPagamentoSheet({
  lancamento,
  clientes,
  onOpenChange,
  onCorrigir,
}: CorrigirPagamentoSheetProps) {
  const [clienteId, setClienteId] = useState(lancamento?.clienteId ?? '')
  const [valor, setValor] = useState(lancamento ? String(Math.abs(lancamento.valor)) : '')
  const [descricao, setDescricao] = useState(lancamento?.descricao ?? '')

  function handleConfirmar() {
    const valorNumerico = Number(valor)

    if (!clienteId) {
      toast.error('Selecione o cliente correto.')
      return
    }
    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }

    const corrigido = onCorrigir(clienteId, valorNumerico, descricao)
    if (!corrigido) {
      toast.error('Informe um valor válido (maior que zero).')
      return
    }
    toast.success('Lançamento corrigido.')
    onOpenChange(false)
  }

  return (
    <Sheet open={!!lancamento} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Corrigir lançamento</SheetTitle>
          <SheetDescription>
            Reverte o lançamento original e registra a versão corrigida — o histórico dos dois fica
            visível no extrato.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="corrigir-pagamento-cliente">Cliente</Label>
            <Combobox
              id="corrigir-pagamento-cliente"
              value={clienteId}
              onValueChange={setClienteId}
              options={clientes.map((cliente) => ({ value: cliente.id, label: cliente.nome }))}
              placeholder="Selecione o cliente"
              searchPlaceholder="Filtrar cliente..."
              emptyText="Nenhum cliente encontrado."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="corrigir-pagamento-valor">Valor</Label>
            <Input
              id="corrigir-pagamento-valor"
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="corrigir-pagamento-descricao">Descrição</Label>
            <Input
              id="corrigir-pagamento-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleConfirmar}>Confirmar correção</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
