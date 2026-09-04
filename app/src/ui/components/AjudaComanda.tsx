import { Banknote, HandCoins, Layers, LogOut, Pencil, Users } from 'lucide-react'
import { AjudaPagina } from '@/ui/components/AjudaPagina'

export function AjudaComanda() {
  return (
    <AjudaPagina
      titulo="Como funciona a comanda"
      itens={[
        {
          icone: Users,
          titulo: 'Abas do grupo',
          descricao:
            'A aba "Geral" fecha a conta de todo mundo de uma vez. Cada membro também tem sua própria aba, pra fechar só a conta dele.',
        },
        {
          icone: Layers,
          titulo: 'Extrato ou consolidada',
          descricao:
            'O extrato mostra lançamento a lançamento (troféu = partida, nota = pagamento, mão com moedas = uso de crédito, recibo = consumo). A consolidada resume o consumo do dia por item.',
        },
        {
          icone: HandCoins,
          titulo: 'Usar crédito',
          descricao:
            'Na aba "Geral", quem está com saldo positivo pode ceder parte dele pra ajudar a pagar a dívida de outro membro do grupo.',
        },
        {
          icone: Banknote,
          titulo: 'Registrar pagamento',
          descricao:
            'O valor já vem sugerido com o saldo devedor. Dá pra digitar um valor menor pra registrar um pagamento parcial.',
        },
        {
          icone: LogOut,
          titulo: 'Marcar saída',
          descricao:
            'Quando o pagamento zera o saldo, o sistema pergunta se quer marcar a saída do cliente (ou de todo o grupo, na aba "Geral").',
        },
        {
          icone: Pencil,
          titulo: 'Corrigir ou remover',
          descricao:
            'Abra o menu de um lançamento pra corrigir ou remover. O original nunca é editado: o sistema gera um estorno.',
        },
      ]}
    />
  )
}
