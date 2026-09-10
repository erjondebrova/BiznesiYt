import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ArrowLeft, Bell, Plus, Check, Loader2, X, Sparkles } from 'lucide-react'

const TYPE_META = {
  task:     { emoji: '📅', label: 'Detyrë' },
  followup: { emoji: '📞', label: 'Follow-up' },
  stock:    { emoji: '📦', label: 'Stok' },
  birthday: { emoji: '🎂', label: 'Ditëlindje' },
  other:    { emoji: '📌', label: 'Tjetër' },
}

export default function RemindersPage() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: rem } = await supabase.from('reminders').select('*').eq('user_id', user.id).order('due_date')
    setReminders(rem || [])

    const [{ data: leads }, { data: products }] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user.id).eq('category', 'lead'),
      supabase.from('products').select('*').eq('user_id', user.id),
    ])
    const now = new Date()
    const sugg = []
    ;(leads || []).forEach(l => {
      const days = Math.floor((now - new Date(l.created_at)) / 86400000)
      if (days >= 1) sugg.push({ id: `lead-${l.id}`, emoji: '📞', text: `Kontakto ${l.full_name} — lead i ri (${days}d pa përgjigje)`, type: 'followup', related_id: l.id })
    })
    ;(products || []).forEach(p => {
      if (p.stock_qty !== null && p.stock_qty !== undefined && p.stock_qty <= (p.min_stock || 5)) {
        sugg.push({ id: `stock-${p.id}`, emoji: '📦', text: `Porosit ${p.name} — stoku kritik (${p.stock_qty} copë)`, type: 'stock', related_id: p.id })
      }
    })
    setSuggestions(sugg.slice(0, 10))
    setLoading(false)
  }

  async function addReminder() {
    if (!newTitle.trim()) return
    await supabase.from('reminders').insert({ user_id: user.id, title: newTitle.trim(), due_date: newDate, type: 'task' })
    setNewTitle(''); setShowAdd(false)
    load()
  }

  async function toggleDone(r) {
    await supabase.from('reminders').update({ status: r.status === 'done' ? 'pending' : 'done' }).eq('id', r.id)
    load()
  }

  async function dismissSuggestion(sugg) {
    await supabase.from('reminders').insert({ user_id: user.id, title: sugg.text, type: sugg.type, due_date: new Date().toISOString().slice(0, 10), status: 'done', related_id: sugg.related_id })
    setSuggestions(prev => prev.filter(s => s.id !== sugg.id))
  }

  const { today, upcoming, done } = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10)
    const pending = reminders.filter(r => r.status === 'pending')
    return {
      today: pending.filter(r => r.due_date <= now),
      upcoming: pending.filter(r => r.due_date > now),
      done: reminders.filter(r => r.status === 'done').slice(0, 5),
    }
  }, [reminders])

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-300"/></div>

  const totalActive = suggestions.length + today.length + upcoming.length

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div><h1 className="font-heading text-xl font-bold text-gray-900">Kujtime & Ndjekje</h1><p className="text-xs text-gray-400 mt-0.5">Mos harro asgjë</p></div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl"><Plus className="w-4 h-4"/>Kujtim i Ri</button>
      </div>

      {totalActive === 0 ? (
        <div className="card text-center py-10">
          <span className="text-3xl">🎉</span>
          <p className="text-sm font-semibold text-gray-700 mt-2">Je në rregull!</p>
          <p className="text-xs text-gray-400 mt-1">Asgjë urgjente për momentin.</p>
        </div>
      ) : (
        <>
          {suggestions.length > 0 && (
            <div className="card border border-violet-100 bg-violet-50/30">
              <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-violet-500"/><span className="text-xs font-bold text-violet-700 uppercase">Sugjerime Automatike</span></div>
              <div className="space-y-2">
                {suggestions.map(s => (
                  <div key={s.id} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-violet-100">
                    <span>{s.emoji}</span>
                    <span className="flex-1 text-xs text-gray-700">{s.text}</span>
                    <button onClick={() => dismissSuggestion(s)} className="text-[10px] text-violet-600 font-semibold hover:underline flex-shrink-0">Bërë ✓</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {today.length > 0 && (
            <div className="card">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sot</p>
              <div className="space-y-1.5">
                {today.map(r => <ReminderRow key={r.id} r={r} onToggle={toggleDone}/>)}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="card">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Këtë Javë</p>
              <div className="space-y-1.5">
                {upcoming.map(r => <ReminderRow key={r.id} r={r} onToggle={toggleDone}/>)}
              </div>
            </div>
          )}
        </>
      )}

      {done.length > 0 && (
        <div className="card opacity-60">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bërë Kohët e Fundit</p>
          <div className="space-y-1.5">{done.map(r => <ReminderRow key={r.id} r={r} onToggle={toggleDone}/>)}</div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-heading font-bold text-gray-900">Kujtim i Ri</h3><button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-gray-400"/></button></div>
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="p.sh. Telefono furnitorin"/>
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}/>
            <Button onClick={addReminder} disabled={!newTitle.trim()} className="w-full bg-violet-600 hover:bg-violet-700">Shto Kujtimin</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ReminderRow({ r, onToggle }) {
  const meta = TYPE_META[r.type] || TYPE_META.other
  return (
    <button onClick={() => onToggle(r)} className="w-full flex items-center gap-2.5 text-left py-1.5">
      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${r.status === 'done' ? 'bg-violet-500 border-violet-500' : 'border-gray-300'}`}>
        {r.status === 'done' && <Check className="w-3 h-3 text-white"/>}
      </span>
      <span className="text-sm">{meta.emoji}</span>
      <span className={`flex-1 text-sm ${r.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{r.title}</span>
      <span className="text-[10px] text-gray-300 flex-shrink-0">{new Date(r.due_date).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })}</span>
    </button>
  )
}
