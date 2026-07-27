import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  BarChart2, Calendar, CheckCircle, AlertCircle, TrendingUp,
  Building2, User, Globe, Target, ArrowRight, Clock, Sparkles,
  FileText, Receipt, Activity
} from 'lucide-react'

function generateUpcomingDeadlines() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const all = []

  // Generate next 3 months of deadlines
  for (let m = month; m <= month + 3; m++) {
    const y = year + Math.floor(m / 12)
    const mo = m % 12

    all.push(
      { date: new Date(y, mo, 10), label: `Sigurimet Shoqërore — ${new Date(y, mo).toLocaleString('sq', { month: 'long' })}`, color: 'text-blue-600', bg: 'bg-blue-50', category: 'SS' },
      { date: new Date(y, mo, 20), label: `Deklarimi TVSH — ${new Date(y, mo).toLocaleString('sq', { month: 'long' })}`, color: 'text-purple-600', bg: 'bg-purple-50', category: 'TVSH' },
    )
    if ([2, 5, 8, 11].includes(mo)) {
      all.push({ date: new Date(y, mo, 31), label: `Tatimi mbi Fitimin — Q${Math.floor(mo / 3) + 1}`, color: 'text-rose-600', bg: 'bg-rose-50', category: 'TAF' })
    }
  }

  return all
    .filter(d => d.date >= now)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5)
}

function daysUntil(date) {
  return Math.ceil((date - new Date()) / 86400000)
}

function ProfileCompleteness({ profile }) {
  const fields = [
    { key: 'full_name', label: 'Emri i plotë' },
    { key: 'phone', label: 'Telefoni' },
    { key: 'business_name', label: 'Emri i biznesit' },
    { key: 'industry', label: 'Industria' },
    { key: 'city', label: 'Qyteti' },
    { key: 'website', label: 'Website' },
    { key: 'business_goal', label: 'Qëllimi kryesor' },
    { key: 'biggest_challenge', label: 'Sfida kryesore' },
  ]
  const filled = fields.filter(f => profile?.[f.key])
  const pct = Math.round((filled.length / fields.length) * 100)
  const missing = fields.filter(f => !profile?.[f.key])

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400"/>
          <span className="font-heading font-semibold text-gray-900 text-sm">Plotësia e Profilit</span>
        </div>
        <span className={`text-lg font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : pct >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-rose-400 to-pink-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {missing.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 font-medium">Fushat që mungojnë:</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map(f => (
              <span key={f.key} className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">{f.label}</span>
            ))}
          </div>
        </div>
      )}
      <Link to="/settings" className="flex items-center text-xs font-semibold text-primary-500 hover:text-primary-600">
        Plotëso profilin <ArrowRight className="w-3.5 h-3.5 ml-1"/>
      </Link>
    </div>
  )
}

function DeadlineItem({ deadline }) {
  const days = daysUntil(deadline.date)
  const urgency = days <= 3 ? 'text-rose-600 bg-rose-50' : days <= 7 ? 'text-amber-600 bg-amber-50' : 'text-gray-500 bg-gray-50'
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 ${deadline.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Calendar className={`w-4 h-4 ${deadline.color}`}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{deadline.label}</p>
        <p className="text-xs text-gray-400">{deadline.date.toLocaleDateString('sq', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${urgency}`}>
        {days === 0 ? 'Sot' : days === 1 ? 'Nesër' : `${days}d`}
      </span>
    </div>
  )
}

const QUICK_LINKS = [
  { icon: Receipt,    label: 'Llogarit TVSH',    href: '/financial/vat',     color: 'text-teal-500',    bg: 'bg-teal-50' },
  { icon: FileText,   label: 'Krijo Faturë',     href: '/financial/invoice', color: 'text-amber-500',   bg: 'bg-amber-50' },
  { icon: TrendingUp, label: 'Plan Marketingu',   href: '/marketing/plan',    color: 'text-orange-500',  bg: 'bg-orange-50' },
  { icon: Activity,   label: 'Diagnostikë',      href: '/growth/diagnostic', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Globe,      label: 'Gjenerues Dokumentash', href: '/legal/documents', color: 'text-blue-500',  bg: 'bg-blue-50' },
  { icon: Target,     label: 'KPI Dashboard',    href: '/growth/kpi',        color: 'text-purple-500',  bg: 'bg-purple-50' },
]

export default function RaportePage() {
  const { profile } = useAuth()
  const deadlines = useMemo(() => generateUpcomingDeadlines(), [])

  const businessInfo = [
    { label: 'Biznesi', value: profile?.business_name || '—' },
    { label: 'Industria', value: profile?.industry || '—' },
    { label: 'Qyteti', value: profile?.city || '—' },
    { label: 'Plan', value: profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free' },
    { label: 'Qëllimi', value: profile?.business_goal || '—' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full"/>
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white rounded-full"/>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <BarChart2 className="w-7 h-7 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-300"/>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Pasqyrë</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">Raporte & Përmbledhje</h1>
            <p className="text-slate-300 text-sm mt-0.5">Gjendja e biznesit, afatet fiskale dhe lidhjet e shpejta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Business snapshot */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-gray-400"/>
              <span className="font-heading font-semibold text-gray-900 text-sm">Snapshoti i Biznesit</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {businessInfo.map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                </div>
              ))}
            </div>
            {profile?.biggest_challenge && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-600 font-medium mb-0.5">Sfida kryesore</p>
                <p className="text-sm text-gray-700">{profile.biggest_challenge}</p>
              </div>
            )}
          </div>

          {/* Profile completeness */}
          <ProfileCompleteness profile={profile}/>

          {/* Quick links */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-400"/>
              <span className="font-heading font-semibold text-gray-900 text-sm">Lidhje të Shpejta</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_LINKS.map(l => (
                <Link key={l.href} to={l.href}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                  <div className={`w-8 h-8 ${l.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <l.icon className={`w-4 h-4 ${l.color}`}/>
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — fiscal deadlines */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400"/>
                <span className="font-heading font-semibold text-gray-900 text-sm">Afatet Fiskale</span>
              </div>
              <Link to="/legal/calendar" className="text-xs text-primary-500 font-medium hover:text-primary-600">Të gjitha</Link>
            </div>
            {deadlines.length > 0 ? (
              <div>
                {deadlines.map((d, i) => <DeadlineItem key={i} deadline={d}/>)}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Asnjë afat i afërt</p>
            )}
          </div>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-500"/>
              <span className="font-heading font-semibold text-primary-700 text-sm">Këshilla e Ditës</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Bizneset që mbajnë fluksin e parasë të dokumentuar çdo muaj kanë 40% më shumë gjasa të marrin kredi bankare.
            </p>
            <Link to="/financial/cashflow" className="mt-3 flex items-center text-xs font-semibold text-primary-500 hover:text-primary-600">
              Hap Pasqyrën Financiare <ArrowRight className="w-3.5 h-3.5 ml-1"/>
            </Link>
          </div>

          {/* Module status */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-gray-400"/>
              <span className="font-heading font-semibold text-gray-900 text-sm">Modulet Aktive</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Marketing',     href: '/marketing', color: 'bg-orange-400',  count: 7 },
                { label: 'Financiar',     href: '/financial', color: 'bg-blue-500',    count: 8 },
                { label: 'Ligjore',       href: '/legal',     color: 'bg-purple-500',  count: 5 },
                { label: 'Rritje',        href: '/growth',    color: 'bg-emerald-500', count: 4 },
              ].map(m => (
                <Link key={m.href} to={m.href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-2 h-2 rounded-full ${m.color} flex-shrink-0`}/>
                  <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900">{m.label}</span>
                  <span className="text-xs text-gray-400">{m.count} mjete</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500"/>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
