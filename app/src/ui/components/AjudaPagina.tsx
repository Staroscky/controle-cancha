import { HelpCircle, type LucideIcon } from 'lucide-react'
import { Button } from '@/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/ui/dialog'

export type ItemAjuda = {
  icone: LucideIcon
  titulo: string
  descricao: string
}

export function AjudaPagina({ titulo, itens }: { titulo: string; itens: ItemAjuda[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Como funciona esta página?">
          <HelpCircle className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="size-4" />
            </div>
            <DialogTitle className="text-base">{titulo}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {itens.map(({ icone: Icone, titulo: tituloItem, descricao }) => (
            <div key={tituloItem} className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icone className="size-5" />
                </div>
                <p className="text-sm font-semibold">{tituloItem}</p>
              </div>
              <p className="text-sm text-muted-foreground">{descricao}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full sm:w-auto">Entendi</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
