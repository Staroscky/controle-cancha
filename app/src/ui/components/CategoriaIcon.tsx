import {
  Beef,
  Beer,
  Candy,
  Cherry,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Drumstick,
  Fish,
  GlassWater,
  IceCream,
  type LucideIcon,
  Martini,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  Soup,
  Tag,
  Utensils,
  UtensilsCrossed,
  Wine,
} from 'lucide-react'
import { Button } from '@/ui/components/ui/button'
import { cn } from '@/ui/lib/utils'

export const ICONES_CATEGORIA: Record<string, LucideIcon> = {
  beer: Beer,
  wine: Wine,
  martini: Martini,
  coffee: Coffee,
  glassWater: GlassWater,
  cupSoda: CupSoda,
  pizza: Pizza,
  sandwich: Sandwich,
  cookie: Cookie,
  iceCream: IceCream,
  soup: Soup,
  candy: Candy,
  popcorn: Popcorn,
  fish: Fish,
  beef: Beef,
  salad: Salad,
  utensilsCrossed: UtensilsCrossed,
  croissant: Croissant,
  drumstick: Drumstick,
  cherry: Cherry,
  utensils: Utensils,
  tag: Tag,
}

export const ICONE_CATEGORIA_PADRAO = 'tag'

type CategoriaIconProps = {
  icone: string
  className?: string
}

export function CategoriaIcon({ icone, className }: CategoriaIconProps) {
  const Icon = ICONES_CATEGORIA[icone] ?? ICONES_CATEGORIA[ICONE_CATEGORIA_PADRAO]
  return <Icon className={className} />
}

type IconeCategoriaPickerProps = {
  value: string
  onValueChange: (icone: string) => void
}

export function IconeCategoriaPicker({ value, onValueChange }: IconeCategoriaPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {Object.entries(ICONES_CATEGORIA).map(([chave, Icon]) => (
        <Button
          key={chave}
          type="button"
          variant={chave === value ? 'default' : 'outline'}
          size="icon-sm"
          title={chave}
          onClick={() => onValueChange(chave)}
          className={cn(chave === value && 'ring-2 ring-ring ring-offset-1')}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  )
}
