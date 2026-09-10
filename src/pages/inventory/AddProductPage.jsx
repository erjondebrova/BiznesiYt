import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, Package, Check, Loader2, Layers } from 'lucide-react'

const BUSINESS_TYPES = [
  { id: 'physical', label: 'Produkte Fizike', emoji: '📦', desc: 'Dyqan, e-commerce' },
  { id: 'service',  label: 'Shërbime',        emoji: '💼', desc: 'Salon, pastrim, konsulencë' },
  { id: 'food',     label: 'Ushqim/Pije',     emoji: '🍽️', desc: 'Restorant, bar, delivery' },
]

export default function AddProductPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bulkMode, setBulkMode] = useState(false)
  const [businessType, setBusinessType] = useState('physical')
  const [form, setForm] = useState({
    name: '', category: '', price: '', cost: '', stock_qty: '', min_stock: '5',
    sku: '', description: '', supplier: '', duration_minutes: '',
  })
  const [bulkText, setBulkText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function update(field, val) { setForm(prev => ({ ...prev, [field]: val })) }

  async function handleSave() {
    if (!form.name.trim() || !form.price) return
    setSaving(true); setError('')
    const { error } = await supabase.from('products').insert({
      user_id: user.id,
      name: form.name.trim(),
      business_type: businessType,
      category: form.category || null,
      price: Number(form.price),
      cost: form.cost ? Number(form.cost) : null,
      stock_qty: businessType === 'physical' && form.stock_qty ? Number(form.stock_qty) : null,
      min_stock: form.min_stock ? Number(form.min_stock) : 5,
      sku: form.sku || null,
      description: form.description || null,
      supplier: form.supplier || null,
      duration_minutes: businessType === 'service' && form.duration_minutes ? Number(form.duration_minutes) : null,
    })
    setSaving(false)
    if (error) { setError('Gabim gjatë ruajtjes. Provo përsëri.'); return }
    setSaved(true)
    setTimeout(() => navigate('/inventory/stock'), 1200)
  }

  async function handleBulkSave() {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    const rows = lines.map(line => {
      const parts = line.split(/[-,|]/).map(p => p.trim())
      const price = parseFloat((parts[1] || '0').replace(/[^\d.]/g, '')) || 0
      const qty = parseInt((parts[2] || '0').replace(/[^\d]/g, '')) || null
      return { user_id: user.id, name: parts[0] || 'Produkt', business_type: businessType, price, stock_qty: qty, min_stock: 5 }
    }).filter(r => r.name && r.price > 0)
    if (!rows.length) return
    setSaving(true); setError('')
    const { error } = await supabase.from('products').insert(rows)
    setSaving(false)
    if (error) { setError('Gabim gjatë ruajtjes. Provo përsëri.'); return }
    setSaved(true)
    setTimeout(() => navigate('/inventory/stock'), 1200)
  }

  if (saved) return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="card text-center py-10">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-7 h-7 text-green-600"/></div>
        <p className="font-semibold text-gray-900">Produkti u ruajt me sukses!</p>
        <p className="text-sm text-gray-400 mt-1">Duke të kthyer te stoku...</p>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Shto Produkt / Shërbim</h1>
          <p className="text-xs text-gray-400 mt-0.5">Regjistro me çmime, kategori dhe detaje</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Çfarë ke?</label>
        <div className="grid grid-cols-3 gap-2">
          {BUSINESS_TYPES.map(t => (
            <button key={t.id} onClick={() => setBusinessType(t.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all ${businessType === t.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-lg">{t.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setBulkMode(false)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${!bulkMode ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>Një produkt</button>
        <button onClick={() => setBulkMode(true)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${bulkMode ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>Shumë (listë)</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}

      {bulkMode ? (
        <div className="card space-y-3">
          <label className="block text-sm font-semibold text-gray-900">Emri — Çmimi — Sasia</label>
          <Textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={8}
            placeholder="Bluzë bardhe — 2,500L — 15&#10;Xhinse blu — 4,000L — 8&#10;Këpucë lëkure — 7,500L — 5"/>
          <Button onClick={handleBulkSave} disabled={!bulkText.trim() || saving} className="w-full gap-2 bg-teal-600 hover:bg-teal-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Layers className="w-4 h-4"/>}Ruaj të Gjithë
          </Button>
        </div>
      ) : (
        <>
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Emri <span className="text-red-400">*</span></label>
              <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="p.sh. Prerje flokësh, Bluzë bardhe, Cappuccino"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Çmimi i Shitjes <span className="text-red-400">*</span></label>
                <Input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="Lekë"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Kosto <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
                <Input type="number" value={form.cost} onChange={e => update('cost', e.target.value)} placeholder="Për fitimin"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Kategoria</label>
              <Input value={form.category} onChange={e => update('category', e.target.value)} placeholder="p.sh. Veshje, Kozmetikë, Pjata kryesore"/>
            </div>
            {businessType === 'physical' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Sasia në Stok</label>
                  <Input type="number" value={form.stock_qty} onChange={e => update('stock_qty', e.target.value)} placeholder="copë"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Sasia Minimale</label>
                  <Input type="number" value={form.min_stock} onChange={e => update('min_stock', e.target.value)} placeholder="sinjalizim kur bie nën"/>
                </div>
              </div>
            )}
            {businessType === 'service' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Kohëzgjatja (minuta)</label>
                <Input type="number" value={form.duration_minutes} onChange={e => update('duration_minutes', e.target.value)} placeholder="p.sh. 45"/>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Përshkrim <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2}/>
            </div>
            {businessType === 'physical' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Furnitori <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
                <Input value={form.supplier} onChange={e => update('supplier', e.target.value)}/>
              </div>
            )}
          </div>
          <Button onClick={handleSave} disabled={!form.name.trim() || !form.price || saving} className="w-full gap-2 bg-teal-600 hover:bg-teal-700" size="lg">
            {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Package className="w-5 h-5"/>}Shto Produktin
          </Button>
        </>
      )}
    </div>
  )
}
