import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, FileText, Users, Calendar, Video, Mail, Megaphone, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: TrendingUp,
    title: 'Plan Marketingu',
    desc: 'Gjenero një plan 30-ditor të personalizuar me strategji konkrete për biznesin tënd.',
    href: '/marketing/plan',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    cta: 'Gjenero Planin',
    badge: null,
  },
  {
    icon: FileText,
    title: 'Krijues Përmbajtjesh',
    desc: 'Krijo postime për Instagram, Facebook, Google Ads dhe SMS me 3 variante + hashtags.',
    href: '/marketing/content',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    cta: 'Krijo Përmbajtje',
    badge: null,
  },
  {
    icon: Users,
    title: 'Analizë Konkurrence',
    desc: 'Zbulo pikat e forta, dobësitë e konkurrentëve dhe mundësitë e tregut për ty.',
    href: '/marketing/compete',
    color: 'text-green-500',
    bg: 'bg-green-50',
    cta: 'Analizoni Tregut',
    badge: null,
  },
  {
    icon: Mail,
    title: 'Email Marketing',
    desc: '3 variante email gati për dërgim — promo, newsletter, rikthim klientësh dhe më shumë.',
    href: '/marketing/email',
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    cta: 'Shkruaj Email',
    badge: 'Ri',
  },
  {
    icon: Video,
    title: 'Skript Video',
    desc: 'Skripta virale për TikTok, Reels dhe YouTube Shorts — hook, trupi dhe CTA gati.',
    href: '/marketing/video',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    cta: 'Shkruaj Skript',
    badge: 'Ri',
  },
  {
    icon: Calendar,
    title: 'Kalendar Përmbajtjesh',
    desc: 'Plan mujor i postimeve për të gjitha kanalet — çdo ditë e planifikuar me ide konkrete.',
    href: '/marketing/calendar',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    cta: 'Gjenero Kalendar',
    badge: 'Ri',
  },
  {
    icon: Megaphone,
    title: 'Reklamë Dixhitale',
    desc: 'Copy reklamash për Facebook, Instagram, TikTok dhe Google Ads — 3 variante + targeting.',
    href: '/marketing/ads',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    cta: 'Shkruaj Reklamë',
    badge: 'Ri',
  },
]

export default function MarketingPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">Marketing</h1>
            <p className="text-gray-500 text-sm">Strategji dhe përmbajtje të personalizuara</p>
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
