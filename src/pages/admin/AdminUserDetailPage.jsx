import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  ArrowLeft, Building2, MapPin, Users, Star, Calendar, Clock,
  MessageSquare, Check, RefreshCw, ShieldCheck, Zap, Mail
} from 'lucide-react'

const PLANS = ['free', 'pro', 'business', 'enterprise']

function InfoRow({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700 text-right flex-1">{String(value)}</span>
    </div>
  )
}

function PlanBadge({ plan }) {
  const colors = {
    free: 'bg-gray-100 text-gray-600 border-gray-200',
    pro: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    business: 'bg-amber-50 text-amber-700 border-amber-200',
    enterprise: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${colors[plan] || colors.free}`}>
      <Star className="w-3 h-3" />
      {(plan || 'free').charAt(0).toUpperCase() + (plan || 'free').slice(1)}
    </span>
  )
}

function daysSince(date) {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newPlan, setNewPlan] = useState('')
  const [planNotes, setPlanNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [usersRes, convsRes] = await Promise.all([
        supabase.rpc('admin_get_all_users'),
        supabase.rpc('admin_get_user_conversations', { target_id: id }),
      ])
      if (usersRes.error) throw usersRes.error
      const found = (usersRes.data || []).find(u => u.id === id)
      if (!found) throw new Error('Përdoruesi nuk u gjet')
      setUser(found)
      setNewPlan(found.plan || 'free')
      setPlanNotes(found.plan_notes || '')
      setConversations(convsRes.data || [])
    } catch (err) {
      setError('Gabim: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  async function savePlan() {
    setSaving(true)
    try {
      const { error: err } = await supabase.rpc('admin_update_user_plan', {
        target_id: id,
        new_plan: newPlan,
        notes: planNotes || null,
      })
      if (err) throw err
      setUser(prev => ({ ...prev, plan: newPlan, plan_notes: planNotes }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Gabim: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const days = user?.last_sign_in_at ? daysSince(user.last_sign_in_at) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>
        <Link to="/admin/users" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kthehu
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link
          to="/admin/users"
          className="mt-1 p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-lg font-bold">
              {user.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.full_name || 'Pa emër'}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </div>
            </div>
            <div className="ml-auto">
              <PlanBadge plan={user.plan} />
            </div>
          </div>
        </div>
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Login stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-700">Aktiviteti</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Regjistruar</span>
              <span className="text-xs font-medium text-gray-700">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('sq-AL') : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Hyrja e fundit</span>
              <span className={`text-xs font-medium ${days === null ? 'text-gray-400' : days <= 7 ? 'text-green-600' : days <= 30 ? 'text-yellow-600' : 'text-red-500'}`}>
                {user.last_sign_in_at
                  ? `${days === 0 ? 'Sot' : `Para ${days} ditësh`}`
                  : 'Kurrë'}
              </span>
            </div>
            {user.last_sign_in_at && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Data</span>
                <span className="text-xs text-gray-500">
                  {new Date(user.last_sign_in_at).toLocaleDateString('sq-AL')}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Onboarding</span>
              <span className={`text-xs font-medium ${user.onboarding_completed ? 'text-green-600' : 'text-orange-500'}`}>
                {user.onboarding_completed ? 'Kompletuar' : 'Në pritje'}
              </span>
            </div>
          </div>
        </div>

        {/* Business info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-700">Biznesi</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Emri</span>
              <span className="text-xs font-medium text-gray-700 text-right max-w-[130px] truncate">
                {user.business_name || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Industria</span>
              <span className="text-xs text-gray-600 text-right max-w-[130px] truncate">
                {user.industry || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Qyteti</span>
              <span className="text-xs text-gray-600">{user.city || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">NIPT</span>
              <span className={`text-xs font-medium ${user.has_nipt ? 'text-green-600' : 'text-gray-400'}`}>
                {user.has_nipt ? 'Po' : 'Jo'}
              </span>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-700">Bisedat AI</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{conversations.length}</div>
          <div className="text-xs text-gray-400 mb-3">biseda totale</div>
          {conversations.slice(0, 3).map(c => (
            <div key={c.id} className="flex justify-between items-center py-1.5 border-t border-gray-50">
              <span className="text-xs text-gray-500 truncate max-w-[110px]">{c.title || 'Pa titull'}</span>
              <span className="text-xs text-gray-400">{c.message_count} msg</span>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-gray-400">Asnjë bisedë</p>
          )}
        </div>
      </div>

      {/* Full profile details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile detail */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Detajet e Profilit
          </h3>
          <InfoRow label="Emri i plotë" value={user.full_name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Biznesi" value={user.business_name} />
          <InfoRow label="Industria" value={user.industry} />
          <InfoRow label="Qyteti" value={user.city} />
          <InfoRow label="Vitet aktiv" value={user.years_operating} />
          <InfoRow label="Punonjës" value={user.employee_count} />
          <InfoRow label="Xhiro mujore" value={user.monthly_revenue_range} />
          <InfoRow label="NIPT" value={user.has_nipt ? 'Po' : 'Jo'} />
          {user.needs?.length > 0 && (
            <InfoRow label="Nevojat" value={user.needs.join(', ')} />
          )}
          {user.biggest_challenge && (
            <div className="pt-3">
              <p className="text-xs text-gray-400 font-medium mb-1">Sfida kryesore</p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
                {user.biggest_challenge}
              </p>
            </div>
          )}
        </div>

        {/* Plan management */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Menaxhimi i Planit
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Plani aktual</div>
              <PlanBadge plan={user.plan} />
              {user.plan_activated_at && (
                <div className="text-xs text-gray-400 mt-2">
                  Aktivizuar: {new Date(user.plan_activated_at).toLocaleDateString('sq-AL')}
                </div>
              )}
              {user.plan_notes && (
                <div className="text-xs text-gray-500 mt-1 italic">{user.plan_notes}</div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ndrysho planin</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {PLANS.map(p => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Shënime (opsionale)</label>
                <textarea
                  value={planNotes}
                  onChange={e => setPlanNotes(e.target.value)}
                  rows={2}
                  placeholder="p.sh. Aktivizuar pas pagesës..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <button
                onClick={savePlan}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } disabled:opacity-60`}
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <><Check className="w-4 h-4" /> Ruajtur!</>
                ) : (
                  <><Zap className="w-4 h-4" /> Aktivizo Planin</>
                )}
              </button>
            </div>
          </div>

          {/* All conversations */}
          {conversations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Të gjitha bisedat ({conversations.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {conversations.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                        {c.title || 'Pa titull'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {c.module} · {c.updated_at ? new Date(c.updated_at).toLocaleDateString('sq-AL') : '—'}
                      </div>
                    </div>
                    <div className="text-xs text-indigo-600 font-medium flex-shrink-0 ml-2">
                      {c.message_count} msg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
