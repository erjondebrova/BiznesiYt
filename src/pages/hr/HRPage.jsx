import React from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, FileText, MessageSquare, BookOpen, Star, ArrowRight, Sparkles } from 'lucide-react'

const tools = [
  { icon: FileText,      title: 'Krijues Pozicionesh',    desc: 'Gjenero përshkrime profesionale pozicioni — detyrat, kualifikimet dhe oferta e kompanisë.',   href: '/hr/job',         color: 'text-teal-500',    bg: 'bg-teal-50',    grad: 'from-teal-400 to-cyan-500',      cta: 'Krijo Pozicion' },
  { icon: MessageSquare, title: 'Pyetje Interviste',       desc: 'Pyetje teknike, sjellore dhe situatash — të personalizuara për rolin dhe nivelin e kërkuar.', href: '/hr/interview',   color: 'text-blue-500',    bg: 'bg-blue-50',    grad: 'from-blue-400 to-indigo-500',    cta: 'Gjenero Pyetje' },
  { icon: BookOpen,      title: 'Plan Orientimi',          desc: 'Plan 30-ditor për punonjësin e ri — ditë për ditë me objektiva, burime dhe detyra konkrete.',  href: '/hr/onboarding',  color: 'text-purple-500',  bg: 'bg-purple-50',  grad: 'from-purple-400 to-violet-500',  cta: 'Krijo Planin',   isNew: true },
  { icon: Star,          title: 'Vlerësim Performancë',   desc: 'Shkruaj vlerësime të ekuilibruara dhe profesionale — arritjet, pikat e forta dhe zhvillimin.', href: '/hr/review',      color: 'text-amber-500',   bg: 'bg-amber-50',   grad: 'from-amber-400 to-orange-500',   cta: 'Shkruaj Vlerësim', isNew: true },
]

export default function HRPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-600 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full"/>
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white rounded-full"/>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <Briefcase className="w-7 h-7 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200"/>
              <span className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Modul</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">HR & Ekipi</h1>
            <p className="text-cyan-100 text-sm mt-0.5">Punësim, intervista, orientim dhe vlerësim me AI</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
            <span className="text-3xl font-bold">4</span>
            <span className="text-xs text-cyan-200">mjete aktive</span>
          </div>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map(t => (
          <Link key={t.href} to={t.href} className="group block">
            <div className="relative h-full bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-4 overflow-hidden">
              {t.isNew && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 py-0.5 rounded-full">RI</span>
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
