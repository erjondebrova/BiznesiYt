import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, UserPlus, Check, Users, Loader2 } from 'lucide-react'

const SOURCES = ['Instagram', 'Facebook', 'Google', 'Gojë-më-gojë', 'Kalimtar', 'Reklamë', 'Referim', 'Tjetër']
const CATEGORIES = [
  { id: 'new',     label: 'Klient i Ri',      desc: 'Blerje e parë',        emoji: '🆕' },
  { id: 'regular', label: 'Klient i Rregullt', desc: 'Ka blerë më parë',     emoji: '🔁' },
  { id: 'lead',    label: 'Lead',              desc: 'I interesuar, s\'ka blerë', emoji: '🎯' },
  { id: 'vip',     label: 'VIP',               desc: 'Vlerë e lartë',        emoji: '👑' },
]

export default function AddClientPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bulkMode, setBulkMode] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', source: '', interest: '', category: 'new', notes: '' })
  const [bulkText, setBulkText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function update(field, val) { setForm(prev => ({ ...prev, [field]: val })) }

  async function handleSave() {
    if (!form.full_name.trim()) return
    setSaving(true); setError('')
    const { error } = await supabase.from('clients').insert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      source: form.source || null,
      interest: form.interest || null,
      category: form.category,
      notes: form.notes || null,
    })
    setSaving(false)
    if (error) { setError('Gabim gjatë ruajtjes. Provo përsëri.'); return }
    setSaved(true)
    setTimeout(() => navigate('/sales/clients'), 1200)
  }

  async function handleBulkSave() {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    const rows = lines.map(line => {
      const parts = line.split(/[-,|]/).map(p => p.trim())
      return { user_id: user.id, full_name: parts[0] || 'Klient', phone: parts[1] || null, category: 'new' }
    }).filter(r => r.full_name)
    if (!rows.length) return
    setSaving(true); setError('')
    const { error } = await supabase.from('clients').insert(rows)
    setSaving(false)
    if (error) { setError('Gabim gjatë ruajtjes. Provo përsëri.'); return }
    setSaved(true)
    setTimeout(() => navigate('/sales/clients'), 1200)
  }

  if (saved) {
    return (
      <div className="p-4 sm:p-6 max-w-md mx-auto">
        <div className="card text-center py-10">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600"/>
          </div>
          <p className="font-semibold text-gray-900">Klienti u ruajt me sukses!</p>
          <p className="text-sm text-gray-400 mt-1">Duke të kthyer te lista...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Regjistro Klient</h1>
          <p className="text-xs text-gray-400 mt-0.5">Shto klientë të rinj me të dhëna të organizuara</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setBulkMode(false)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${!bulkMode ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500'}`}>
          Një klient
        </button>
        <button onClick={() => setBulkMode(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${bulkMode ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500'}`}>
          Shumë klientë (listë)
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}

      {bulkMode ? (
        <div className="card space-y-3">
          <label className="block text-sm font-semibold text-gray-900">Shkruaji të gjithë (emër — telefon)</label>
          <Textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={8}
            placeholder="Ardit Hoxha — 069 123 4567&#10;Elira Meta — 068 987 6543&#10;Klaudi Leka — 067 555 1122"/>
          <p className="text-xs text-gray-400">Një klient për rresht: emri — telefoni. Do i organizojmë ne automatikisht.</p>
          <Button onClick={handleBulkSave} disabled={!bulkText.trim() || saving} className="w-full gap-2 bg-rose-600 hover:bg-rose-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Users className="w-4 h-4"/>}
            Ruaj të Gjithë
          </Button>
        </div>
      ) : (
        <>
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Emri i plotë <span className="text-red-400">*</span></label>
              <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="p.sh. Ardit Hoxha"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Telefoni</label>
                <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+355 6X XXX XXXX"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
                <Input value={form.email} onChange={e => update('email', e.target.value)} placeholder="opsionale"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Si e gjeti biznesin?</label>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map(s => (
                  <button key={s} onClick={() => update('source', s)}
                    className={`px-3 py-1.5 rounded-lg text-xs border-2 transition-all ${form.source === s ? 'border-rose-500 bg-rose-50 font-semibold text-rose-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Çfarë bleu / u interesua?</label>
              <Input value={form.interest} onChange={e => update('interest', e.target.value)} placeholder="p.sh. Prerje flokësh, Konsultë, Paketa Premium"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Kategoria</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => update('category', c.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${form.category === c.id ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-lg">{c.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{c.label}</div>
                      <div className="text-[10px] text-gray-400">{c.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Shënime <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder="p.sh. Do kthehet javën tjetër, kërkon ofertë për grup"/>
            </div>
          </div>
          <Button onClick={handleSave} disabled={!form.full_name.trim() || saving} className="w-full gap-2 bg-rose-600 hover:bg-rose-700" size="lg">
            {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <UserPlus className="w-5 h-5"/>}
            Shto Klientin
          </Button>
        </>
      )}
    </div>
  )
}
