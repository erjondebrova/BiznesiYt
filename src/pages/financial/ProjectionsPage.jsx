import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, TrendingUp, RefreshCw, RotateCcw, Sparkles } from 'lucide-react'

const MONTHS_AL = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']

const SCENARIOS = [
  { id: 'conservative', label: '🛡️ Konservator', desc: 'Rritje e ngadaltë, kujdes ndaj rreziqeve' },
  { id: 'realistic',    label: '📊 Realist',      desc: 'Bazuar në trendet aktuale' },
  { id: 'aggressive',   label: '🚀 Ambicioz',      desc: 'Rritje e shpejtë me investime' },
]

const GOALS = [
  { id: 'grow_revenue',  label: 'Rrit të Ardhurat' },
  { id: 'cut_costs',     label: 'Ul Shpenzimet'    },
  { id: 'expand',        label: 'Zgjero Biznesin'  },
  { id: 'stabilize',     label: 'Stabilizim'       },
]

function fmt(n) {
  if (!n && n !== 0) return '–'
  return Math.round(n).toLocaleString('sq-AL')
}

function ProjectionRow({ label, optimist, realist, pessimist, isTotal }) {
  return (
    <tr className={isTotal ? 'bg-gray-50 font-bold' : 'border-b border-gray-50'}>
      <td className="py-2.5 px-3 text-sm text-gray-700">{label}</td>
      <td className="py-2.5 px-3 text-sm text-emerald-600 text-right">{fmt(optimist)}</td>
      <td className="py-2.5 px-3 text-sm text-blue-600 text-right">{fmt(realist)}</td>
      <td className="py-2.5 px-3 text-sm text-amber-600 text-right">{fmt(pessimist)}</td>
    </tr>
  )
}

function parseProjections(text) {
  const rows = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.includes('|')) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 3 && !cols[0].includes('---') && !cols[0].toLowerCase().includes('muaj')) {
        const nums = cols.slice(1).map(c => {
          const n = c.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')
          return parseFloat(n) || null
        })
        if (nums.some(n => n !== null)) {
          rows.push({ label: cols[0], optimist: nums[0], realist: nums[1], pessimist: nums[2] })
        }
      }
    }
  }
  return rows
}

function parseNarrative(text) {
  const sections = {}
  const keys = ['SUPOZIMET', 'MUNDËSITË', 'RREZIQET', 'HAPAT E ARDHSHËM']
  for (const key of keys) {
    const regex = new RegExp(`## ${key}([\\s\\S]*?)(?:##|$)`, 'i')
    const m = text.match(regex)
    if (m) sections[key] = m[1].trim()
  }
  return sections
}

export default function ProjectionsPage() {
  const { profile } = useAuth()
  const now = new Date()
  const currentMonth = now.getMonth()

  const [revenues, setRevenues] = useState(['', '', ''])
  const [expenses, setExpenses] = useState('')
  const [scenario, setScenario] = useState('realistic')
  const [goal, setGoal] = useState('grow_revenue')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  const pastMonths = [
    MONTHS_AL[(currentMonth - 3 + 12) % 12],
    MONTHS_AL[(currentMonth - 2 + 12) % 12],
    MONTHS_AL[(currentMonth - 1 + 12) % 12],
  ]

  const nextMonths = Array.from({ length: 6 }, (_, i) => MONTHS_AL[(currentMonth + i) % 12])

  async function generate() {
    const filledRevenues = revenues.filter(r => r)
    if (!filledRevenues.length || !expenses) return
    setLoading(true)
    setStreamingText('')
    setResult(null)

    const revsText = pastMonths.map((m, i) => revenues[i] ? `${m}: ${parseInt(revenues[i]).toLocaleString('sq-AL')} ALL` : null).filter(Boolean).join(', ')
    const scenarioLabel = SCENARIOS.find(s => s.id === scenario)?.label || ''
    const goalLabel = GOALS.find(g => g.id === goal)?.label || ''

    const prompt = `Gjenero projeksione financiare 6-mujore për biznesin "${profile?.business_name || 'imi'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

HISTORIKU I TË ARDHURAVE (3 muajt e fundit):
${revsText}

SHPENZIME MUJORE: ~${parseInt(expenses).toLocaleString('sq-AL')} ALL
SKENARI: ${scenarioLabel}
OBJEKTIVI: ${goalLabel}
${notes ? `SHËNIME: ${notes}` : ''}

Muajt e ardhshëm: ${nextMonths.join(', ')}

Gjenero projeksionet EKSAKT si tabelë (3 kolona: Optimist / Realist / Pesimist):

| Muaji | Optimist (ALL) | Realist (ALL) | Pesimist (ALL) |
|-------|---------------|---------------|----------------|
${nextMonths.map(m => `| ${m} | [nr] | [nr] | [nr] |`).join('\n')}

Pastaj:

## SUPOZIMET
[Çfarë supozove për çdo skenar — 3-4 pika]

## MUNDËSITË
[2-3 mundësi konkrete për të arritur skenarin optimist]

## RREZIQET
[2-3 rreziqe që mund ta çojnë biznesin drejt skenarit pesimist]

## HAPAT E ARDHSHËM
[3 hapa konkretë që duhet të bësh muajin e ardhshëm]

Fol shqip. Numrat duhet të jenë REALISTË bazuar në historikun e dhënë.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert financiar për biznese shqiptare të vogla dhe të mesme. Gjenero projeksione financiare realiste dhe të argumentuara bazuar në të dhënat historike. Fol shqip.',
        }),
      })
      if (res.ok) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || ''
              if (delta) { fullText += delta; setStreamingText(fullText) }
            } catch {}
          }
        }
        setResult({ rows: parseProjections(fullText), narrative: parseNarrative(fullText), raw: fullText })
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Projeksione 6-Mujore</h1>
        </div>
        <div className="card border border-violet-100 bg-violet-50/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center animate-pulse">
              <TrendingUp className="w-4 h-4 text-white"/>
            </div>
            <p className="text-sm font-semibold text-gray-900">Duke llogaritur projeksionet...</p>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-3 border border-violet-100 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-violet-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-violet-500"/>Duke menduar...</div>
          )}
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900">Projeksionet tuaja</h1>
              <p className="text-xs text-gray-400">{SCENARIOS.find(s=>s.id===scenario)?.label} · {nextMonths[0]}–{nextMonths[5]}</p>
            </div>
          </div>
          <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"/>Optimist</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"/>Realist</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"/>Pesimist</span>
        </div>

        {result.rows.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 text-left">Muaji</th>
                    <th className="py-3 px-3 text-xs font-bold text-emerald-600 text-right">Optimist</th>
                    <th className="py-3 px-3 text-xs font-bold text-blue-600 text-right">Realist</th>
                    <th className="py-3 px-3 text-xs font-bold text-amber-600 text-right">Pesimist</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => <ProjectionRow key={i} {...row} />)}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 p-3 border-t border-gray-50">Vlerat janë në ALL. Të ardhura të parashikuara.</p>
          </div>
        )}

        {Object.entries(result.narrative).map(([key, content]) => {
          const styles = {
            'SUPOZIMET':        'border-gray-200 bg-gray-50',
            'MUNDËSITË':        'border-emerald-200 bg-emerald-50/40',
            'RREZIQET':         'border-rose-200 bg-rose-50/40',
            'HAPAT E ARDHSHËM': 'border-violet-200 bg-violet-50/40',
          }
          const labelStyles = {
            'SUPOZIMET':        'text-gray-600',
            'MUNDËSITË':        'text-emerald-700',
            'RREZIQET':         'text-rose-700',
            'HAPAT E ARDHSHËM': 'text-violet-700',
          }
          return (
            <div key={key} className={`rounded-xl border-2 p-4 ${styles[key] || 'border-gray-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${labelStyles[key] || 'text-gray-600'}`}>{key}</p>
              <div className="space-y-1.5">
                {content.split('\n').filter(l => l.trim()).map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">{line.replace(/^[-•\d.]\s*/, '').replace(/\*\*/g, '')}</p>
                ))}
              </div>
            </div>
          )
        })}

        <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2">
          <RotateCcw className="w-4 h-4"/>Projeksione të reja
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Projeksione 6-Mujore</h1>
          <p className="text-xs text-gray-400 mt-0.5">3 skenarë financiarë bazuar në historikun tuaj</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Të Ardhurat — 3 Muajt e Fundit (ALL)</label>
        <div className="space-y-2">
          {pastMonths.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20 shrink-0">{m}</span>
              <input type="number" value={revenues[i]} onChange={e => {
                const next = [...revenues]; next[i] = e.target.value; setRevenues(next)
              }} placeholder="0"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-right" />
              <span className="text-xs text-gray-400">ALL</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Shpenzime Mesatare Mujore (ALL)</label>
        <div className="flex items-center gap-3">
          <input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} placeholder="p.sh. 300,000"
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-right" />
          <span className="text-xs text-gray-400">ALL</span>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Skenari i Projeksioneve</label>
        <div className="space-y-2">
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => setScenario(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${scenario === s.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              {scenario === s.id && <span className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"><span className="w-2 h-2 bg-white rounded-full"/></span>}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Objektivi kryesor</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button key={g.id} onClick={() => setGoal(g.id)}
              className={`py-2.5 text-sm rounded-xl border-2 font-medium transition-all ${goal === g.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Planet ose ndryshimet e ardhshme <span className="text-gray-400 font-normal">(opsionale)</span>
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="p.sh. Planifikoj të hap një degë tjetër në mars, ose kam një kontratë të re që fillon në prill..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-gray-300 resize-none" />
      </div>

      <Button onClick={generate} disabled={!revenues.some(r => r) || !expenses}
        className="w-full gap-2 bg-violet-600 hover:bg-violet-700" size="lg">
        <Sparkles className="w-5 h-5"/>Gjenero Projeksionet
      </Button>
    </div>
  )
}
