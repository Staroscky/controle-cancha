import { Button } from '@/ui/components/ui/button'
import { Input } from '@/ui/components/ui/input'
import { Label } from '@/ui/components/ui/label'

type FormularioFechamentoProps = {
  idPrefixo: string
  valor: string
  onValorChange: (valor: string) => void
  descricao: string
  onDescricaoChange: (descricao: string) => void
  rotuloBotao: string
  onConfirmar: () => void
}

export function FormularioFechamento({
  idPrefixo,
  valor,
  onValorChange,
  descricao,
  onDescricaoChange,
  rotuloBotao,
  onConfirmar,
}: FormularioFechamentoProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="grid flex-1 gap-2">
          <Label htmlFor={`${idPrefixo}-valor`}>Valor</Label>
          <Input
            id={`${idPrefixo}-valor`}
            type="number"
            min={0}
            step="0.01"
            value={valor}
            onChange={(e) => onValorChange(e.target.value)}
          />
        </div>
        <div className="grid flex-1 gap-2">
          <Label htmlFor={`${idPrefixo}-descricao`}>Descrição</Label>
          <Input
            id={`${idPrefixo}-descricao`}
            value={descricao}
            onChange={(e) => onDescricaoChange(e.target.value)}
            placeholder="Ex.: Pagamento em dinheiro, Pix"
          />
        </div>
      </div>
      <Button onClick={onConfirmar}>{rotuloBotao}</Button>
    </div>
  )
}
