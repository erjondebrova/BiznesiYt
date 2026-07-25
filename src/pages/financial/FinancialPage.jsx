import React from 'react'
import PlaceholderPage from '../PlaceholderPage'
import { BarChart3, PieChart, TrendingUp, Calculator, FileSpreadsheet } from 'lucide-react'

export default function FinancialPage() {
  return (
    <PlaceholderPage
      title="Financiar"
      icon={BarChart3}
      color="text-blue-500"
      bg="bg-blue-50"
      description="Pasqyrë financiare, llogaritës çmimesh dhe projeksione"
      features={[
        { icon: PieChart, title: "Pasqyrë Financiare", desc: "Grafiqe dhe raporte mujore" },
        { icon: Calculator, title: "Llogaritës Çmimesh", desc: "Gjej çmimin optimal" },
        { icon: TrendingUp, title: "Projeksione", desc: "Parashiko fluksin e parasë" },
        { icon: FileSpreadsheet, title: "Import CSV", desc: "Ngarko të dhënat tuaja" },
      ]}
    />
  )
}
