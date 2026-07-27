import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, FileText, Users, Calendar, Video, Mail, Megaphone, ArrowRight, Sparkles } from 'lucide-react'

const tools = [
  { icon: TrendingUp, title: 'Plan Marketingu',     desc: 'Plan 30-ditor i personalizuar me strategji konkrete për biznesin tënd.',         href: '/marketing/plan',    color: 'text-orange-500', bg: 'bg-orange-50',  grad: 'from-orange-400 to-amber-500',    cta: 'Gjenero Planin' },
  { icon: FileText,   title: 'Krijues Përmbajtjesh', desc: 'Postime për Instagram, Facebook dhe Ads — 3 variante + hashtags gati.',          href: '/marketing/content', color: 'text-blue-500',   bg: 'bg-blue-50',    grad: 'from-blue-400 to-cyan-500',       cta: 'Krijo Përmbajtje' },
  { icon: Users,      title: 'Analizë Konkurrence',  desc: 'Pikat e forta dhe dobësitë e konkurrentëve — mundësitë e tregut për ty.',        href: '/marketing/compete', color: 'text-green-500',  bg: 'bg-green-50',   grad: 'from-green-400 to-emerald-500',   cta: 'Analizo Tregun' },
  { icon: Mail,       title: 'Email Marketing',       desc: '3 variante email — promo, newsletter dhe rikthim klientësh gati për dërgim.',   href: '/marketing/email',   color: 'text-teal-500',   bg: 'bg-teal-50',    grad: 'from-teal-400 to-cyan-500',       cta: 'Shkruaj Email',   isNew: true },
  { icon: Video,      title: 'Skript Video',          desc: 'Skripta virale për TikTok, Reels, YouTube Shorts — hook + trup + CTA.',         href: '/marketing/video',   color: 'text-purple-500', bg: 'bg-purple-50',  grad: 'from-purple-400 to-violet-500',   cta: 'Shkruaj Skript',  isNew: true },
  { icon: Calendar,   title: 'Kalendar Postimesh',    desc: 'Plan mujor i plotë — çdo ditë me ide konkrete për të gjitha kanalet.',           href: '/marketing/calendar',color: 'text-indigo-500', bg: 'bg-indigo-50',  grad: 'from-indigo-400 to-blue-500',     cta: 'Gjenero Kalendar',isNew: true },
  { icon: Megaphone,  title: 'Reklamë Dixhitale',     desc: 'Copy reklamash për Meta, TikTok & Google Ads — 3 variante + targeting.',        href: '/marketing/ads',     color: 'text-violet-500', bg: 'bg-violet-50',  grad: 'from-violet-400 to-purple-500',   cta: 'Shkruaj Reklamë', isNew: true },
]

export default function MarketingPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full"/>
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white rounded-full"/>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <TrendingUp className="w-7 h-7 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200"/>
              <span className="text-xs font-semibold text-yellow-200 uppercase tracking-widest">Modul</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">Marketing</h1>
            <p className="text-orange-100 text-sm mt-0.5">Strategji, përmbajtje dhe reklama të personalizuara me AI</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
            <span className="text-3xl font-bold">7</span>
            <span className="text-xs text-orange-200">mjete aktive</span>
          </div>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(t => (
          <Link key={t.href} to={t.href} className="group block">
            <div className="relative h-full bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-4 overflow-hidden">
              {t.isNew && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full">RI</span>
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
