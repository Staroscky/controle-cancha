import { Banknote, BarChart3, DatabaseBackup, Receipt, Trophy, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs'
import { Toaster } from '@/ui/components/ui/sonner'
import { BackupPage } from '@/ui/pages/BackupPage'
import { ClientesPage } from '@/ui/pages/ClientesPage'
import { ComandasPage } from '@/ui/pages/ComandasPage'
import { ConsumoPage } from '@/ui/pages/ConsumoPage'
import { EstatisticasPage } from '@/ui/pages/EstatisticasPage'
import { PartidaPage } from '@/ui/pages/PartidaPage'

function App() {
  return (
    <div className="mx-auto min-h-svh max-w-7xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Controle de Bocha</h1>

      <Tabs defaultValue="clientes">
        <TabsList className="grid w-full max-w-3xl grid-cols-6">
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
          <TabsTrigger value="estatisticas">
            <BarChart3 className="size-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="backup">
            <DatabaseBackup className="size-4" />
            Dados
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
        <TabsContent value="estatisticas">
          <EstatisticasPage />
        </TabsContent>
        <TabsContent value="backup">
          <BackupPage />
        </TabsContent>
      </Tabs>

      <Toaster position="bottom-center" closeButton />
    </div>
  )
}

export default App
