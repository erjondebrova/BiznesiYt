import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, Plus, Loader2, X, ChevronRight, TrendingUp, PartyPopper } from 'lucide-react'

const STAGES = [
  { id: 'interested', label: 'I Interesuar', emoji: '🟡', color: 'border-yellow-300 bg-yellow-50' },
  { id: 'offer_sent',  label: 'Ofertë Dhënë', emoji: '🟠', color: 'border-orange-300 bg-orange-50' },
  { id: 'pending',    label: 'Në Pritje',     emoji: '🔵', color: 'border-blue-300 bg-blue-50' },
  { id: 'closed',     label: 'I Mbyllur',     emoji: '🟢', color: 'border-green-300 bg-green-50' },
  { id: 'lost',       label: 'I Humbur',      emoji: '🔴', color: 'border-red-300 bg-red-50' },
]

function fmtMoney(v) { return new Intl.NumberFormat('sq-AL').format(v || 0) }

export default function PipelinePage() {
  const { user } = useAuth()
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)
  const [lostReason, setLostReason] = useState('')
  const [askLostReason, setAskLostReason] = useState(null)
  const [celebrate, setCelebrate] = useState(null)
  const [form, setForm] = useState({ client_name: '', product_interest: '', value: '', stage: 'interested', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('sales_opportunities').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setOpps(data || [])
    setLoading(false)
  }

  const byStage = useMemo(() => {
    const grouped = {}
    STAGES.forEach(s => grouped[s.id] = [])
    opps.forEach(o => grouped[o.stage]?.push(o))
    return grouped
  }, [opps])

  const totals = useMemo(() => {
    const active = opps.filter(o => o.stage !== 'closed' && o.stage !== 'lost')
    return {
      pipelineValue: active.reduce((s, o) => s + Number(o.value || 0), 0),
      activeCount: active.length,
      closedValue: opps.filter(o => o.stage === 'closed').reduce((s, o) => s + Number(o.value || 0), 0),
    }
  }, [opps])

  async function handleAdd() {
    if (!form.client_name.trim()) return
    setSaving(true)
    await supabase.from('sales_opportunities').insert({
      user_id: user.id,
      client_name: form.client_name.trim(),
      product_interest: form.product_interest || null,
      value: form.value ? Number(form.value) : 0,
      stage: form.stage,
      notes: form.notes || null,
    })
    setSaving(false)
    setShowAdd(false)
    setForm({ client_name: '', product_interest: '', value: '', stage: 'interested', notes: '' })
    load()
  }

  async function moveStage(opp, newStage) {
    if (newStage === 'lost' && !opp.lost_reason) {
      setAskLostReason(opp)
      return
    }
    await supabase.from('sales_opportunities').update({ stage: newStage, updated_at: new Date().toISOString() }).eq('id', opp.id)
    if (newStage === 'closed') setCelebrate(opp)
    setSelected(null)
    load()
  }

  async function confirmLost() {
    await supabase.from('sales_opportunities').update({ stage: 'lost', lost_reason: lostReason || null, updated_at: new Date().toISOString() }).eq('id', askLostReason.id)
    setAskLostReason(null); setLostReason(''); setSelected(null)
    load()
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-300"/></div>

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Pipeline Shitjesh</h1>
            <p className="text-xs text-gray-400 mt-0.5">Ndiq çdo mundësi nga interesimi deri te blerja</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">
          <Plus className="w-4 h-4"/>Shto Mundësi
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card py-3"><p className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp className="w-3 h-3"/>Totali në Pipeline</p><p className="text-xl font-bold text-gray-900">{fmtMoney(totals.pipelineValue)} L</p></div>
        <div className="card py-3"><p className="text-xs text-gray-400">Mundësi Aktive</p><p className="text-xl font-bold text-blue-600">{totals.activeCount}</p></div>
      </div>

      {opps.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-400 mb-2">Shto mundësinë e parë — edhe nëse është dikush që thjesht pyeti sot.</p>
          <button onClick={() => setShowAdd(true)} className="text-blue-600 text-sm font-semibold hover:underline">Shto mundësi →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STAGES.map(stage => (
            <div key={stage.id} className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <span>{stage.emoji}</span>
                <span className="text-xs font-bold text-gray-600">{stage.label}</span>
                <span className="text-[10px] text-gray-300 ml-auto">{byStage[stage.id].length}</span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {byStage[stage.id].map(o => (
                  <button key={o.id} onClick={() => setSelected(o)}
                    className={`w-full text-left p-3 rounded-xl border ${stage.color} hover:shadow-sm transition-all`}>
                    <p className="text-xs font-semibold text-gray-800 truncate">{o.client_name}</p>
                    {o.product_interest && <p className="text-[10px] text-gray-500 truncate mt-0.5">{o.product_interest}</p>}
                    {o.value > 0 && <p className="text-xs font-bold text-gray-700 mt-1">{fmtMoney(o.value)} L</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-gray-900">Mundësi e Re</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-gray-400"/></button>
            </div>
            <Input value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} placeholder="Emri i klientit *"/>
            <Input value={form.product_interest} onChange={e => setForm(p => ({ ...p, product_interest: e.target.value }))} placeholder="Produkti/Shërbimi"/>
            <Input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Vlera e përafërt (lekë)"/>
            <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
              {STAGES.filter(s => s.id !== 'closed' && s.id !== 'lost').map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
            </select>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Shënim (opsionale)" rows={2}/>
            <Button onClick={handleAdd} disabled={!form.client_name.trim() || saving} className="w-full bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Shto në Pipeline'}
            </Button>
          </div>
        </div>
      )}

      {/* Detail / move modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-gray-900">{selected.client_name}</h3>
              <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-gray-400"/></button>
            </div>
            {selected.product_interest && <p className="text-sm text-gray-500">{selected.product_interest}</p>}
            {selected.value > 0 && <p className="text-lg font-bold text-gray-900">{fmtMoney(selected.value)} L</p>}
            {selected.notes && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">{selected.notes}</p>}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Lëvize në:</p>
              <div className="grid grid-cols-1 gap-1.5">
                {STAGES.filter(s => s.id !== selected.stage).map(s => (
                  <button key={s.id} onClick={() => moveStage(selected, s.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm text-left">
                    <span>{s.emoji}</span>{s.label}<ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lost reason modal */}
      {askLostReason && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setAskLostReason(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-gray-900">Çfarë ndodhi?</h3>
            <p className="text-xs text-gray-400">Për ta ruajtur për analizë</p>
            <div className="flex flex-wrap gap-2">
              {['Çmimi', 'Koha', 'Konkurrenca', 'Nuk u përgjigj', 'Tjetër'].map(r => (
                <button key={r} onClick={() => setLostReason(r)} className={`px-3 py-1.5 rounded-lg text-xs border-2 ${lostReason === r ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>{r}</button>
              ))}
            </div>
            <Button onClick={confirmLost} className="w-full bg-red-500 hover:bg-red-600">Konfirmo</Button>
          </div>
        </div>
      )}

      {/* Celebrate modal */}
      {celebrate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setCelebrate(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center space-y-3" onClick={e => e.stopPropagation()}>
            <PartyPopper className="w-10 h-10 text-amber-500 mx-auto"/>
            <h3 className="font-heading font-bold text-gray-900 text-lg">Urime! 🎉</h3>
            <p className="text-sm text-gray-500">Shitje e mbyllur: <strong>{fmtMoney(celebrate.value)} L</strong> me {celebrate.client_name}</p>
            <div className="flex gap-2 pt-1">
              <Link to="/sales/followup" className="flex-1"><Button variant="outline" className="w-full" onClick={() => setCelebrate(null)}>Mesazh Falenderimi</Button></Link>
              <Button onClick={() => setCelebrate(null)} className="flex-1 bg-gray-900 hover:bg-gray-800">Mbyll</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
