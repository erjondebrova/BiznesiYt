import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Calculator, TrendingUp, Target, Receipt, Users, FileText, PieChart, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: Calculator,
    title: 'Llogaritës Çmimesh',
    desc: 'Fut koston dhe marzhin — merr çmimin optimal, pozicionimin dhe këshilla çmimesh psikologjike.',
    href: '/financial/pricing',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    cta: 'Llogarit Çmimin',
  },
  {
    icon: BarChart3,
    title: 'Pasqyrë Financiare',
    desc: 'Regjistro të ardhurat dhe shpenzimet mujore — merr pasqyrën dhe analiza AI me rekomandime.',
    href: '/financial/cashflow',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    cta: 'Shiko Pasqyrën',
  },
  {
    icon: TrendingUp,
    title: 'Projeksione 6-Mujore',
    desc: 'Bazuar në historikun tuaj, AI gjeneron skenarë optimistë, realistë dhe pesimistë.',
    href: '/financial/projections',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    cta: 'Shiko Projeksionet',
  },
  {
    icon: Target,
    title: 'Analiza Break-Even',
    desc: 'Sa njësi duhet të shesësh çdo muaj për të mbuluar kostot? Gjej pikën e ekuilibrit.',
    href: '/financial/breakeven',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    cta: 'Analizoni Break-Even',
  },
  {
    icon: Receipt,
    title: 'Llogaritës TVSH',
    desc: 'Konverto çmimet me/pa TVSH 20%, llogarit deklarimin tremujor dhe shiko regjimin fiskal.',
    href: '/financial/vat',
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    cta: 'Llogarit TVSH',
    badge: 'Ri',
  },
  {
    icon: Users,
    title: 'Llogaritës Pagash',
    desc: 'Bruto → Neto automatikisht. Sigurime shoqërore, shëndetësore dhe tatimi mbi të ardhurat.',
    href: '/financial/payroll',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    cta: 'Llogarit Pagat',
    badge: 'Ri',
  },
  {
    icon: FileText,
    title: 'Gjenerues Faturash',
    desc: 'Krijo fatura profesionale me TVSH, klient dhe artikuj — të gatshme për printim ose PDF.',
    href: '/financial/invoice',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    cta: 'Krijo Faturë',
    badge: 'Ri',
  },
  {
    icon: PieChart,
    title: 'Analiza ROI',
    desc: 'Investo X, merr Y çdo muaj — llogarit kthimin, break-even kohor dhe merr verdiktin AI.',
    href: '/financial/roi',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    cta: 'Analizoni ROI',
    badge: 'Ri',
  },
]

export default function FinancialPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">Financiar</h1>
            <p className="text-gray-500 text-sm">Pasqyrë financiare, llogaritës çmimesh dhe projeksione</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(s => (
          <Link key={s.href} to={s.href} className="block">
            <div className="card-hover flex flex-col gap-4 h-full relative overflow-hidden">
              {s.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  {s.badge}
                </span>
              )}
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
