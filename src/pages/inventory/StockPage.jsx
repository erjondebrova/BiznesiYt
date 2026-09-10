import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ArrowLeft, Plus, Loader2, X, AlertTriangle, Package, Check } from 'lucide-react'

function fmtMoney(v) { return new Intl.NumberFormat('sq-AL').format(v || 0) }

function statusFor(p) {
  if (p.stock_qty === null || p.stock_qty === undefined) return null
  if (p.stock_qty <= 0) return { label: 'Mbaroi', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
  if (p.stock_qty <= (p.min_stock || 5)) return { label: 'Po Mbaron', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
  return { label: 'Mirë', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' }
}

export default function StockPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [qty, setQty] = useState('')
  const [movementType, setMovementType] = useState('in')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('name')
    setProducts(data || [])
    setLoading(false)
  }

  const physicalProducts = useMemo(() => products.filter(p => p.business_type === 'physical'), [products])
  const lowStock = useMemo(() => physicalProducts.filter(p => p.stock_qty !== null && p.stock_qty <= (p.min_stock || 5)), [physicalProducts])

  async function handleUpdateStock() {
    if (!updating || !qty) return
    const delta = movementType === 'out' || movementType === 'loss' ? -Math.abs(Number(qty)) : Math.abs(Number(qty))
    const newQty = Math.max(0, (updating.stock_qty || 0) + delta)
    await supabase.from('products').update({ stock_qty: newQty, updated_at: new Date().toISOString() }).eq('id', updating.id)
    await supabase.from('stock_movements').insert({
      user_id: user.id, product_id: updating.id, type: movementType, quantity: Math.abs(Number(qty)),
      note: movementType === 'in' ? 'Stok i ri' : movementType === 'out' ? 'Shitje' : 'Humbje/dëmtim',
    })
    setUpdating(null); setQty(''); setMovementType('in')
    load()
  }

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-300"/></div>

  if (physicalProducts.length === 0 && products.length > 0) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Gjendja e Stokut</h1>
        </div>
        <div className="card text-center py-10">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3"/>
          <p className="text-sm text-gray-500">Ky modul është për biznese me produkte fizike.</p>
          <p className="text-xs text-gray-400 mt-1">Ke vetëm shërbime/ushqim regjistruar — për ta, stoku nuk aplikohet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Gjendja e Stokut</h1>
            <p className="text-xs text-gray-400 mt-0.5">{physicalProducts.length} produkte fizike</p>
          </div>
        </div>
        <Link to="/inventory/products/new"><button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4"/>Shto Produkt</button></Link>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0"/>
          <div>
            <p className="text-sm font-semibold text-amber-800">🔔 {lowStock.length} produkte po mbarojnë</p>
            <div className="mt-1 space-y-0.5">
              {lowStock.slice(0, 5).map(p => (
                <p key={p.id} className="text-xs text-amber-700">{p.name} — {p.stock_qty} copë (minimumi: {p.min_stock}) {p.stock_qty <= 0 ? '🔴' : '⚠️'}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {physicalProducts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3"/>
          <p className="text-sm text-gray-400">Nuk ke ende produkte fizike.</p>
          <Link to="/inventory/products/new" className="text-teal-600 text-sm font-semibold hover:underline mt-2 inline-block">Shto produktin e parë →</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
                <tr><th className="text-left px-4 py-2.5">Produkti</th><th className="text-left px-4 py-2.5">Çmimi</th><th className="text-left px-4 py-2.5">Në Stok</th><th className="text-left px-4 py-2.5">Statusi</th><th className="px-4 py-2.5"></th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {physicalProducts.map(p => {
                  const st = statusFor(p)
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtMoney(p.price)} L</td>
                      <td className="px-4 py-3 text-gray-600">{p.stock_qty ?? '—'} copë</td>
                      <td className="px-4 py-3">{st && <span className={`text-xs font-bold px-2 py-1 rounded-full ${st.color}`}>{st.label}</span>}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setUpdating(p)} className="text-xs text-teal-600 font-semibold hover:underline">Azhurno</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {updating && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setUpdating(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-gray-900">{updating.name}</h3>
              <button onClick={() => setUpdating(null)}><X className="w-4 h-4 text-gray-400"/></button>
            </div>
            <p className="text-xs text-gray-400">Në stok tani: {updating.stock_qty ?? 0} copë</p>
            <div className="flex gap-2">
              {[{ id: 'in', label: 'Erdhi Mall' }, { id: 'out', label: 'U Shit' }, { id: 'loss', label: 'Humbje' }].map(m => (
                <button key={m.id} onClick={() => setMovementType(m.id)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 ${movementType === m.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>{m.label}</button>
              ))}
            </div>
            <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Sa copë?"/>
            <Button onClick={handleUpdateStock} disabled={!qty} className="w-full gap-2 bg-teal-600 hover:bg-teal-700"><Check className="w-4 h-4"/>Azhurno Stokun</Button>
          </div>
        </div>
      )}
    </div>
  )
}
