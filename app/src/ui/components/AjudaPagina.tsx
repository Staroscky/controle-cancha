import { HelpCircle } from 'lucide-react'
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

export function AjudaPagina({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Como funciona esta página?">
          <HelpCircle className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="size-4" />
            </div>
            <DialogTitle className="text-base">{titulo}</DialogTitle>
          </div>
        </DialogHeader>

        <ol className="space-y-3">
          {itens.map((item, indice) => (
            <li key={indice} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {indice + 1}
              </span>
              <p className="pt-0.5 text-sm text-foreground/90">{item}</p>
            </li>
          ))}
        </ol>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full sm:w-auto">Entendi</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
