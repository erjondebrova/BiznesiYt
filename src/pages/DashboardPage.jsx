import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  TrendingUp, BarChart3, Scale, Rocket, MessageSquare,
  Lightbulb, ArrowRight, Clock, Sparkles, Plus
} from 'lucide-react'

const modules = [
  {
    icon: TrendingUp, title: "Marketing", href: "/marketing",
    desc: "Plane, content creator, analizë konkurrence",
    color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100",
    available: true,
  },
  {
    icon: BarChart3, title: "Financiar", href: "/financial",
    desc: "Pasqyrë financiare, çmimim, projeksione",
    color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100",
    available: false,
  },
  {
    icon: Scale, title: "Ligjore & Fiskal", href: "/legal",
    desc: "TVSH, deklarata, kalendarë fiskal",
    color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100",
    available: false,
  },
  {
    icon: Rocket, title: "Rritje", href: "/growth",
    desc: "Diagnostikë, plan 90-ditor, financim",
    color: "text-green-500", bg: "bg-green-50", border: "border-green-100",
    available: false,
  },
]

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
        .from('daily_tips')
        .select('*')
        .eq('user_id', userId)
        .eq('generated_date', today)
        .single()

      if (existing) {
        setTip(existing.content)
        setLoading(false)
        return
      }

      const res = await fetch('/api/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile }),
      })

      if (res.ok) {
        const { tip: newTip } = await res.json()
        setTip(newTip)
      } else {
        setTip(generateFallbackTip(profile))
      }
    } catch {
      setTip(generateFallbackTip(profile))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card border-l-4 border-l-amber-400">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card border-l-4 border-l-amber-400 bg-amber-50/30">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">Këshilla e Ditës</div>
          <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  )
}

function generateFallbackTip(profile) {
  const tips = [
    `Për biznese si ${profile?.business_name || 'juaji'}, rishikoni çmimet çdo 6 muaj dhe krahasojini me konkurrentët. Rritja e vogël (5-10%) zakonisht nuk ndikon negativisht tek klientët besnikë.`,
    `Shfrytëzoni kohën e qetë për të mbledhur dëshmi klientësh (testimoniale). Ato rrisin besueshmërinë me 67% sipas studimeve.`,
    `Ruani gjithmonë 3 muaj shpenzime operative si rezervë. Kjo ju mbron nga surprizat e sezonit të dobët.`,
    `Krijoni një listë email me 5 pyetje të shpeshta nga klientët tuaj dhe postoni përgjigjjet si blog/social media. Kosto zero, vlerë e lartë.`,
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

function RecentConversations({ userId }) {
  const [convs, setConvs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase.from('conversations').select('*').eq('user_id', userId)
      .order('updated_at', { ascending: false }).limit(5)
      .then(({ data }) => { setConvs(data || []); setLoading(false) })
  }, [userId])

  if (loading) return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
    </div>
  )

  if (!convs.length) return (
    <div className="text-center py-8 text-gray-400 text-sm">
      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
      Nuk keni biseda ende. Filloni tani!
    </div>
  )

  const moduleLabels = {
    general: 'Këshilla Generale', marketing: 'Marketing',
    financial: 'Financiar', legal: 'Ligjore', growth: 'Rritje',
  }

  return (
    <div className="space-y-2">
      {convs.map(c => (
        <Link key={c.id} to={`/chat/${c.id}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {c.title || 'Bisedë pa titull'}
            </div>
            <div className="text-xs text-gray-400">
              {moduleLabels[c.module] || c.module} · {new Date(c.updated_at).toLocaleDateString('sq-AL')}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0] || 'Mik'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Mirëmëngjes' : hour < 18 ? 'Mirëdita' : 'Mirëmbrëma'

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {profile?.business_name ? `Çfarë bëjmë sot për ${profile.business_name}?` : 'Çfarë bëjmë sot?'}
        </p>
      </div>

      {/* Daily tip */}
      <div className="mb-6">
        <DailyTip userId={user?.id} profile={profile} />
      </div>

      {/* Quick action */}
      <div className="mb-6">
        <Link to="/chat">
          <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-card-hover transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-heading font-semibold text-lg">Pyesni Këshilltarin AI</div>
                <div className="text-primary-200 text-sm mt-0.5">Merrni këshilla konkrete tani</div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/chat">
                  <Button variant="ghost" size="sm" className="text-white border border-white/30 hover:bg-white/10">
                    <Plus className="w-4 h-4" />
                    Bisedë e Re
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Modules */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-gray-900">Modulet</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modules.map(m => (
            <Link key={m.href} to={m.href} className="block">
              <div className={`module-card ${m.border} relative`}>
                {!m.available && (
                  <Badge variant="secondary" className="absolute top-3 right-3 text-xs py-0">
                    Së shpejti
                  </Badge>
                )}
                <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div>
                  <div className="font-heading font-semibold text-gray-900 text-sm">{m.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent conversations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Bisedat e fundit
          </h2>
          <Link to="/chat">
            <Button variant="ghost" size="sm" className="text-xs text-primary-500">
              Shiko të gjitha
            </Button>
          </Link>
        </div>
        <RecentConversations userId={user?.id} />
      </div>
    </div>
  )
}
