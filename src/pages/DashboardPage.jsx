import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import {
  TrendingUp, BarChart3, Scale, Rocket, MessageSquare,
  Lightbulb, ArrowRight, Clock, Sparkles, Plus,
  FileText, Calculator, Calendar, Activity, Target,
  DollarSign, Megaphone, Zap, ChevronRight
} from 'lucide-react'

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-rose-500 to-pink-600',
  ]
  const color = colors[(name || '').charCodeAt(0) % colors.length]
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Daily Tip ────────────────────────────────────────────────────────────────
function DailyTip({ userId, profile }) {
  const [tip, setTip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    loadTip()
  }, [userId])

  async function loadTip() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('daily_tips').select('*')
        .eq('user_id', userId).eq('generated_date', today).single()
      if (existing) { setTip(existing.content); setLoading(false); return }
      const res = await fetch('/api/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile }),
      })
      setTip(res.ok ? (await res.json()).tip : fallbackTip(profile))
    } catch { setTip(fallbackTip(profile)) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="flex items-start gap-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-100 animate-pulse">
      <div className="w-9 h-9 bg-amber-200 rounded-xl flex-shrink-0"/>
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-2.5 bg-amber-200 rounded w-1/3"/>
        <div className="h-2.5 bg-amber-100 rounded w-full"/>
        <div className="h-2.5 bg-amber-100 rounded w-4/5"/>
      </div>
    </div>
  )

  return (
    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
      <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Lightbulb className="w-5 h-5 text-amber-600"/>
      </div>
      <div>
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Këshilla e Ditës</p>
        <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
      </div>
    </div>
  )
}

function fallbackTip(profile) {
  const tips = [
    `Rishikoni çmimet çdo 6 muaj dhe krahasojini me konkurrentët. Rritja e vogël 5–10% zakonisht nuk ndikon negativisht tek klientët besnikë.`,
    `Mbledhja e dëshmive të klientëve (testimoniale) rrit besueshmërinë me 67%. Dedikoni 10 minuta sot për t'u kërkuar 2–3 klientëve.`,
    `Ruani gjithmonë 3 muaj shpenzime operative si rezervë. Kjo ju mbron nga surprizat e sezonit të dobët.`,
    `Krijoni një listë email me pyetjet e shpeshta nga klientët dhe postojini si përmbajtje social media. Kosto zero, vlerë e lartë.`,
    `Një plan i thjeshtë marketingu me 3 hapa konkrete ia vlen shumë më tepër se 10 ide të paimplementuara.`,
  ]
  return tips[new Date().getDate() % tips.length]
}

// ─── Recent Conversations ─────────────────────────────────────────────────────
function RecentConversations({ userId }) {
  const [convs, setConvs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase.from('conversations').select('*').eq('user_id', userId)
      .order('updated_at', { ascending: false }).limit(4)
      .then(({ data }) => { setConvs(data || []); setLoading(false) })
  }, [userId])

  const moduleColors = {
    general: 'bg-gray-100 text-gray-600',
    marketing: 'bg-orange-100 text-orange-600',
    financial: 'bg-blue-100 text-blue-600',
    legal: 'bg-purple-100 text-purple-600',
    growth: 'bg-green-100 text-green-600',
  }
  const moduleLabels = {
    general: 'Gjenerale', marketing: 'Marketing',
    financial: 'Financiar', legal: 'Ligjore', growth: 'Rritje',
  }

  if (loading) return (
    <div className="space-y-2">
      {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
    </div>
  )

  if (!convs.length) return (
    <div className="text-center py-8 text-gray-400">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <MessageSquare className="w-6 h-6 opacity-40"/>
      </div>
      <p className="text-sm">Nuk keni biseda ende.</p>
      <Link to="/chat">
        <button className="mt-2 text-xs text-primary-500 font-medium hover:underline">Filloni tani →</button>
      </Link>
    </div>
  )

  return (
    <div className="space-y-1">
      {convs.map(c => (
        <Link key={c.id} to={`/chat/${c.id}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-primary-500"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{c.title || 'Bisedë pa titull'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${moduleColors[c.module] || moduleColors.general}`}>
                {moduleLabels[c.module] || c.module}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(c.updated_at).toLocaleDateString('sq-AL')}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors"/>
        </Link>
      ))}
    </div>
  )
}

// ─── Modules ──────────────────────────────────────────────────────────────────
const MODULES = [
  {
    icon: TrendingUp, title: 'Marketing', href: '/marketing',
    desc: 'Plane, content, konkurrencë',
    gradient: 'from-orange-400 to-amber-500',
    lightBg: 'bg-orange-50', lightIcon: 'text-orange-500',
  },
  {
    icon: BarChart3, title: 'Financiar', href: '/financial',
    desc: 'TVSH, pagat, projeksione',
    gradient: 'from-blue-400 to-indigo-500',
    lightBg: 'bg-blue-50', lightIcon: 'text-blue-500',
  },
  {
    icon: Scale, title: 'Ligjore & Fiskal', href: '/legal',
    desc: 'Kontrata, kalendarë, NIPT',
    gradient: 'from-purple-400 to-violet-500',
    lightBg: 'bg-purple-50', lightIcon: 'text-purple-500',
  },
  {
    icon: Rocket, title: 'Rritje', href: '/growth',
    desc: 'Diagnostikë, plan, financim',
    gradient: 'from-emerald-400 to-teal-500',
    lightBg: 'bg-emerald-50', lightIcon: 'text-emerald-500',
  },
]

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'Pyet AI',       href: '/chat',                  color: 'bg-primary-50 text-primary-600' },
  { icon: Megaphone,     label: 'Plan Marketing', href: '/marketing/plan',        color: 'bg-orange-50 text-orange-600' },
  { icon: FileText,      label: 'Krijo Kontratë', href: '/legal/documents',       color: 'bg-purple-50 text-purple-600' },
  { icon: Calculator,    label: 'Llogaritës TVSH',href: '/financial/vat',         color: 'bg-blue-50 text-blue-600' },
  { icon: FileText,      label: 'Gjenero Faturë', href: '/financial/invoice',     color: 'bg-sky-50 text-sky-600' },
  { icon: Activity,      label: 'Diagnostikë',    href: '/growth/diagnostic',     color: 'bg-emerald-50 text-emerald-600' },
  { icon: Calendar,      label: 'Afatet Fiskale', href: '/legal/calendar',        color: 'bg-rose-50 text-rose-600' },
  { icon: Target,        label: 'Plan 90 Ditë',   href: '/growth/plan',           color: 'bg-amber-50 text-amber-600' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0] || 'Mik'
  const [convCount, setConvCount] = useState(null)

  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Natën e mirë' : hour < 12 ? 'Mirëmëngjes' : hour < 18 ? 'Mirëdita' : 'Mirëmbrëma'
  const greetEmoji = hour < 12 ? '☀️' : hour < 18 ? '👋' : '🌙'

  const daysSince = useMemo(() => {
    if (!profile?.created_at) return null
    return Math.floor((Date.now() - new Date(profile.created_at)) / 86400000)
  }, [profile?.created_at])

  useEffect(() => {
    if (!user?.id) return
    supabase.from('conversations').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setConvCount(count || 0))
  }, [user?.id])

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"/>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full translate-y-1/2 -translate-x-1/2"/>
        </div>
        <div className="relative flex items-center gap-4">
          <Avatar name={profile?.full_name} size="lg"/>
          <div className="flex-1 min-w-0">
            <p className="text-primary-200 text-xs font-medium mb-0.5">{greeting} {greetEmoji}</p>
            <h1 className="font-heading text-2xl font-bold truncate">{firstName}!</h1>
            <div className="flex items-center flex-wrap gap-2 mt-1.5">
              {profile?.business_name && (
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
                  {profile.business_name}
                </span>
              )}
              {profile?.industry && (
                <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-primary-100">
                  {profile.industry}
                </span>
              )}
            </div>
          </div>
          <Link to="/chat">
            <button className="shrink-0 flex items-center gap-2 bg-white text-primary-600 font-semibold text-sm px-4 py-2 rounded-xl shadow hover:shadow-md transition-all hover:scale-105">
              <Plus className="w-4 h-4"/>
              <span className="hidden sm:inline">Bisedë e Re</span>
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="relative mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Biseda gjithsej', value: convCount ?? '–' },
            { label: 'Ditë aktiv', value: daysSince ?? '–' },
            { label: 'Plani', value: profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-2xl px-3 py-2.5 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-primary-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Daily Tip ── */}
      <DailyTip userId={user?.id} profile={profile}/>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500"/>
          <h2 className="font-heading font-semibold text-gray-900 text-sm">Veprime të Shpejta</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.href} to={a.href} className="flex flex-col items-center gap-1.5 group">
              <div className={`w-12 h-12 ${a.color} rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-md`}>
                <a.icon className="w-5 h-5"/>
              </div>
              <span className="text-[10px] text-gray-500 text-center font-medium leading-tight group-hover:text-gray-800">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Modules ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-gray-900 text-sm">Modulet</h2>
          <span className="text-[10px] text-gray-400">4 module aktive</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {MODULES.map(m => (
            <Link key={m.href} to={m.href} className="group">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`w-10 h-10 ${m.lightBg} rounded-xl flex items-center justify-center mb-3`}>
                  <m.icon className={`w-5 h-5 ${m.lightIcon}`}/>
                </div>
                <p className="font-heading font-semibold text-gray-900 text-sm">{m.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.desc}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}/>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent conversations ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400"/>
            Bisedat e fundit
          </h2>
          <Link to="/chat">
            <button className="text-xs text-primary-500 font-medium hover:underline">Shiko të gjitha</button>
          </Link>
        </div>
        <RecentConversations userId={user?.id}/>
      </div>

    </div>
  )
}
