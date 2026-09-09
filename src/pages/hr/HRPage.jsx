import React from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, FileText, MessageSquare, ClipboardList, Star, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: FileText,
    title: 'Gjenerues Përshkrimesh Pune',
    desc: 'Krijo përshkrime profesionale pozicionesh: detyrat, kualifikimet, kushtet dhe si të aplikojnë kandidatët.',
    href: '/hr/job',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    cta: 'Krijo Përshkrim',
  },
  {
    icon: MessageSquare,
    title: 'Pyetje Interviste',
    desc: 'Gjenero pyetje interviste të personalizuara sipas rolit: kompetenca, sjellje, teknikë dhe kulturë kompanie.',
    href: '/hr/interview',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    cta: 'Gjenero Pyetje',
    badge: 'Ri',
  },
  {
    icon: ClipboardList,
    title: 'Plan Onboarding',
    desc: 'Gjenero plan 30-ditor onboarding për punonjës të rinj me detyra javore, objektiva dhe checklist.',
    href: '/hr/onboarding',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    cta: 'Krijo Plan',
    badge: 'Ri',
  },
  {
    icon: Star,
    title: 'Vlerësim Performancë',
    desc: 'Gjenero raport vlerësimi gjithëpërfshirës: arritjet, pikat e forta, fushat e përmirësimit dhe objektivat.',
    href: '/hr/review',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    cta: 'Krijo Vlerësim',
    badge: 'Ri',
  },
]

export default function HRPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-600 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-10 -translate-x-8" />
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">HR & Ekipi</h1>
          <p className="text-teal-100 text-sm sm:text-base max-w-lg">
            Menaxho ekipin tënd me AI: rekrutim, onboarding dhe vlerësim performancë.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
            <Briefcase className="w-3.5 h-3.5" />
            {sections.length} mjete HR
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.href} to={s.href} className="block group">
            <div className="card flex flex-col gap-4 h-full hover:shadow-card-hover transition-shadow duration-200 relative overflow-hidden cursor-pointer">
              {s.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
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
              <div className={`flex items-center text-sm font-medium ${s.color}`}>
                {s.cta}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${s.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
