import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Calculator, TrendingUp, Target, Receipt, Users, FileText, PieChart, ArrowRight, Sparkles } from 'lucide-react'

const tools = [
  { icon: Calculator, title: 'Llogaritës Çmimesh',   desc: 'Fut koston dhe marzhin — merr çmimin optimal dhe pozicionimin psikologjik.',   href: '/financial/pricing',     color: 'text-blue-500',    bg: 'bg-blue-50',    grad: 'from-blue-400 to-indigo-500',      cta: 'Llogarit Çmimin' },
  { icon: BarChart3,  title: 'Pasqyrë Financiare',    desc: 'Regjistro të ardhurat dhe shpenzimet — merr pasqyrën dhe analiza AI.',          href: '/financial/cashflow',    color: 'text-emerald-500', bg: 'bg-emerald-50', grad: 'from-emerald-400 to-teal-500',     cta: 'Shiko Pasqyrën' },
  { icon: TrendingUp, title: 'Projeksione 6-Mujore',  desc: 'AI gjeneron skenarë optimistë, realistë dhe pesimistë bazuar në historikun.',  href: '/financial/projections', color: 'text-violet-500',  bg: 'bg-violet-50',  grad: 'from-violet-400 to-purple-500',    cta: 'Shiko Projeksionet' },
  { icon: Target,     title: 'Analiza Break-Even',    desc: 'Sa njësi duhet të shesësh çdo muaj për të mbuluar kostot? Gjej pikën.',        href: '/financial/breakeven',   color: 'text-rose-500',    bg: 'bg-rose-50',    grad: 'from-rose-400 to-pink-500',        cta: 'Analizoni' },
  { icon: Receipt,    title: 'Llogaritës TVSH',       desc: 'Konverto çmimet me/pa TVSH 20%, llogarit deklarimin tremujor.',                 href: '/financial/vat',         color: 'text-teal-500',    bg: 'bg-teal-50',    grad: 'from-teal-400 to-cyan-500',        cta: 'Llogarit TVSH',       isNew: true },
  { icon: Users,      title: 'Llogaritës Pagash',     desc: 'Bruto → Neto automatikisht. SS, shëndetësor dhe tatimi mbi të ardhurat.',      href: '/financial/payroll',     color: 'text-indigo-500',  bg: 'bg-indigo-50',  grad: 'from-indigo-400 to-blue-500',      cta: 'Llogarit Pagat',      isNew: true },
  { icon: FileText,   title: 'Gjenerues Faturash',    desc: 'Krijo fatura profesionale me TVSH — të gatshme për printim ose PDF.',          href: '/financial/invoice',     color: 'text-amber-500',   bg: 'bg-amber-50',   grad: 'from-amber-400 to-orange-500',     cta: 'Krijo Faturë',        isNew: true },
  { icon: PieChart,   title: 'Analiza ROI',           desc: 'Investo X, merr Y — llogarit kthimin, break-even kohor dhe verdiktin AI.',     href: '/financial/roi',         color: 'text-orange-500',  bg: 'bg-orange-50',  grad: 'from-orange-400 to-amber-500',     cta: 'Analizoni ROI',       isNew: true },
]

export default function FinancialPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full"/>
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white rounded-full"/>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <BarChart3 className="w-7 h-7 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-200"/>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Modul</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">Financiar</h1>
            <p className="text-blue-100 text-sm mt-0.5">Pasqyrë, llogaritës, projeksione dhe fatura me AI</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
            <span className="text-3xl font-bold">8</span>
            <span className="text-xs text-blue-200">mjete aktive</span>
          </div>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(t => (
          <Link key={t.href} to={t.href} className="group block">
            <div className="relative h-full bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-4 overflow-hidden">
              {t.isNew && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full">RI</span>
              )}
              <div className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center`}>
                <t.icon className={`w-6 h-6 ${t.color}`}/>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-gray-900 mb-1.5">{t.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
              </div>
              <div className={`flex items-center text-sm font-semibold bg-gradient-to-r ${t.grad} bg-clip-text text-transparent`}>
                {t.cta} <ArrowRight className={`w-4 h-4 ml-1 ${t.color} transition-transform group-hover:translate-x-0.5`}/>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${t.grad} opacity-0 group-hover:opacity-100 transition-opacity`}/>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
