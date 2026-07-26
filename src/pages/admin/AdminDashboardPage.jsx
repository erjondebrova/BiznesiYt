import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  Users, UserCheck, TrendingUp, Clock, AlertTriangle, Star, RefreshCw
} from 'lucide-react'

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
    free: 'bg-gray-100 text-gray-600',
    pro: 'bg-indigo-100 text-indigo-700',
    business: 'bg-amber-100 text-amber-700',
    enterprise: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[plan] || colors.free}`}>
      {plan || 'free'}
    </span>
  )
}

function daysSince(date) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [inactiveUsers, setInactiveUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [statsRes, usersRes] = await Promise.all([
        supabase.rpc('admin_get_stats'),
        supabase.rpc('admin_get_all_users'),
      ])

      if (statsRes.error) throw statsRes.error
      if (usersRes.error) throw usersRes.error

      setStats(statsRes.data?.[0] || null)

      const all = usersRes.data || []
      setRecentUsers(all.slice(0, 8))
      setInactiveUsers(
        all
          .filter(u => !u.last_sign_in_at || daysSince(u.last_sign_in_at) >= 30)
          .slice(0, 5)
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Biznese" value={stats?.total_users} icon={Users} color="bg-indigo-500" />
        <StatCard label="Të rinj (7 ditë)" value={stats?.new_this_week} icon={TrendingUp} color="bg-green-500" sub={`${stats?.new_this_month} këtë muaj`} />
        <StatCard label="Plan Pro/Business" value={stats?.pro_users} icon={Star} color="bg-amber-500" />
        <StatCard label="Aktiv sot" value={stats?.active_today} icon={UserCheck} color="bg-cyan-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pasivë 30+ ditë" value={stats?.inactive_30d} icon={Clock} color="bg-gray-400" />
        <StatCard label="Pa Onboarding" value={stats?.pending_onboarding} icon={AlertTriangle} color="bg-orange-500" />
        <StatCard label="Të rinj (30 ditë)" value={stats?.new_this_month} icon={TrendingUp} color="bg-violet-500" />
        <StatCard label="Plan falas" value={stats ? Number(stats.total_users) - Number(stats.pro_users) : null} icon={Users} color="bg-slate-400" />
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
