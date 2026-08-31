import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { cn } from "@/ui/lib/utils"
import { Button } from "@/ui/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/ui/popover"

export type ComboboxOption = {
  value: string
  label: string
  icon?: React.ReactNode
  group?: string
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

  // A Sheet (Dialog) bloqueia o scroll nativo do body via react-remove-scroll,
  // e esse bloqueio cancela (preventDefault) qualquer wheel que não esteja
  // dentro da árvore DOM da própria Sheet. Como o Popover é renderizado num
  // portal separado direto no <body>, cai fora dessa área liberada e o scroll
  // nativo da lista fica sempre cancelado. Rolamos via JS para não depender
  // do scroll nativo do navegador. Usamos ref callback (não useEffect) porque
  // o nó só existe no DOM quando o Popover abre, e o callback do React roda
  // exatamente nesse momento, sem risco de rodar antes do nó existir.
  function anexarScrollManual(lista: HTMLDivElement | null) {
    if (!lista) return
    function rolar(e: WheelEvent) {
      e.preventDefault()
      lista!.scrollTop += e.deltaY
    }
    lista.addEventListener("wheel", rolar, { passive: false })
    return () => lista.removeEventListener("wheel", rolar)
  }

  const selecionado = options.find((option) => option.value === value)
  const grupos = new Map<string, ComboboxOption[]>()
  for (const option of options) {
    const chave = option.group ?? ""
    grupos.set(chave, [...(grupos.get(chave) ?? []), option])
  }

  function escolher(idSelecionado: string) {
    onValueChange(idSelecionado === value ? "" : idSelecionado)
    setAberto(false)
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
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
          <span className="flex min-w-0 items-center gap-2 truncate">
            {selecionado?.icon}
            <span className="truncate">{selecionado?.label ?? placeholder}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList ref={anexarScrollManual}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {Array.from(grupos.entries()).map(([grupo, opcoesDoGrupo]) => (
              <CommandGroup key={grupo || "_sem_grupo_"} heading={grupo || undefined}>
                {opcoesDoGrupo.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => escolher(option.value)}
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
