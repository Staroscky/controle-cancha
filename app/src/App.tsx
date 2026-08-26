import { Banknote, Receipt, Trophy, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs'
import { Toaster } from '@/ui/components/ui/sonner'
import { ClientesPage } from '@/ui/pages/ClientesPage'
import { ComandasPage } from '@/ui/pages/ComandasPage'
import { ConsumoPage } from '@/ui/pages/ConsumoPage'
import { PartidaPage } from '@/ui/pages/PartidaPage'

function App() {
  return (
    <div className="mx-auto min-h-svh max-w-7xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Controle de Bocha</h1>

      <Tabs defaultValue="clientes">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="clientes">
            <Users className="size-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="partida">
            <Trophy className="size-4" />
            Partida
          </TabsTrigger>
          <TabsTrigger value="consumo">
            <Receipt className="size-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="comandas">
            <Banknote className="size-4" />
            Comandas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clientes">
          <ClientesPage />
        </TabsContent>
        <TabsContent value="partida">
          <PartidaPage />
        </TabsContent>
        <TabsContent value="consumo">
          <ConsumoPage />
        </TabsContent>
        <TabsContent value="comandas">
          <ComandasPage />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}

export default App
