import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, PartyPopper, Heart, FileBarChart, Bell, CalendarClock, ArrowRight, Sparkles } from 'lucide-react'

const tools = [
  { icon: PartyPopper, title: 'Mirëseardhje Automatike', desc: 'Çdo klient i ri merr mesazh përshëndetje — bëje biznesin të duket profesional.', href: '/automation/welcome',  color: 'text-pink-500',   bg: 'bg-pink-50',   grad: 'from-pink-400 to-rose-500',    cta: 'Konfiguro' },
  { icon: Heart,       title: 'Rikthe Klientët',          desc: 'Klientët që nuk kanë blerë kohët e fundit? Kontaktoji me ofertë të personalizuar.',    href: '/automation/winback',  color: 'text-red-500',    bg: 'bg-red-50',    grad: 'from-red-400 to-rose-500',     cta: 'Konfiguro Win-back' },
  { icon: FileBarChart,title: 'Raport Javor',             desc: 'Çdo herë që hap platformën, merr pamjen e javës — pa fut numra manualisht.',        href: '/automation/report',   color: 'text-slate-500',  bg: 'bg-slate-100',  grad: 'from-slate-500 to-slate-700',  cta: 'Shiko Raportin' },
  { icon: Bell,        title: 'Kujtime & Ndjekje',        desc: 'Mos harro asgjë — kujtime për follow-up, stok, detyra dhe ditëlindje.',              href: '/automation/reminders',color: 'text-violet-500', bg: 'bg-violet-50', grad: 'from-violet-400 to-purple-500',cta: 'Shiko Kujtimet' },
  { icon: CalendarClock,title: 'Postime Automatike',      desc: 'Planifiko çfarë do postosh çdo ditë — AI sugjeron, ti aprovon.',                     href: '/automation/posts',    color: 'text-fuchsia-500',bg: 'bg-fuchsia-50', grad: 'from-fuchsia-400 to-pink-500', cta: 'Planifiko Postimet' },
]

export default function AutomationPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full"/>
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white rounded-full"/>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <Zap className="w-7 h-7 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-200"/>
              <span className="text-xs font-semibold text-fuchsia-200 uppercase tracking-widest">Modul</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">AI Automatizime</h1>
            <p className="text-fuchsia-100 text-sm mt-0.5">Lëre AI-në të punojë për ty — mesazhe, kujtime dhe raporte pa u lodhur</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
            <span className="text-3xl font-bold">5</span>
            <span className="text-xs text-fuchsia-200">mjete aktive</span>
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
