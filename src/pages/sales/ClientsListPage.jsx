import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/input'
import { ArrowLeft, Search, UserPlus, Phone, Mail, Loader2, Users, TrendingUp, AlertCircle, X } from 'lucide-react'

const CATEGORY_META = {
  new:     { label: 'I Ri',      color: 'bg-blue-100 text-blue-700' },
  regular: { label: 'I Rregullt',color: 'bg-emerald-100 text-emerald-700' },
  lead:    { label: 'Lead',      color: 'bg-amber-100 text-amber-700' },
  vip:     { label: 'VIP',       color: 'bg-violet-100 text-violet-700' },
}

export default function ClientsListPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const filtered = useMemo(() => {
    return clients.filter(c => {
      if (filter !== 'all' && c.category !== filter) return false
      if (search && !`${c.full_name} ${c.phone || ''}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [clients, search, filter])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = clients.filter(c => new Date(c.created_at).getMonth() === now.getMonth() && new Date(c.created_at).getFullYear() === now.getFullYear()).length
    const leads = clients.filter(c => c.category === 'lead').length
    const needsAttention = clients.filter(c => {
      if (c.category === 'lead') {
        const days = (now - new Date(c.created_at)) / 86400000
        return days >= 3
      }
      return false
    })
    const sourceCounts = {}
    clients.forEach(c => { if (c.source) sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1 })
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]
    return { total: clients.length, thisMonth, leads, needsAttention, topSource: topSource?.[0] }
  }, [clients])

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-300"/></div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Klientët e Mi</h1>
            <p className="text-xs text-gray-400 mt-0.5">{stats.total} klientë të regjistruar</p>
          </div>
        </div>
        <Link to="/sales/clients/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl">
            <UserPlus className="w-4 h-4"/>Shto Klient
          </button>
        </Link>
      </div>

      {/* Stats */}
      {clients.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card py-3"><p className="text-xs text-gray-400">Total Klientë</p><p className="text-xl font-bold text-gray-900">{stats.total}</p></div>
          <div className="card py-3"><p className="text-xs text-gray-400">Këtë Muaj</p><p className="text-xl font-bold text-emerald-600">+{stats.thisMonth}</p></div>
          <div className="card py-3"><p className="text-xs text-gray-400">Leads Pa Konvertuar</p><p className="text-xl font-bold text-amber-600">{stats.leads}</p></div>
          <div className="card py-3"><p className="text-xs text-gray-400">Burimi Kryesor</p><p className="text-sm font-bold text-gray-900 truncate">{stats.topSource || '—'}</p></div>
        </div>
      )}

      {stats.needsAttention?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0"/>
          <p className="text-xs text-amber-700">
            Ke <strong>{stats.needsAttention.length}</strong> leads që s'i ke kontaktuar 3+ ditë.
            {' '}<Link to="/sales/followup" className="underline font-medium">Krijo mesazhe follow-up →</Link>
          </p>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2"/>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko emër ose telefon..." className="pl-9"/>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {['all', 'new', 'regular', 'lead', 'vip'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === f ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {f === 'all' ? 'Të Gjithë' : CATEGORY_META[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3"/>
          <p className="text-sm text-gray-400">{clients.length === 0 ? 'Nuk ke ende klientë të regjistruar.' : 'Nuk u gjet asnjë klient me këto filtra.'}</p>
          {clients.length === 0 && <Link to="/sales/clients/new" className="text-rose-600 text-sm font-semibold hover:underline mt-2 inline-block">Shto klientin e parë →</Link>}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map(c => (
              <button key={c.id} onClick={() => setSelected(c)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {c.full_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.phone || 'pa telefon'} {c.interest ? `· ${c.interest}` : ''}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${CATEGORY_META[c.category]?.color}`}>
                  {CATEGORY_META[c.category]?.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-base font-bold">
                  {selected.full_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.full_name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_META[selected.category]?.color}`}>{CATEGORY_META[selected.category]?.label}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="space-y-2 text-sm">
              {selected.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-300"/>{selected.phone}</div>}
              {selected.email && <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-300"/>{selected.email}</div>}
              {selected.source && <div className="text-gray-500">Burimi: <span className="text-gray-700">{selected.source}</span></div>}
              {selected.interest && <div className="text-gray-500">Interesi: <span className="text-gray-700">{selected.interest}</span></div>}
              {selected.notes && <div className="bg-gray-50 rounded-lg p-3 text-gray-600 text-xs">{selected.notes}</div>}
              <div className="text-xs text-gray-400">Regjistruar: {new Date(selected.created_at).toLocaleDateString('sq-AL')}</div>
            </div>
            <div className="flex gap-2 pt-2">
              <Link to="/sales/followup" className="flex-1"><button className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl">Krijo Follow-up</button></Link>
              <Link to="/sales/pipeline" className="flex-1"><button className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-sm font-semibold rounded-xl">Shto në Pipeline</button></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
