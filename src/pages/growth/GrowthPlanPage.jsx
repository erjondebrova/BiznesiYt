import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Target, RefreshCw, ChevronDown, ChevronUp, Calendar } from 'lucide-react'

const GOALS = [
  'Rrit shitjet me 30%+', 'Gjej 50+ klientë të rinj', 'Hap kanal/produkt të ri',
  'Digjitalizoj biznesin', 'Redukto kostot me 20%', 'Ndërtoj ekip të fortë',
  'Hap degë / lokacion të ri', 'Gjej investitor / financim',
]

const FOCUS_AREAS = [
  'Marketing & Shitje', 'Operacione & Procese', 'Ekip & HR',
  'Produkt / Shërbim i Ri', 'Financat & Kostot', 'Teknologji & Dixhitalizim',
]

function parseWeeks(text, weekLabel) {
  const rx = new RegExp(`${weekLabel}([\\s\\S]*?)(?:###|##|$)`, 'i')
  const m = text.match(rx)
  return m ? m[1].trim() : ''
}

function WeekBlock({ title, content, color }) {
  const [open, setOpen] = useState(true)
  const lines = content.split('\n').filter(l => l.trim()).map(l => l.replace(/^[-•*\d.]\s*/, ''))
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${color.border}`}>
      <button onClick={() => setOpen(o => !o)} className={`w-full flex items-center justify-between px-4 py-3 ${color.header}`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4"/>
          <span className="text-sm font-bold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 bg-white">
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`w-5 h-5 rounded-full ${color.dot} text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5`}>{i+1}</span>
              <p className="text-sm text-gray-700 leading-relaxed">{line}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GrowthPlanPage() {
  const { profile } = useAuth()
  const [goal, setGoal] = useState('')
  const [focus, setFocus] = useState([])
  const [budget, setBudget] = useState('')
  const [constraint, setConstraint] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function toggleFocus(f) {
    setFocus(prev => prev.includes(f) ? prev.filter(x => x !== f) : prev.length < 3 ? [...prev, f] : prev)
  }

  const ready = goal && focus.length > 0 && budget

  async function generate() {
    setLoading(true)
    setResult(null)

    const prompt = `Krijo një plan konkret rritjeje 90 ditore për biznesin shqiptar:

Biznesi: "${profile?.business_name || ''}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}
Qëllimi kryesor: ${goal}
Fushat e fokusit: ${focus.join(', ')}
Buxheti mujor disponibël: ${budget}
${constraint ? `Kufizime/sfida: ${constraint}` : ''}

Jep plan të detajuar me strukturën EKZAKTE:

## JAVA 1–30 (Muaji i Parë)
[5–7 hapa konkretë dhe të zbatueshëm]

### JAVA 31–60 (Muaji i Dytë)
[5–7 hapa konkretë]

### JAVA 61–90 (Muaji i Tretë)
[5–7 hapa konkretë]

## TREGUESIT E SUKSESIT (KPI)
[4–5 metrika konkrete për të matur progresin]

## PARALAJMËRIMET
[2–3 gabime të shpeshta për t'i shmangur]

Çdo hap duhet të jetë: specifik, i matshëm dhe i zbatueshëm nga një pronar biznesi pa ekspertizë të veçantë. Fol shqip.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je konsulent biznesi strategjik me eksperiencë të thellë me bizneset shqiptare. Krijon plane rritjeje praktike, hap-pas-hapi, të zbatueshme nga sipërmarrës me burime të kufizuara. Fol shqip gjithmonë.',
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
              if (delta) fullText += delta
            } catch {}
          }
        }
        setResult(fullText)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const WEEK_COLORS = [
    { border: 'border-emerald-200', header: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
    { border: 'border-blue-200',    header: 'bg-blue-50 text-blue-800',       dot: 'bg-blue-500' },
    { border: 'border-purple-200',  header: 'bg-purple-50 text-purple-800',   dot: 'bg-purple-500' },
  ]

  if (result) {
    const month1 = parseWeeks(result, '## JAVA 1.30')
    const month2 = parseWeeks(result, '### JAVA 31.60') || parseWeeks(result, '## JAVA 31.60')
    const month3 = parseWeeks(result, '### JAVA 61.90') || parseWeeks(result, '## JAVA 61.90')
    const kpiRx = /## TREGUESIT E SUKSESIT[^\n]*([\s\S]*?)(?:##|$)/i
    const kpiM = result.match(kpiRx)
    const kpi = kpiM ? kpiM[1].trim() : ''
    const warnRx = /## PARALAJMËRIMET[^\n]*([\s\S]*?)(?:##|$)/i
    const warnM = result.match(warnRx)
    const warn = warnM ? warnM[1].trim() : ''

    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Plan Rritje 90-Ditor</h1>
            <p className="text-xs text-gray-400 mt-0.5">Qëllimi: {goal}</p>
          </div>
        </div>

        {month1 && <WeekBlock title="Muaji i Parë (Dita 1–30)" content={month1} color={WEEK_COLORS[0]}/>}
        {month2 && <WeekBlock title="Muaji i Dytë (Dita 31–60)" content={month2} color={WEEK_COLORS[1]}/>}
        {month3 && <WeekBlock title="Muaji i Tretë (Dita 61–90)" content={month3} color={WEEK_COLORS[2]}/>}

        {kpi && (
          <div className="card border border-emerald-200 bg-emerald-50/50">
            <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Treguesit e Suksesit (KPI)</p>
            <div className="space-y-1.5">
              {kpi.split('\n').filter(l => l.trim()).map((line, i) => (
                <p key={i} className="text-sm text-gray-700">{line.replace(/^[-•*\d.]\s*/, '')}</p>
              ))}
            </div>
          </div>
        )}

        {warn && (
          <div className="card border border-amber-200 bg-amber-50/50">
            <p className="text-xs font-bold text-amber-600 uppercase mb-2">Gabime për t'i Shmangur</p>
            <div className="space-y-1.5">
              {warn.split('\n').filter(l => l.trim()).map((line, i) => (
                <p key={i} className="text-sm text-gray-700">{line.replace(/^[-•*\d.]\s*/, '')}</p>
              ))}
            </div>
          </div>
        )}

        <Button onClick={() => { setResult(null) }} variant="outline" className="w-full">Gjenero Plan të Ri</Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Plan Rritje 90-Ditor</h1>
          <p className="text-xs text-gray-400 mt-0.5">Hapa konkretë për 3 muajt e ardhshëm</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Qëllimi kryesor</label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(g => (
            <button key={g} onClick={() => setGoal(g)}
              className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${goal === g ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {g}
            </button>
          ))}
        </div>
        <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ose shkruaj qëllimin tënd..."
          className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300"/>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-1">Fushat e fokusit (max 3)</label>
        <p className="text-xs text-gray-400 mb-2">Zgjidhni ku doni të përqendroheni</p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map(f => (
            <button key={f} onClick={() => toggleFocus(f)}
              className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${focus.includes(f) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'} ${focus.length >= 3 && !focus.includes(f) ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Buxheti mujor për marketing/investim</label>
        <div className="grid grid-cols-2 gap-2">
          {['Nën 50,000 ALL', '50,000–150,000 ALL', '150,000–500,000 ALL', 'Mbi 500,000 ALL'].map(b => (
            <button key={b} onClick={() => setBudget(b)}
              className={`text-xs px-3 py-2 rounded-xl border-2 font-medium transition-all text-left ${budget === b ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Kufizime ose sfida (opsionale)</label>
        <textarea value={constraint} onChange={e => setConstraint(e.target.value)}
          placeholder="p.sh. Nuk kam kohë shtesë, jam vetëm unë, nuk di për marketing dixhital..."
          rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300 resize-none"/>
      </div>

      <Button onClick={generate} disabled={!ready || loading} className="w-full gap-2 bg-green-600 hover:bg-green-700" size="lg">
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin"/>Po gjenerohet plani...</> : <><Target className="w-4 h-4"/>Gjenero Planin 90-Ditor</>}
      </Button>
    </div>
  )
}
