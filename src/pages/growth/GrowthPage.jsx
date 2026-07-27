import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Activity, Target, DollarSign, BarChart2, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: Activity,
    title: 'Diagnostikë Biznesi',
    desc: 'Analizo gjendjen aktuale të biznesit me SWOT analiz dhe prioritete urgjente nga AI.',
    href: '/growth/diagnostic',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    cta: 'Analizo Tani',
  },
  {
    icon: Target,
    title: 'Plan Rritje 90-Ditor',
    desc: 'Gjenero hapa konkretë dhe të zbatueshëm për 3 muajt e ardhshëm bazuar në qëllimet tua.',
    href: '/growth/plan',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    cta: 'Krijo Planin',
  },
  {
    icon: DollarSign,
    title: 'Mundësi Financimi',
    desc: 'Zbulo grante, kredi dhe investitorë disponibël — AIDA, BE, EBRD, banka dhe mikrofinancë.',
    href: '/growth/funding',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    cta: 'Shiko Mundësitë',
  },
  {
    icon: BarChart2,
    title: 'KPI Dashboard',
    desc: 'Vendos targetat tuaj dhe monitoro progresin mujor me tregues kyç të performancës.',
    href: '/growth/kpi',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    cta: 'Hap Dashboard',
  },
]

export default function GrowthPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Rocket className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">Rritje</h1>
            <p className="text-gray-500 text-sm">Diagnostikë biznesi, plan 90-ditor, financim dhe KPI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.href} to={s.href} className="block">
            <div className="card-hover flex flex-col gap-4 h-full">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
              <div className="flex items-center text-sm font-medium text-primary-500">
                {s.cta}
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
