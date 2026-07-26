import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowLeftRight, Receipt, AlertCircle } from 'lucide-react'

const VAT_RATES = [
  { id: '20', label: '20% — Standarde', desc: 'Shumica e mallrave dhe shërbimeve' },
  { id: '10', label: '10% — E reduktuar', desc: 'Ushqime bazë, libra, ilaçe, turizëm' },
  { id: '6',  label: '6% — E reduktuar', desc: 'Shërbime specifike' },
  { id: '0',  label: '0% — E zero', desc: 'Eksporte, shërbime ndërkombëtare' },
]

const TAX_REGIMES = [
  { id: 'small',    label: 'Biznes i Vogël', limit: '0 – 10 milion ALL/vit', rate: '0%',   note: 'Pa TVSH, pa tatim fitimi' },
  { id: 'simple',   label: 'Tatim i Thjeshtëzuar', limit: '10 – 14 milion ALL/vit', rate: '7.5%', note: 'Mbi qarkullimin total' },
  { id: 'normal',   label: 'Tatimi Mbi Fitimin', limit: '14+ milion ALL/vit', rate: '15%', note: 'Mbi fitimin neto' },
]

function fmt(n) {
  if (isNaN(n)) return '0'
  return n.toLocaleString('sq-AL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function ResultRow({ label, value, highlight, sub }) {
  return (
    <div className={`flex justify-between items-center py-2.5 px-3 rounded-lg ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
      <span className={`text-sm ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>{label}</span>
      <div className="text-right">
        <span className={`text-sm font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value} ALL</span>
        {sub && <p className={`text-xs ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{sub}</p>}
      </div>
    </div>
  )
}

export default function VATCalculatorPage() {
  const [mode, setMode] = useState('add')   // 'add' = pa TVSH → me TVSH | 'remove' = me TVSH → pa TVSH
  const [amount, setAmount] = useState('')
  const [vatRate, setVatRate] = useState('20')
  const [activeTab, setActiveTab] = useState('tvsh')  // 'tvsh' | 'tatimi' | 'quarterly'
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')

  const calc = useMemo(() => {
    const amt = parseFloat(amount) || 0
    const rate = parseFloat(vatRate) / 100
    if (!amt) return null
    if (mode === 'add') {
      const base = amt
      const vatAmt = base * rate
      const total = base + vatAmt
      return { base, vatAmt, total, vatPct: parseFloat(vatRate) }
    } else {
      const total = amt
      const base = total / (1 + rate)
      const vatAmt = total - base
      return { base, vatAmt, total, vatPct: parseFloat(vatRate) }
    }
  }, [amount, vatRate, mode])

  const quarterlyTotal = useMemo(() => {
    const q1n = parseFloat(q1) || 0
    const q2n = parseFloat(q2) || 0
    const q3n = parseFloat(q3) || 0
    const total = q1n + q2n + q3n
    const rate = parseFloat(vatRate) / 100
    const base = total / (1 + rate)
    const vatOwed = total - base
    return { totalRevenue: total, base, vatOwed }
  }, [q1, q2, q3, vatRate])

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Llogaritës TVSH & Tatimi</h1>
          <p className="text-xs text-gray-400 mt-0.5">TVSH 20%, tatimi i thjeshtëzuar, regjimi fiskal</p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[['tvsh','TVSH'],['tatimi','Tatimi'],['quarterly','Deklarimi Tremujor']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'tvsh' && (
        <>
          <div className="card space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-2">
              <button onClick={() => setMode('add')}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${mode === 'add' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                Pa TVSH → Me TVSH
              </button>
              <button className="p-3 text-gray-400 hover:text-gray-600" onClick={() => setMode(m => m === 'add' ? 'remove' : 'add')}>
                <ArrowLeftRight className="w-4 h-4"/>
              </button>
              <button onClick={() => setMode('remove')}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${mode === 'remove' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                Me TVSH → Pa TVSH
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {mode === 'add' ? 'Çmimi pa TVSH (ALL)' : 'Çmimi me TVSH (ALL)'}
              </label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Fut shumën..."
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 text-right" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Norma e TVSH-së</label>
              <div className="grid grid-cols-2 gap-2">
                {VAT_RATES.map(r => (
                  <button key={r.id} onClick={() => setVatRate(r.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border-2 text-left transition-all ${vatRate === r.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-sm font-bold text-gray-900">{r.label}</span>
                    <span className="text-xs text-gray-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {calc && (
            <div className="card space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Rezultati</p>
              <ResultRow label="Çmimi pa TVSH (baza)" value={fmt(calc.base)} />
              <ResultRow label={`TVSH ${calc.vatPct}%`} value={fmt(calc.vatAmt)} />
              <ResultRow label="Çmimi TOTAL me TVSH" value={fmt(calc.total)} highlight />
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Për çdo <strong>100 ALL</strong> pa TVSH → klienti paguan <strong>{fmt(100 + parseFloat(vatRate))} ALL</strong> · TVSH-ja e pagueshme: <strong>{vatRate} ALL</strong>
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'tatimi' && (
        <div className="space-y-3">
          <div className="card">
            <div className="flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>
              <p className="text-xs text-gray-500">Regjimi fiskal varet nga qarkullimi vjetor. Tarifat janë orientuese — konsultohuni me kontabilistin tuaj.</p>
            </div>
            <div className="space-y-3">
              {TAX_REGIMES.map((r, i) => (
                <div key={r.id} className={`rounded-xl p-4 border-2 ${i === 0 ? 'border-emerald-200 bg-emerald-50' : i === 1 ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.limit}</p>
                    </div>
                    <span className={`text-xl font-black ${i === 0 ? 'text-emerald-600' : i === 1 ? 'text-amber-600' : 'text-blue-600'}`}>{r.rate}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/50">{r.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Norma e Tatimit mbi Fitimin</p>
            <div className="space-y-2">
              {[['Biznese me qarkullim < 14M ALL/vit','0%','Të liruar'],['Biznese me qarkullim 14M+ ALL/vit','15%','Mbi fitimin neto']].map(([label, rate, note]) => (
                <div key={label} className="flex justify-between items-center py-2">
                  <div><p className="text-sm text-gray-700">{label}</p><p className="text-xs text-gray-400">{note}</p></div>
                  <span className="text-base font-black text-gray-900">{rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quarterly' && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm font-semibold text-gray-900 mb-1">Llogaritës Deklarimi Tremujor TVSH</p>
            <p className="text-xs text-gray-400 mb-4">Fut shitjet totale (me TVSH) për 3 muajt e tremujorit</p>
            <div className="space-y-3">
              {[['Muaji 1',q1,setQ1],['Muaji 2',q2,setQ2],['Muaji 3',q3,setQ3]].map(([label, val, setVal]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
                  <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="0"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <span className="text-xs text-gray-400">ALL</span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 mt-4">Norma TVSH</label>
              <div className="flex gap-2">
                {['20','10','6'].map(r => (
                  <button key={r} onClick={() => setVatRate(r)}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-all ${vatRate === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {quarterlyTotal.totalRevenue > 0 && (
            <div className="card space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Deklarimi i Tremujorit</p>
              <ResultRow label="Total shitjet (me TVSH)" value={fmt(quarterlyTotal.totalRevenue)} />
              <ResultRow label="Baza e tatueshme (pa TVSH)" value={fmt(quarterlyTotal.base)} />
              <ResultRow label={`TVSH e pagueshme (${vatRate}%)`} value={fmt(quarterlyTotal.vatOwed)} highlight />
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Receipt className="w-3 h-3"/>
                  Kjo shumë duhet deklaruar dhe paguar brenda 14 ditëve pas mbarimit të tremujorit.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
