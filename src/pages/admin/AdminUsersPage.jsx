import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  Search, RefreshCw, ChevronUp, ChevronDown, ExternalLink, Check
} from 'lucide-react'

const PLANS = ['free', 'pro', 'business', 'enterprise']

function PlanBadge({ plan }) {
  const colors = {
    free: 'bg-gray-100 text-gray-600',
    pro: 'bg-indigo-100 text-indigo-700',
    business: 'bg-amber-100 text-amber-700',
    enterprise: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[plan] || colors.free}`}>
      {plan || 'free'}
    </span>
  )
}

function daysSince(date) {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

function LastLogin({ date }) {
  if (!date) return <span className="text-gray-400 text-xs">Kurrë</span>
  const days = daysSince(date)
  const label = days === 0 ? 'Sot' : days === 1 ? '1 ditë' : `${days} ditë`
  const color = days === 0 ? 'text-green-600' : days <= 7 ? 'text-blue-600' : days <= 30 ? 'text-yellow-600' : 'text-red-500'
  return <span className={`text-xs font-medium ${color}`}>{label}</span>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [planChanging, setPlanChanging] = useState({})
  const [planSuccess, setPlanSuccess] = useState({})

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const { data, error: err } = await supabase.rpc('admin_get_all_users')
      if (err) throw err
      setUsers(data || [])
    } catch (err) {
      setError('Gabim: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function changePlan(userId, newPlan) {
    setPlanChanging(prev => ({ ...prev, [userId]: true }))
    try {
      const { error: err } = await supabase.rpc('admin_update_user_plan', {
        target_id: userId,
        new_plan: newPlan,
        notes: `Aktivizuar manualisht nga admin më ${new Date().toLocaleDateString('sq-AL')}`,
      })
      if (err) throw err
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
      setPlanSuccess(prev => ({ ...prev, [userId]: true }))
      setTimeout(() => setPlanSuccess(prev => ({ ...prev, [userId]: false })), 2000)
    } catch (err) {
      alert('Gabim gjatë ndryshimit të planit: ' + err.message)
    } finally {
      setPlanChanging(prev => ({ ...prev, [userId]: false }))
    }
  }

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let list = [...users]
    if (planFilter !== 'all') list = list.filter(u => (u.plan || 'free') === planFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.business_name?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let va = a[sortKey] ?? ''
      let vb = b[sortKey] ?? ''
      if (sortKey === 'last_sign_in_at' || sortKey === 'created_at') {
        va = va ? new Date(va).getTime() : 0
        vb = vb ? new Date(vb).getTime() : 0
      } else {
        va = String(va).toLowerCase()
        vb = String(vb).toLowerCase()
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [users, search, planFilter, sortKey, sortDir])

  function SortIcon({ col }) {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  function Th({ col, children }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
        onClick={() => toggleSort(col)}
      >
        <div className="flex items-center gap-1">
          {children}
          <SortIcon col={col} />
        </div>
      </th>
    )
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Përdoruesit</h1>
          <p className="text-sm text-gray-500">{users.length} biznese të regjistruara</p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rifresko
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kërko sipas emrit, emailit, biznesit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Të gjitha planet</option>
            {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <Th col="full_name">Emri / Email</Th>
                <Th col="business_name">Biznesi</Th>
                <Th col="city">Qyteti</Th>
                <Th col="plan">Plani</Th>
                <Th col="created_at">Regjistruar</Th>
                <Th col="last_sign_in_at">Hyrja e fundit</Th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Ndrysho plan</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Asnjë rezultat</td>
                </tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate max-w-[160px]">{u.full_name || '—'}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 truncate max-w-[140px]">{u.business_name || <span className="text-gray-300">—</span>}</div>
                    {u.industry && <div className="text-xs text-gray-400 truncate max-w-[140px]">{u.industry}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.city || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    {planSuccess[u.id]
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-600"><Check className="w-3 h-3" /> Ruajtur</span>
                      : <PlanBadge plan={u.plan} />
                    }
                    {u.plan_activated_at && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(u.plan_activated_at).toLocaleDateString('sq-AL')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('sq-AL') : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <LastLogin date={u.last_sign_in_at} />
                    {u.last_sign_in_at && (
                      <div className="text-xs text-gray-400">
                        {new Date(u.last_sign_in_at).toLocaleDateString('sq-AL')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.plan || 'free'}
                      onChange={e => changePlan(u.id, e.target.value)}
                      disabled={planChanging[u.id]}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50"
                    >
                      {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors inline-flex"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} nga {users.length} përdorues
          </div>
        )}
      </div>
    </div>
  )
}
