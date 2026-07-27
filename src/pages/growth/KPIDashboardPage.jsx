import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Rocket, Plus, Trash2, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Target } from 'lucide-react'

const MONTHS_AL = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj']

const KPI_TEMPLATES = {
  'Të gjitha': [
    { id: 'revenue', label: 'Qarkullimi Mujor (ALL)', unit: 'ALL', target: '' },
    { id: 'customers', label: 'Klientë të Rinj', unit: 'nr', target: '' },
    { id: 'orders', label: 'Porosi / Shitje', unit: 'nr', target: '' },
    { id: 'avg_order', label: 'Vlera Mesatare e Porosisë (ALL)', unit: 'ALL', target: '' },
    { id: 'retention', label: 'Klientë Aktiv / Kthyes', unit: 'nr', target: '' },
    { id: 'expenses', label: 'Shpenzimet Mujore (ALL)', unit: 'ALL', target: '' },
  ],
  'Dyqan / Retail': [
    { id: 'revenue', label: 'Qarkullimi Ditor Mesatar (ALL)', unit: 'ALL', target: '' },
    { id: 'footfall', label: 'Vizitorë Ditë (Mesatare)', unit: 'nr', target: '' },
    { id: 'conversion', label: 'Blerës nga Vizitorët (%)', unit: '%', target: '' },
    { id: 'avg_basket', label: 'Blerje Mesatare (ALL)', unit: 'ALL', target: '' },
    { id: 'stock_rotation', label: 'Rrotullimi i Stokut (ditë)', unit: 'ditë', target: '' },
  ],
  'Restorant / Kafe': [
    { id: 'covers', label: 'Klientë të Shërbyer (Mesatare/Ditë)', unit: 'nr', target: '' },
    { id: 'revenue', label: 'Qarkullimi Ditor (ALL)', unit: 'ALL', target: '' },
    { id: 'avg_check', label: 'Fatura Mesatare (ALL)', unit: 'ALL', target: '' },
    { id: 'food_cost', label: 'Kostoja e Ushqimit (%)', unit: '%', target: '' },
    { id: 'table_turn', label: 'Rrotullimi i Tavolinës', unit: 'nr', target: '' },
  ],
  'Shërbime / Konsulencë': [
    { id: 'projects', label: 'Projekte Aktive', unit: 'nr', target: '' },
    { id: 'revenue', label: 'Të Ardhura Mujore (ALL)', unit: 'ALL', target: '' },
    { id: 'new_clients', label: 'Klientë të Rinj', unit: 'nr', target: '' },
    { id: 'hourly_rate', label: 'Tarifa Orare Efektive (ALL)', unit: 'ALL', target: '' },
    { id: 'satisfaction', label: 'Vlerësimi i Klientëve (1–10)', unit: '/10', target: '' },
  ],
}

function getTrend(values) {
  const nums = values.filter(v => v !== '').map(Number)
  if (nums.length < 2) return null
  const last = nums[nums.length - 1]
  const prev = nums[nums.length - 2]
  if (prev === 0) return null
  return ((last - prev) / prev) * 100
}

function Bar({ value, target }) {
  const pct = target ? Math.min(100, Math.round((Number(value) / Number(target)) * 100)) : 0
  if (!target || !value) return null
  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
        <span>vs. Target</span><span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${pct}%` }}/>
      </div>
    </div>
  )
}

function KPICard({ kpi, monthValues, onValueChange, onTargetChange, onRemove, months }) {
  const [expanded, setExpanded] = useState(false)
  const trend = getTrend(monthValues)
  const lastVal = [...monthValues].reverse().find(v => v !== '')
  const lastIdx = monthValues.map((v, i) => v !== '' ? i : -1).filter(i => i >= 0).pop() ?? -1
  const target = kpi.target

  return (
    <div className="card border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{kpi.label}</p>
            <div className="flex items-center gap-2 shrink-0">
              {trend !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-bold ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                  {trend > 0 ? <TrendingUp className="w-3 h-3"/> : trend < 0 ? <TrendingDown className="w-3 h-3"/> : <Minus className="w-3 h-3"/>}
                  {Math.abs(trend).toFixed(1)}%
                </span>
              )}
              <button onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-600">
                {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
              </button>
              <button onClick={onRemove} className="p-1 text-gray-300 hover:text-rose-500">
                <Trash2 className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>
          {lastVal && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-gray-800">{Number(lastVal).toLocaleString('sq-AL')}</span>
              <span className="text-xs text-gray-400">{kpi.unit} — {MONTHS_AL[lastIdx]}</span>
            </div>
          )}
          {target && lastVal && <Bar value={lastVal} target={target}/>}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-gray-400"/>
            <label className="text-xs text-gray-500">Target mujor:</label>
            <input type="number" value={kpi.target} onChange={e => onTargetChange(e.target.value)}
              placeholder="Vendos target..."
              className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-400"/>
            <span className="text-xs text-gray-400">{kpi.unit}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vlerat mujore</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {months.map((m, i) => (
                <div key={i}>
                  <p className="text-[10px] text-gray-400 text-center mb-0.5">{MONTHS_AL[m]}</p>
                  <input type="number" value={monthValues[i] || ''}
                    onChange={e => onValueChange(i, e.target.value)}
                    placeholder="–"
                    className="w-full px-1.5 py-1 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-green-400"/>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function KPIDashboardPage() {
  const { profile } = useAuth()
  const today = new Date()
  const year = today.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => i)

  const STORAGE_KEY = `kpi-data-${profile?.id || 'guest'}`

  const [kpis, setKpis] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return KPI_TEMPLATES['Të gjitha'].map(k => ({ ...k, values: Array(12).fill('') }))
  })

  const [template, setTemplate] = useState('Të gjitha')
  const [customLabel, setCustomLabel] = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(kpis)) } catch {}
  }, [kpis, STORAGE_KEY])

  function loadTemplate(t) {
    setTemplate(t)
    setKpis(KPI_TEMPLATES[t].map(k => ({ ...k, values: Array(12).fill('') })))
  }

  function updateValue(kpiIdx, monthIdx, val) {
    setKpis(prev => prev.map((k, i) => {
      if (i !== kpiIdx) return k
      const values = [...k.values]
      values[monthIdx] = val
      return { ...k, values }
    }))
  }

  function updateTarget(kpiIdx, val) {
    setKpis(prev => prev.map((k, i) => i === kpiIdx ? { ...k, target: val } : k))
  }

  function removeKPI(kpiIdx) {
    setKpis(prev => prev.filter((_, i) => i !== kpiIdx))
  }

  function addCustom() {
    if (!customLabel.trim()) return
    setKpis(prev => [...prev, { id: `custom-${Date.now()}`, label: customLabel.trim(), unit: '', target: '', values: Array(12).fill('') }])
    setCustomLabel('')
  }

  const summary = useMemo(() => {
    const curMonth = today.getMonth()
    return kpis.map(k => {
      const cur = Number(k.values[curMonth]) || 0
      const prev = Number(k.values[curMonth - 1]) || 0
      const trend = prev > 0 ? ((cur - prev) / prev) * 100 : null
      return { label: k.label, cur, trend, unit: k.unit, target: k.target }
    }).filter(s => s.cur > 0)
  }, [kpis, today])

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">KPI Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Monitoroni progresin e biznesit tuaj {year}</p>
        </div>
      </div>

      {/* Summary row */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {summary.slice(0, 6).map((s, i) => (
            <div key={i} className="card p-3 text-center">
              <p className="text-base font-bold text-gray-800">{s.cur.toLocaleString('sq-AL')}</p>
              <p className="text-[10px] text-gray-400">{s.unit}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{s.label}</p>
              {s.trend !== null && (
                <span className={`text-[10px] font-bold mt-0.5 flex items-center justify-center gap-0.5 ${s.trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {s.trend >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                  {Math.abs(s.trend).toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Template selector */}
      <div className="card">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Template sipas industrisë</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(KPI_TEMPLATES).map(t => (
            <button key={t} onClick={() => loadTemplate(t)}
              className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${template === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">Kujdes: ndërrimi i templateit fshin vlerat aktuale.</p>
      </div>

      {/* KPI list */}
      <div className="space-y-3">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.id} kpi={kpi} monthValues={kpi.values} months={months}
            onValueChange={(mi, v) => updateValue(i, mi, v)}
            onTargetChange={v => updateTarget(i, v)}
            onRemove={() => removeKPI(i)}/>
        ))}
      </div>

      {/* Add custom KPI */}
      <div className="card border-dashed border-2 border-gray-200">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Shto KPI të Personalizuar</p>
        <div className="flex gap-2">
          <input value={customLabel} onChange={e => setCustomLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustom() }}
            placeholder="p.sh. Ndjekës Instagram, Anëtarë të Rinj..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300"/>
          <Button onClick={addCustom} disabled={!customLabel.trim()} size="sm" className="bg-green-600 hover:bg-green-700 gap-1 shrink-0">
            <Plus className="w-4 h-4"/>Shto
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">Të dhënat ruhen automatikisht në browser.</p>
    </div>
  )
}
