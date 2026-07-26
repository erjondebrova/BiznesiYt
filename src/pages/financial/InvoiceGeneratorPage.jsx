import React, { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Plus, Trash2, Printer, FileText } from 'lucide-react'

function fmt(n) {
  return (parseFloat(n) || 0).toLocaleString('sq-AL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CURRENCIES = ['ALL', 'EUR', 'USD']

export default function InvoiceGeneratorPage() {
  const { profile } = useAuth()
  const printRef = useRef()

  const [invoiceNo, setInvoiceNo] = useState(() => `F-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`)
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10)
  })
  const [currency, setCurrency] = useState('ALL')
  const [vatEnabled, setVatEnabled] = useState(true)
  const [vatRate, setVatRate] = useState('20')

  const [seller, setSeller] = useState({
    name: profile?.business_name || '',
    nipt: '',
    address: profile?.city || '',
    phone: '',
    email: '',
  })
  const [buyer, setBuyer] = useState({ name: '', nipt: '', address: '', phone: '', email: '' })

  const [items, setItems] = useState([{ id: 1, desc: '', qty: '', price: '' }])
  const [notes, setNotes] = useState('Ju faleminderit për bashkëpunimin!')

  function addItem() {
    setItems(prev => [...prev, { id: Date.now(), desc: '', qty: '', price: '' }])
  }
  function updateItem(id, field, value) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.price) || 0), 0)
    const vatAmt = vatEnabled ? subtotal * (parseFloat(vatRate) / 100) : 0
    return { subtotal, vatAmt, total: subtotal + vatAmt }
  }, [items, vatEnabled, vatRate])

  function handlePrint() {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #invoice-printable { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          #invoice-printable { padding: 2cm; font-family: sans-serif; color: #000; }
        }
        @media screen { #invoice-printable { display: none; } }
      `}</style>

      {/* Print version */}
      <div id="invoice-printable">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid #1e40af', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e40af', margin: 0 }}>{seller.name || 'Biznesi'}</h1>
            {seller.nipt && <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>NIPT: {seller.nipt}</p>}
            {seller.address && <p style={{ fontSize: '0.85rem', color: '#444', margin: '2px 0' }}>{seller.address}</p>}
            {seller.phone && <p style={{ fontSize: '0.85rem', color: '#444', margin: '2px 0' }}>{seller.phone}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111', margin: 0 }}>FATURË</h2>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af', margin: '4px 0' }}>Nr. {invoiceNo}</p>
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '2px 0' }}>Datë lëshimi: {issueDate}</p>
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '2px 0' }}>Datë skadimi: {dueDate}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Faturëlëshësi</p>
            <p style={{ fontWeight: 700 }}>{seller.name}</p>
            {seller.nipt && <p style={{ fontSize: '0.85rem', color: '#555' }}>NIPT: {seller.nipt}</p>}
            {seller.address && <p style={{ fontSize: '0.85rem', color: '#555' }}>{seller.address}</p>}
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Blerësi</p>
            <p style={{ fontWeight: 700 }}>{buyer.name || '—'}</p>
            {buyer.nipt && <p style={{ fontSize: '0.85rem', color: '#555' }}>NIPT: {buyer.nipt}</p>}
            {buyer.address && <p style={{ fontSize: '0.85rem', color: '#555' }}>{buyer.address}</p>}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: '#1e40af', color: 'white' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Përshkrimi</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.8rem' }}>Sasia</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.8rem' }}>Çmimi ({currency})</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.8rem' }}>Totali ({currency})</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.desc || i.price).map((item, idx) => (
              <tr key={item.id} style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px 12px', fontSize: '0.85rem' }}>{item.desc || '—'}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.85rem' }}>{item.qty || 1}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.85rem' }}>{fmt(item.price)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.85rem' }}>{fmt((parseFloat(item.qty)||1) * (parseFloat(item.price)||0))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <span style={{ color: '#666' }}>Nëntotali</span>
              <span>{fmt(totals.subtotal)} {currency}</span>
            </div>
            {vatEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <span style={{ color: '#666' }}>TVSH {vatRate}%</span>
                <span>{fmt(totals.vatAmt)} {currency}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#1e40af', color: 'white', borderRadius: '8px', marginTop: '8px', fontWeight: 700, fontSize: '1rem' }}>
              <span>TOTAL</span>
              <span>{fmt(totals.total)} {currency}</span>
            </div>
          </div>
        </div>

        {notes && <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>{notes}</p>}
      </div>

      {/* Screen version */}
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900">Gjenerues Faturash</h1>
              <p className="text-xs text-gray-400 mt-0.5">Krijo faturë profesionale të gatshme për printim</p>
            </div>
          </div>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            <Printer className="w-4 h-4"/>Printo / PDF
          </button>
        </div>

        {/* Header info */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nr. Faturës</label>
            <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Datë Lëshimi</label>
            <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Datë Skadimi</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        {/* Seller & Buyer */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Faturëlëshësi (Unë)</p>
            <div className="space-y-2">
              {[['name','Emri i biznesit'],['nipt','NIPT'],['address','Adresa'],['phone','Tel'],['email','Email']].map(([f, label]) => (
                <input key={f} type="text" value={seller[f]} onChange={e => setSeller(p => ({...p, [f]: e.target.value}))}
                  placeholder={label}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              ))}
            </div>
          </div>
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Blerësi (Klienti)</p>
            <div className="space-y-2">
              {[['name','Emri i klientit'],['nipt','NIPT'],['address','Adresa'],['phone','Tel'],['email','Email']].map(([f, label]) => (
                <input key={f} type="text" value={buyer[f]} onChange={e => setBuyer(p => ({...p, [f]: e.target.value}))}
                  placeholder={label}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              ))}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Artikujt / Shërbimet</p>
            <div className="flex items-center gap-3">
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-xs font-bold text-gray-400 uppercase mb-2 px-1">
            <span>Përshkrimi</span>
            <span className="w-14 text-right">Sasia</span>
            <span className="w-24 text-right">Çmimi</span>
            <span className="w-24 text-right">Totali</span>
          </div>

          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
                <input value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)}
                  placeholder="Përshkrim shërbimi ose produkti..."
                  className="px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)}
                  placeholder="1" className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)}
                  placeholder="0.00" className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <span className="w-24 text-sm font-semibold text-gray-700 text-right pr-1">
                  {fmt((parseFloat(item.qty)||1) * (parseFloat(item.price)||0))}
                </span>
                <button onClick={() => items.length > 1 && setItems(prev => prev.filter(i => i.id !== item.id))}
                  className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            ))}
          </div>

          <button onClick={addItem} className="mt-3 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium">
            <Plus className="w-3.5 h-3.5"/>Shto artikull
          </button>
        </div>

        {/* VAT & Totals */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">TVSH & Totalet</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} className="w-4 h-4 accent-blue-600"/>
              Apliko TVSH
            </label>
          </div>

          {vatEnabled && (
            <div className="flex gap-2 mb-4">
              {['6','10','20'].map(r => (
                <button key={r} onClick={() => setVatRate(r)}
                  className={`px-3 py-1.5 text-sm font-bold rounded-lg border-2 transition-all ${vatRate === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                  {r}%
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nëntotali</span>
              <span className="font-semibold">{fmt(totals.subtotal)} {currency}</span>
            </div>
            {vatEnabled && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVSH {vatRate}%</span>
                <span className="font-semibold">{fmt(totals.vatAmt)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black bg-blue-600 text-white px-3 py-2.5 rounded-xl">
              <span>TOTAL</span>
              <span>{fmt(totals.total)} {currency}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Shënime / Kushte pagese</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
        </div>

        <button onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm">
          <Printer className="w-5 h-5"/>Printo Faturën / Ruaj si PDF
        </button>

        <p className="text-xs text-center text-gray-400">Hap dialogun e printimit → zgjidhni "Ruaj si PDF" për të shkarkuar.</p>
      </div>
    </>
  )
}
