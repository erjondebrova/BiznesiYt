import React from 'react'
import PlaceholderPage from '../PlaceholderPage'
import { Rocket, Activity, Target, DollarSign } from 'lucide-react'

export default function GrowthPage() {
  return (
    <PlaceholderPage
      title="Rritje"
      icon={Rocket}
      color="text-green-500"
      bg="bg-green-50"
      description="Diagnostikë biznesi, plan 90-ditor dhe mundësi financimi"
      features={[
        { icon: Activity, title: "Diagnostikë Biznesi", desc: "Analizo gjendjen aktuale" },
        { icon: Target, title: "Plan Rritje 90-ditor", desc: "Hapa konkrete per rritje" },
        { icon: DollarSign, title: "Mundësi Financimi", desc: "Grante, kredi, investitorë" },
        { icon: Rocket, title: "KPI Dashboard", desc: "Monitorimi i progresit" },
      ]}
    />
  )
}
