import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs'
import { Toaster } from '@/ui/components/ui/sonner'
import { AcertoPage } from '@/ui/pages/AcertoPage'
import { ClientesPage } from '@/ui/pages/ClientesPage'
import { ConsumoPage } from '@/ui/pages/ConsumoPage'
import { PartidaPage } from '@/ui/pages/PartidaPage'

function App() {
  return (
    <div className="mx-auto min-h-svh max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Controle de Bocha</h1>

      <Tabs defaultValue="clientes">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="partida">Partida</TabsTrigger>
          <TabsTrigger value="consumo">Consumo</TabsTrigger>
          <TabsTrigger value="acerto">Acerto</TabsTrigger>
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
        <TabsContent value="acerto">
          <AcertoPage />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}

export default App
