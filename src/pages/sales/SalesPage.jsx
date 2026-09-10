import React from 'react'
import { Link } from 'react-router-dom'
import { Users, UserPlus, List, GitBranch, MessageCircle, BarChart3, ArrowRight, Sparkles } from 'lucide-react'

const tools = [
  { icon: UserPlus,     title: 'Regjistro Klient',   desc: 'Shto klientë të rinj me të dhëna të organizuara — mos i mbaj më në fletore.', href: '/sales/clients/new', color: 'text-rose-500',   bg: 'bg-rose-50',   grad: 'from-rose-400 to-pink-500',    cta: 'Shto Klient' },
  { icon: List,         title: 'Klientët e Mi',      desc: 'Shiko, kërko dhe filtro të gjithë klientët tu në një vend.',                  href: '/sales/clients',     color: 'text-blue-500',   bg: 'bg-blue-50',   grad: 'from-blue-400 to-indigo-500',  cta: 'Shiko Klientët' },
  { icon: GitBranch,    title: 'Pipeline Shitjesh',  desc: 'Ndiq çdo mundësi shitje — nga interesimi deri te blerja.',                    href: '/sales/pipeline',   color: 'text-emerald-500',bg: 'bg-emerald-50',grad: 'from-emerald-400 to-teal-500', cta: 'Shiko Pipeline' },
  { icon: MessageCircle,title: 'Follow-up Klientësh',desc: 'Krijo mesazhe follow-up të personalizuara — mos lër asnjë klient pa përgjigje.', href: '/sales/followup', color: 'text-amber-500',  bg: 'bg-amber-50',  grad: 'from-amber-400 to-orange-500', cta: 'Shkruaj Follow-up' },
  { icon: BarChart3,    title: 'Analiza Klientësh',  desc: 'Kush janë klientët tu më të mirë? Nga vijnë? Çfarë blejnë më shumë?',         href: '/sales/analysis',   color: 'text-indigo-500', bg: 'bg-indigo-50', grad: 'from-indigo-400 to-violet-500',cta: 'Analizo Klientët' },
]

export default function SalesPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full"/>
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white rounded-full"/>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <Users className="w-7 h-7 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-200"/>
              <span className="text-xs font-semibold text-pink-200 uppercase tracking-widest">Modul</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">Shitje & Klientë</h1>
            <p className="text-pink-100 text-sm mt-0.5">Menaxho klientët, ndjek shitjet dhe mos humb asnjë mundësi</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
            <span className="text-3xl font-bold">5</span>
            <span className="text-xs text-pink-200">mjete aktive</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(t => (
          <Link key={t.href} to={t.href} className="group block">
            <div className="relative h-full bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-4 overflow-hidden">
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
