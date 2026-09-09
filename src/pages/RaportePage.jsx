import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  BarChart3, TrendingUp, Scale, Rocket, Briefcase, MessageSquare,
  Calendar, AlertCircle, CheckCircle, Clock, ArrowRight, Target
} from 'lucide-react'

function generateUpcomingDeadlines() {
  const deadlines = []
  const now = new Date()
  for (let m = 0; m < 3; m++) {
    const yr = now.getFullYear() + Math.floor((now.getMonth() + m) / 12)
    const mo = (now.getMonth() + m) % 12
    const ss = new Date(yr, mo, 10)
    const tvsh = new Date(yr, mo, 20)
    const taf = [0, 3, 6, 9].includes(mo) ? new Date(yr, mo, 31) : null

    if (ss > now) deadlines.push({ label: 'Sigurime Shoqërore', date: ss, type: 'ss', color: 'text-blue-600', bg: 'bg-blue-50' })
    if (tvsh > now) deadlines.push({ label: 'Deklarim TVSH', date: tvsh, type: 'tvsh', color: 'text-purple-600', bg: 'bg-purple-50' })
    if (taf && taf > now) deadlines.push({ label: 'Tatim mbi Fitimin', date: taf, type: 'taf', color: 'text-emerald-600', bg: 'bg-emerald-50' })
  }
  return deadlines.sort((a, b) => a.date - b.date).slice(0, 5)
}

function daysUntil(date) {
  return Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24))
}

function profileScore(profile) {
  const fields = ['full_name', 'business_name', 'industry', 'city', 'years_operating', 'employee_count', 'biggest_challenge']
  const filled = fields.filter(f => profile?.[f]).length
  return { score: Math.round((filled / fields.length) * 100), filled, total: fields.length }
}

const MODULES = [
  { label: 'Marketing', href: '/marketing', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Financiar', href: '/financial', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Ligjore', href: '/legal', icon: Scale, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Rritje', href: '/growth', icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'HR & Ekipi', href: '/hr', icon: Briefcase, color: 'text-teal-500', bg: 'bg-teal-50' },
  { label: 'Këshilltari AI', href: '/chat', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
]

export default function RaportePage() {
  const { profile } = useAuth()
  const deadlines = useMemo(generateUpcomingDeadlines, [])
  const { score, filled, total } = useMemo(() => profileScore(profile), [profile])

  const scoreColor = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  const scoreText = score >= 80 ? 'Profil i plotë' : score >= 50 ? 'Profil i pjesshëm' : 'Profil i paplotë'

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-12 -translate-x-10" />
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Raporte & Pasqyra</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg">
            {profile?.business_name
              ? `Pasqyra e gjendjes për ${profile.business_name}.`
              : 'Pasqyra e gjendjes së biznesit tënd.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Profile Completeness */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-gray-400" />
            <h2 className="font-heading font-semibold text-gray-800">Plotësia e Profilit</h2>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-bold text-gray-900">{score}%</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${scoreColor} mb-1`}>{scoreText}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all duration-500 ${scoreColor}`} style={{ width: `${score}%` }} />
          </div>
          <p className="text-xs text-gray-500 mb-3">{filled}/{total} fusha të plotësuara</p>
          {score < 100 && (
            <Link to="/settings" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              Plotëso profilin
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h2 className="font-heading font-semibold text-gray-800">Afatet e Ardhshme</h2>
          </div>
          {deadlines.length === 0 ? (
            <p className="text-sm text-gray-400">Nuk ka afate të ardhshme.</p>
          ) : (
            <div className="space-y-2.5">
              {deadlines.map((d, i) => {
                const days = daysUntil(d.date)
                const urgent = days <= 3
                const soon = days <= 7
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${urgent ? 'bg-rose-500' : soon ? 'bg-amber-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.label}</p>
                        <p className="text-xs text-gray-400">{d.date.toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      urgent ? 'bg-rose-100 text-rose-700' : soon ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {days === 0 ? 'Sot' : days === 1 ? 'Nesër' : `${days}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <Link to="/legal/calendar" className="mt-3 text-xs text-purple-600 font-medium hover:underline flex items-center gap-1 block">
            Shiko kalendarët fiskal
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Module Access Grid */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="font-heading font-semibold text-gray-800">Modulet e Platformës</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MODULES.map(m => (
            <Link key={m.href} to={m.href}>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                <div className={`w-9 h-9 ${m.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <m.icon className={`w-4.5 h-4.5 ${m.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{m.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* GDPR Note */}
      <div className="mt-4 flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
        <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          Të dhënat tuaja ruhen në serverë të BE-së dhe mbrohen sipas rregullores GDPR.
          Mund të eksportoni ose fshini të dhënat në çdo kohë nga <Link to="/settings" className="underline hover:text-slate-700">Cilësimet</Link>.
        </p>
      </div>
    </div>
  )
}
