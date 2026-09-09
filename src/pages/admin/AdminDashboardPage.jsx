import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  Users, UserCheck, TrendingUp, Clock, AlertTriangle, Star, RefreshCw,
  MessageSquare, BarChart2, Zap, Target, FileText, Scale, Briefcase, LineChart
} from 'lucide-react'

const MODULE_META = {
  chat:        { label: 'Asistent AI',      icon: MessageSquare, color: 'bg-indigo-500' },
  marketing:   { label: 'Marketingu',        icon: Target,        color: 'bg-pink-500'   },
  financial:   { label: 'Financat',          icon: BarChart2,     color: 'bg-emerald-500'},
  legal:       { label: 'Ligjore',           icon: Scale,         color: 'bg-violet-500' },
  growth:      { label: 'Rritja',            icon: TrendingUp,    color: 'bg-orange-500' },
  hr:          { label: 'Burimet Njerëzore', icon: Briefcase,     color: 'bg-cyan-500'   },
  raporte:     { label: 'Raporte',           icon: FileText,      color: 'bg-slate-500'  },
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

function PlanBadge({ plan }) {
  const colors = {
    free:       'bg-gray-100 text-gray-600',
    starter:    'bg-sky-100 text-sky-700',
    pro:        'bg-indigo-100 text-indigo-700',
    business:   'bg-amber-100 text-amber-700',
    enterprise: 'bg-purple-100 text-purple-700',
    custom:     'bg-rose-100 text-rose-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[plan] || colors.free}`}>
      {plan || 'free'}
    </span>
  )
}

function daysSince(date) {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

function UsageStat({ label, value, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-800">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats]           = useState(null)
  const [serviceStats, setServiceStats] = useState(null)
  const [moduleStats, setModuleStats]   = useState([])
  const [topUsers, setTopUsers]         = useState([])
  const [recentUsers, setRecentUsers]   = useState([])
  const [inactiveUsers, setInactiveUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [statsRes, usersRes, serviceRes, moduleRes, topRes] = await Promise.all([
        supabase.rpc('admin_get_stats'),
        supabase.rpc('admin_get_all_users'),
        supabase.rpc('admin_get_service_stats'),
        supabase.rpc('admin_get_module_stats'),
        supabase.rpc('admin_get_top_users_by_usage', { lim: 8 }),
      ])

      if (statsRes.error)   throw statsRes.error
      if (usersRes.error)   throw usersRes.error

      setStats(statsRes.data?.[0] || null)
      setServiceStats(serviceRes.data || null)
      setModuleStats(moduleRes.data || [])
      setTopUsers(topRes.data || [])

      const all = usersRes.data || []
      setRecentUsers(all.slice(0, 8))
      setInactiveUsers(
        all.filter(u => !u.last_sign_in_at || daysSince(u.last_sign_in_at) >= 30).slice(0, 5)
      )
    } catch (err) {
      setError('Gabim gjatë ngarkimit: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const totalUsage = serviceStats
    ? (serviceStats.total_ai_messages || 0) +
      (serviceStats.total_marketing_plans || 0) +
      (serviceStats.total_content_posts || 0) +
      (serviceStats.total_competitor || 0)
    : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Pasqyrë e plotë e platformës</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Rifresko
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Biznese"    value={stats?.total_users}         icon={Users}      color="bg-indigo-500" />
        <StatCard label="Të rinj (7 ditë)" value={stats?.new_this_week}       icon={TrendingUp} color="bg-green-500"  sub={`${stats?.new_this_month} këtë muaj`} />
        <StatCard label="Plan Pro/Business" value={stats?.pro_users}           icon={Star}       color="bg-amber-500"  />
        <StatCard label="Aktiv sot"        value={stats?.active_today}        icon={UserCheck}  color="bg-cyan-500"   />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pasivë 30+ ditë"  value={stats?.inactive_30d}        icon={Clock}        color="bg-gray-400"   />
        <StatCard label="Pa Onboarding"    value={stats?.pending_onboarding}  icon={AlertTriangle} color="bg-orange-500" />
        <StatCard label="Të rinj (30 ditë)" value={stats?.new_this_month}      icon={TrendingUp}   color="bg-violet-500" />
        <StatCard label="Plan falas"       value={stats ? Number(stats.total_users) - Number(stats.pro_users) : null} icon={Users} color="bg-slate-400" />
      </div>

      {/* Service Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform usage totals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            Përdorimi i AI (total platformë)
          </h2>
          <div className="space-y-3">
            <UsageStat
              label="Mesazhe AI (Chat)"
              value={serviceStats?.total_ai_messages || 0}
              total={totalUsage}
              color="bg-indigo-500"
            />
            <UsageStat
              label="Plane Marketingu"
              value={serviceStats?.total_marketing_plans || 0}
              total={totalUsage}
              color="bg-pink-500"
            />
            <UsageStat
              label="Postime Përmbajtjesh"
              value={serviceStats?.total_content_posts || 0}
              total={totalUsage}
              color="bg-emerald-500"
            />
            <UsageStat
              label="Analiza Konkurrence"
              value={serviceStats?.total_competitor || 0}
              total={totalUsage}
              color="bg-orange-500"
            />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">Total bisedat AI</span>
            <span className="text-sm font-bold text-gray-800">{serviceStats?.total_conversations || 0}</span>
          </div>
        </div>

        {/* Module breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            Shërbimet më të Përdorura
          </h2>
          {moduleStats.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Asnjë të dhënë</p>
          ) : (
            <div className="space-y-2.5">
              {moduleStats.map(m => {
                const meta = MODULE_META[m.module] || { label: m.module, color: 'bg-gray-400' }
                const Icon = meta.icon || BarChart2
                const maxCount = moduleStats[0]?.conversation_count || 1
                const pct = Math.round((m.conversation_count / maxCount) * 100)
                return (
                  <div key={m.module}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${meta.color}`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-700">{meta.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-800">{m.conversation_count}</span>
                        <span className="text-xs text-gray-400 ml-1">biseda</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top users by usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-indigo-500" />
            Top Përdoruesit (Sipas Njësive)
          </h2>
          {topUsers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Asnjë të dhënë</p>
          ) : (
            <div className="space-y-2">
              {topUsers.map((u, i) => (
                <Link
                  key={u.id}
                  to={`/admin/users/${u.id}`}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-indigo-100'
                  }`}>
                    <span className={i < 3 ? 'text-white' : 'text-indigo-400'}>{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-800 truncate">{u.full_name || 'Pa emër'}</div>
                    <div className="text-xs text-gray-400 truncate">{u.email}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-indigo-600">{u.total_usage}</div>
                    <div className="text-xs text-gray-400">njësi</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Regjistrimet e fundit</h2>
            <Link to="/admin/users" className="text-xs text-indigo-600 hover:underline">Shiko të gjithë →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Asnjë përdorues</p>
            )}
            {recentUsers.map(u => (
              <Link
                key={u.id}
                to={`/admin/users/${u.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                  {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800 truncate">{u.full_name || 'Pa emër'}</div>
                  <div className="text-xs text-gray-400 truncate">{u.email}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <PlanBadge plan={u.plan} />
                  <span className="text-xs text-gray-400">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('sq-AL') : '—'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Inactive users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Pasivë 30+ ditë</h2>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              {stats?.inactive_30d || 0} total
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {inactiveUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Asnjë</p>
            )}
            {inactiveUsers.map(u => {
              const days = u.last_sign_in_at ? daysSince(u.last_sign_in_at) : null
              return (
                <Link
                  key={u.id}
                  to={`/admin/users/${u.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0">
                    {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800 truncate">{u.full_name || 'Pa emër'}</div>
                    <div className="text-xs text-gray-400 truncate">{u.business_name || u.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-orange-600">
                      {days !== null ? `${days} ditë` : 'Kurrë'}
                    </div>
                    <div className="text-xs text-gray-400">pa hyrë</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
