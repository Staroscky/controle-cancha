import { GripVertical } from 'lucide-react'
import { useMemo, useState, type DragEvent } from 'react'
import { agruparClientesPorGrupo, type Bloco } from '@/domain/rules/agruparClientesPorGrupo'
import type { Cliente } from '@/domain/types/Cliente'
import type { Grupo } from '@/domain/types/Grupo'
import { Card } from '@/ui/components/ui/card'
import { Input } from '@/ui/components/ui/input'
import { cn } from '@/ui/lib/utils'

type QuadroPresencaProps = {
  clientes: Cliente[]
  grupos: Grupo[]
  onAgrupar: (idArrastado: string, idDestino: string) => void
  onDesagrupar: (id: string) => void
  onRenomearGrupo: (grupoId: string, nome: string) => void
}

export function QuadroPresenca({
  clientes,
  grupos,
  onAgrupar,
  onDesagrupar,
  onRenomearGrupo,
}: QuadroPresencaProps) {
  const presentes = useMemo(() => clientes.filter((c) => c.presente), [clientes])

  const blocos = useMemo<Bloco[]>(
    () => agruparClientesPorGrupo(presentes, grupos),
    [presentes, grupos],
  )

  if (presentes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum cliente presente no momento.</p>
    )
  }

  function handleDropFora(e: DragEvent) {
    e.preventDefault()
    const idArrastado = e.dataTransfer.getData('text/plain')
    if (!idArrastado) return
    onDesagrupar(idArrastado)
  }

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropFora}
    >
      {blocos.map((bloco) => (
        <BlocoCard
          key={bloco.grupoId ?? bloco.membros[0].id}
          bloco={bloco}
          onAgrupar={onAgrupar}
          onDesagrupar={onDesagrupar}
          onRenomearGrupo={onRenomearGrupo}
        />
      ))}
    </div>
  )
}

function BlocoCard({
  bloco,
  onAgrupar,
  onDesagrupar,
  onRenomearGrupo,
}: {
  bloco: Bloco
  onAgrupar: (idArrastado: string, idDestino: string) => void
  onDesagrupar: (id: string) => void
  onRenomearGrupo: (grupoId: string, nome: string) => void
}) {
  const [sobreArrasto, setSobreArrasto] = useState(false)
  const [editandoNome, setEditandoNome] = useState(false)
  const [nome, setNome] = useState(bloco.nome ?? '')

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSobreArrasto(false)
    const idArrastado = e.dataTransfer.getData('text/plain')
    if (!idArrastado) return
    onAgrupar(idArrastado, bloco.membros[0].id)
  }

  function confirmarNome() {
    if (bloco.grupoId && nome.trim()) {
      onRenomearGrupo(bloco.grupoId, nome.trim())
    }
    setEditandoNome(false)
  }

  return (
    <Card
      size="sm"
      className={cn(
        'gap-2 p-3 transition-colors',
        sobreArrasto && 'ring-2 ring-primary',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setSobreArrasto(true)
      }}
      onDragLeave={() => setSobreArrasto(false)}
      onDrop={handleDrop}
    >
      {bloco.grupoId && (
        <div className="flex items-center justify-between px-3">
          {editandoNome ? (
            <Input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onBlur={confirmarNome}
              onKeyDown={(e) => e.key === 'Enter' && confirmarNome()}
              placeholder="Nome do grupo"
              className="h-7 text-xs"
            />
          ) : (
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setEditandoNome(true)}
            >
              {bloco.nome || 'Nomear grupo'}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1 px-3">
        {bloco.membros.map((membro) => (
          <div
            key={membro.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', membro.id)}
            className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm"
          >
            <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/70" />
            <span className="flex-1">{membro.nome}</span>
            {bloco.membros.length > 1 && (
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDesagrupar(membro.id)}
                title="Remover do grupo"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
