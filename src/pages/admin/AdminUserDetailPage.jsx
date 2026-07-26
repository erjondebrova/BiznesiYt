import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  ArrowLeft, Building2, MapPin, Users, Star, Calendar, Clock,
  MessageSquare, Check, RefreshCw, ShieldCheck, Zap, Mail,
  BarChart2, Trash2, Settings
} from 'lucide-react'

const PLANS = ['free', 'starter', 'pro', 'business', 'enterprise', 'custom']

const PLAN_DEFAULTS = {
  free:       { ai_messages: 20,   marketing_plans: 3,   content_posts: 10,  competitor_analyses: 1   },
  starter:    { ai_messages: 100,  marketing_plans: 5,   content_posts: 20,  competitor_analyses: 5   },
  pro:        { ai_messages: 500,  marketing_plans: 20,  content_posts: 100, competitor_analyses: 20  },
  business:   { ai_messages: 2000, marketing_plans: 100, content_posts: 500, competitor_analyses: null },
  enterprise: { ai_messages: null, marketing_plans: null, content_posts: null, competitor_analyses: null },
  custom:     null,
}

const FEATURE_LABELS = {
  ai_messages:         'Mesazhe AI',
  marketing_plans:     'Plane Marketingu',
  content_posts:       'Postime Përmbajtjesh',
  competitor_analyses: 'Analiza Konkurrence',
}

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
    free:       'bg-gray-100 text-gray-600 border-gray-200',
    starter:    'bg-sky-50 text-sky-700 border-sky-200',
    pro:        'bg-indigo-50 text-indigo-700 border-indigo-200',
    business:   'bg-amber-50 text-amber-700 border-amber-200',
    enterprise: 'bg-purple-50 text-purple-700 border-purple-200',
    custom:     'bg-rose-50 text-rose-700 border-rose-200',
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

function UsageBar({ feature, used, limit }) {
  const label = FEATURE_LABELS[feature]
  const isUnlimited = limit === null || limit === undefined
  const pct = isUnlimited ? 0 : Math.min(100, Math.round(((used || 0) / limit) * 100))
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-indigo-500'

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-medium text-gray-700">
          {used || 0}{isUnlimited ? '' : ` / ${limit}`}
          {isUnlimited && <span className="text-gray-400 ml-1">(pa limit)</span>}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
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
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [customLimits, setCustomLimits] = useState({
    ai_messages: '', marketing_plans: '', content_posts: '', competitor_analyses: ''
  })
  const [savingCustom, setSavingCustom] = useState(false)
  const [savedCustom, setSavedCustom] = useState(false)

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
      if (found.custom_limits) {
        setCustomLimits({
          ai_messages:         found.custom_limits.ai_messages         ?? '',
          marketing_plans:     found.custom_limits.marketing_plans     ?? '',
          content_posts:       found.custom_limits.content_posts       ?? '',
          competitor_analyses: found.custom_limits.competitor_analyses ?? '',
        })
      }
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

  async function resetUsage() {
    if (!window.confirm('Jeni i sigurt që doni të zeroni të gjithë përdorimin?')) return
    setResetting(true)
    try {
      const { error: err } = await supabase.rpc('admin_reset_user_usage', { target_id: id })
      if (err) throw err
      setUser(prev => ({ ...prev, usage_data: {} }))
      setResetDone(true)
      setTimeout(() => setResetDone(false), 3000)
    } catch (err) {
      alert('Gabim: ' + err.message)
    } finally {
      setResetting(false)
    }
  }

  async function saveCustomLimits() {
    setSavingCustom(true)
    try {
      const limits = {}
      for (const key of ['ai_messages', 'marketing_plans', 'content_posts', 'competitor_analyses']) {
        const v = customLimits[key]
        limits[key] = v === '' || v === null ? null : parseInt(v, 10)
      }
      const { error: err } = await supabase.rpc('admin_set_custom_limits', {
        target_id: id,
        new_limits: limits,
      })
      if (err) throw err
      setUser(prev => ({ ...prev, plan: 'custom', custom_limits: limits }))
      setNewPlan('custom')
      setSavedCustom(true)
      setTimeout(() => setSavedCustom(false), 3000)
    } catch (err) {
      alert('Gabim: ' + err.message)
    } finally {
      setSavingCustom(false)
    }
  }

  function getLimitsForPlan(planName) {
    if (planName === 'custom') return user?.custom_limits || {}
    return PLAN_DEFAULTS[planName] || PLAN_DEFAULTS.free
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

  const planLimits = getLimitsForPlan(user.plan)
  const usageData = user.usage_data || {}

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

      {/* Usage section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            Përdorimi i Funksioneve
          </h3>
          <button
            onClick={resetUsage}
            disabled={resetting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              resetDone
                ? 'bg-green-100 text-green-700'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            } disabled:opacity-60`}
          >
            {resetting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : resetDone ? (
              <><Check className="w-3.5 h-3.5" /> Zeruar!</>
            ) : (
              <><Trash2 className="w-3.5 h-3.5" /> Zero Përdorimin</>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(FEATURE_LABELS).map(feature => (
            <UsageBar
              key={feature}
              feature={feature}
              used={usageData[feature] || 0}
              limit={planLimits?.[feature]}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Përdorimi është kumulativ — nuk zerohet automatikisht. Vetëm admini mund ta zeroj manualisht.
        </p>
      </div>

      {/* Full profile + plan management */}
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

                {/* Live limits preview for the selected plan */}
                {newPlan !== 'custom' && PLAN_DEFAULTS[newPlan] && (
                  <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
                      Limitet — {newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {Object.keys(FEATURE_LABELS).map(feature => {
                        const lim = PLAN_DEFAULTS[newPlan]?.[feature]
                        return (
                          <div key={feature} className="flex justify-between items-center">
                            <span className="text-xs text-indigo-500">{FEATURE_LABELS[feature]}</span>
                            <span className="text-xs font-bold text-indigo-800">
                              {lim === null || lim === undefined ? '∞' : lim}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {newPlan === 'custom' && (
                  <p className="mt-2 text-xs text-rose-500 italic">
                    Vendos limitet manuale në seksionin e mëposhtëm.
                  </p>
                )}
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

          {/* Custom limits editor */}
          {newPlan === 'custom' && (
            <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-rose-500" />
                Limitet e Personalizuara
                <span className="text-xs text-gray-400 font-normal">(lëri bosh = pa limit)</span>
              </h3>
              <div className="space-y-3">
                {Object.keys(FEATURE_LABELS).map(feature => (
                  <div key={feature}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {FEATURE_LABELS[feature]}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Pa limit"
                      value={customLimits[feature]}
                      onChange={e => setCustomLimits(prev => ({ ...prev, [feature]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={saveCustomLimits}
                disabled={savingCustom}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  savedCustom
                    ? 'bg-green-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                } disabled:opacity-60`}
              >
                {savingCustom ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : savedCustom ? (
                  <><Check className="w-4 h-4" /> Ruajtur!</>
                ) : (
                  <><Settings className="w-4 h-4" /> Ruaj Limitet</>
                )}
              </button>
            </div>
          )}

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
