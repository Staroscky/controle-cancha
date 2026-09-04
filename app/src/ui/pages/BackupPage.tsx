import { Download, Upload } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/ui/alert-dialog'
import { AjudaPagina } from '@/ui/components/AjudaPagina'
import { Button } from '@/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card'
import { exportarBackup, importarBackup } from '@/data/backupRepo'
import { formatarDataISOSaoPaulo } from '@/domain/rules/formatarDataISOSaoPaulo'

export function BackupPage() {
  const inputArquivoRef = useRef<HTMLInputElement>(null)
  const [arquivoPendente, setArquivoPendente] = useState<File | null>(null)

  function handleExportar() {
    const backup = exportarBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const dataArquivo = formatarDataISOSaoPaulo()
    const link = document.createElement('a')
    link.href = url
    link.download = `bocha-backup-${dataArquivo}.json`
    link.click()

    URL.revokeObjectURL(url)
    toast.success('Backup exportado.')
  }

  function handleSelecionarArquivo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0]
    event.target.value = ''
    if (!arquivo) return
    setArquivoPendente(arquivo)
  }

  async function confirmarImportacao() {
    if (!arquivoPendente) return

    try {
      const texto = await arquivoPendente.text()
      const conteudo = JSON.parse(texto)
      importarBackup(conteudo)
      toast.success('Backup importado. Recarregando...')
      setTimeout(() => window.location.reload(), 800)
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível importar o arquivo.')
    } finally {
      setArquivoPendente(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <h2 className="text-lg font-semibold">Dados</h2>
        <AjudaPagina
          titulo="Como funciona a aba Dados"
          itens={[
            'Todos os dados (clientes, partidas, comandas, catálogo, configurações) ficam salvos só neste dispositivo/navegador, não em um servidor.',
            '"Exportar backup" baixa um arquivo com uma cópia de tudo. Guarde esse arquivo em um lugar seguro (ex.: e-mail, nuvem) periodicamente.',
            '"Importar backup" substitui TODOS os dados atuais deste dispositivo pelos dados do arquivo escolhido. Essa ação não pode ser desfeita, por isso o sistema pede confirmação antes.',
            'Use a importação para restaurar um backup antigo ou para transferir os dados para outro computador/celular.',
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exportar dados</CardTitle>
            <CardDescription>
              Gera um arquivo com todos os clientes, partidas, comandas e configurações deste
              dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={handleExportar}>
              <Download className="size-4" />
              Exportar backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar dados</CardTitle>
            <CardDescription>
              Substitui todos os dados deste dispositivo pelos dados de um arquivo de backup
              exportado anteriormente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={inputArquivoRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleSelecionarArquivo}
            />
            <Button type="button" variant="outline" onClick={() => inputArquivoRef.current?.click()}>
              <Upload className="size-4" />
              Selecionar arquivo de backup
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={arquivoPendente !== null} onOpenChange={(aberto) => !aberto && setArquivoPendente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai apagar todos os dados atuais deste dispositivo ("{arquivoPendente?.name}") e
              substituí-los pelos dados do arquivo selecionado. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarImportacao}>Importar e substituir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
