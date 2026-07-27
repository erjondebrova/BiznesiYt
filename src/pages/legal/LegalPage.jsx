import React from 'react'
import { Link } from 'react-router-dom'
import { Scale, MessageSquare, FileText, Calendar, BookOpen, Users, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: MessageSquare,
    title: 'Këshilltar Ligjor AI',
    desc: 'Pyet çdo pyetje ligjore ose fiskale — kontratat, TVSH-ja, sigurimet, punësimi, të drejtat e biznesit.',
    href: '/legal/advisor',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    cta: 'Pyet Tani',
  },
  {
    icon: FileText,
    title: 'Gjenerues Dokumentash',
    desc: 'Gjenero kontrata profesionale të personalizuara: punësimi, shërbimi, qiraje, NDA, autorizim.',
    href: '/legal/documents',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    cta: 'Krijo Dokument',
  },
  {
    icon: Calendar,
    title: 'Kalendarë Fiskal',
    desc: 'Të gjitha afatet fiskale: TVSH, sigurimet shoqërore, tatimi mbi fitimin, pasqyrat financiare.',
    href: '/legal/calendar',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    cta: 'Shiko Afatet',
  },
  {
    icon: BookOpen,
    title: 'Guidë NIPT & Regjistrim',
    desc: 'Si regjistron biznesin tënd? SH.P.K., Person Fizik, Sh.A. — hapa, dokumente dhe detyrime.',
    href: '/legal/nipt',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    cta: 'Hap Guidën',
  },
  {
    icon: Users,
    title: 'Guidë Punësimi',
    desc: 'Llojet e kontratave, hapat për të punësuar, të drejtat e punonjësve dhe procedura e largimit.',
    href: '/legal/employment',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    cta: 'Hap Guidën',
    isNew: true,
  },
]

export default function LegalPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">Ligjore & Fiskal</h1>
            <p className="text-gray-500 text-sm">Pyetje ligjore, template dokumentash dhe kalendarë fiskal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.href} to={s.href} className="block relative">
            {s.isNew && (
              <span className="absolute top-3 right-3 z-10 text-[10px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">Ri</span>
            )}
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
