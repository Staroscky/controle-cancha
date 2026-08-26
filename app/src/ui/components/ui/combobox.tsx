import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { cn } from "@/ui/lib/utils"
import { Button } from "@/ui/components/ui/button"
import { Input } from "@/ui/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/ui/popover"

export type ComboboxOption = {
  value: string
  label: string
}

type ComboboxProps = {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  id?: string
}

function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado.",
  className,
  id,
}: ComboboxProps) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState("")

  const selecionado = options.find((option) => option.value === value)
  const filtrados = options.filter((option) =>
    option.label.toLowerCase().includes(busca.trim().toLowerCase()),
  )

  function abrir(proximoAberto: boolean) {
    setAberto(proximoAberto)
    if (proximoAberto) setBusca("")
  }

  function escolher(novoValor: string) {
    onValueChange(novoValor === value ? "" : novoValor)
    setAberto(false)
  }

  return (
    <Popover open={aberto} onOpenChange={abrir}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          className={cn(
            "w-full min-w-0 justify-between font-normal",
            !selecionado && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selecionado?.label ?? placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width)">
        <div className="p-2">
          <Input
            autoFocus
            placeholder={searchPlaceholder}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-56 overflow-y-auto border-t py-1">
          {filtrados.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">{emptyText}</p>
          )}
          {filtrados.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => escolher(option.value)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-muted"
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  option.value === value ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
