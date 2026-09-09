import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Activity, Send, RefreshCw, ChevronDown, ChevronUp, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const QUESTIONS = [
  { id: 'revenue', label: 'Qarkullimi mujor aktual (ALL)', type: 'select', options: ['Nën 500,000', '500,000 – 1,000,000', '1,000,000 – 3,000,000', '3,000,000 – 8,000,000', 'Mbi 8,000,000'] },
  { id: 'employees', label: 'Numri i punonjësve', type: 'select', options: ['Vetëm unë', '2–5', '6–15', '16–50', 'Mbi 50'] },
  { id: 'years', label: 'Sa vjet është aktiv biznesi?', type: 'select', options: ['Më pak se 1 vit', '1–3 vjet', '3–7 vjet', 'Mbi 7 vjet'] },
  { id: 'growth', label: 'Tendenca e qarkullimit (6 muajt e fundit)', type: 'select', options: ['Rritje e shpejtë (>20%)', 'Rritje e ngadaltë (5–20%)', 'Stabil', 'Rënie e lehtë', 'Rënie e rëndë'] },
  { id: 'marketing', label: 'Si bëni marketing aktualisht?', type: 'multicheck', options: ['Social media organike', 'Reklama paguese (Meta/Google)', 'Fjalë goje / rekomandime', 'Website / SEO', 'Emaili / SMS', 'Nuk bëj marketing aktiv'] },
  { id: 'challenge', label: 'Sfida kryesore e biznesit tuaj?', type: 'select', options: ['Gjej klientë të rinj', 'Mbaj klientët ekzistues', 'Fluksi i parasë / likuiditeti', 'Konkurrenca e çmimeve', 'Stafi / punëtorët', 'Proceset / operacionet', 'Financim / kapital'] },
  { id: 'online', label: 'Prezenca online e biznesit', type: 'select', options: ['Nuk ka prezencë online', 'Vetëm Facebook/Instagram', 'Website + rrjete sociale', 'E-commerce aktiv', 'Prezencë e fortë dixhitale'] },
  { id: 'goal', label: 'Qëllimi kryesor për 12 muajt e ardhshëm', type: 'select', options: ['Rrit shitjet me 20–50%', 'Hap degë / pike të re', 'Fut produkt/shërbim të ri', 'Digjitalizoj biznesin', 'Redukto kostot', 'Gjej investitor / financim'] },
  { id: 'notes', label: 'Çfarë tjetër duhet të dijë këshilltari? (opsionale)', type: 'textarea' },
]

function parseSection(text, header) {
  const rx = new RegExp(`##\\s*${header}([\\s\\S]*?)(?:##|$)`, 'i')
  const m = text.match(rx)
  return m ? m[1].trim() : ''
}

function SWOTCard({ title, content, color, icon: Icon }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4"/>
        <p className="text-sm font-bold">{title}</p>
      </div>
      <div className="space-y-1.5">
        {content.split('\n').filter(l => l.trim()).map((line, i) => (
          <p key={i} className="text-xs leading-relaxed">{line.replace(/^[-•*]\s*/, '')}</p>
        ))}
      </div>
    </div>
  )
}

export default function BusinessDiagnosticPage() {
  const { profile } = useAuth()
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function setAnswer(id, val) {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  function toggleMulti(id, val) {
    setAnswers(prev => {
      const cur = prev[id] || []
      return { ...prev, [id]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] }
    })
  }

  const answered = QUESTIONS.filter(q => q.type !== 'textarea').filter(q => {
    const a = answers[q.id]
    return q.type === 'multicheck' ? (a && a.length > 0) : !!a
  }).length
  const required = QUESTIONS.filter(q => q.type !== 'textarea').length
  const ready = answered >= required - 1

  async function runDiagnostic() {
    setLoading(true)
    setResult(null)
    const summary = QUESTIONS.map(q => {
      const a = answers[q.id]
      if (!a) return ''
      return `${q.label}: ${Array.isArray(a) ? a.join(', ') : a}`
    }).filter(Boolean).join('\n')

    const prompt = `Diagnostikë e plotë biznesi për "${profile?.business_name || 'biznesi'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}:

${summary}

Bëj një SWOT analiz të plotë dhe diagnostikë biznesi me strukturën e mëposhtme:

## PIKËT E FORTA
[3-5 pika konkrete bazuar në të dhënat e dhëna]

## PIKËT E DOBËTA
[3-5 pika konkrete]

## MUNDËSITË
[3-5 mundësi konkrete për rritje]

## KËRCËNIMET
[2-4 rreziqe specifike]

## VLERËSIMI I SHËNDETIT
[Jep një vlerësim 1-10 dhe shpjegim 2-3 fjali]

## PRIORITETET URGJENTE
[Top 3 gjëra që duhet të bëjë TANI — konkrete dhe specifike]

Fol shqip. Ji shumë specifik dhe praktik.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je konsulent biznesi me 20 vjet eksperiencë me bizneset shqiptare të vogla dhe të mesme. Analizon situatat e bizneseve dhe jep rekomandime praktike, konkrete dhe të zbatueshme. Fol shqip gjithmonë.',
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

  if (result) {
    const strengths = parseSection(result, 'PIKËT E FORTA')
    const weaknesses = parseSection(result, 'PIKËT E DOBËTA')
    const opportunities = parseSection(result, 'MUNDËSITË')
    const threats = parseSection(result, 'KËRCËNIMET')
    const health = parseSection(result, 'VLERËSIMI I SHËNDETIT')
    const priorities = parseSection(result, 'PRIORITETET URGJENTE')

    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Diagnostikë Biznesi</h1>
            <p className="text-xs text-gray-400 mt-0.5">Rezultati i analizës</p>
          </div>
        </div>

        {health && (
          <div className="card bg-green-50 border border-green-200">
            <p className="text-xs font-bold text-green-600 uppercase mb-1">Shëndeti i Biznesit</p>
            <p className="text-sm text-gray-700 leading-relaxed">{health}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SWOTCard title="Pikat e Forta" content={strengths} color="bg-emerald-50 text-emerald-800" icon={TrendingUp}/>
          <SWOTCard title="Pikat e Dobëta" content={weaknesses} color="bg-rose-50 text-rose-800" icon={TrendingDown}/>
          <SWOTCard title="Mundësitë" content={opportunities} color="bg-blue-50 text-blue-800" icon={CheckCircle}/>
          <SWOTCard title="Kërcënimet" content={threats} color="bg-amber-50 text-amber-800" icon={AlertCircle}/>
        </div>

        {priorities && (
          <div className="card border border-purple-200 bg-purple-50/50">
            <p className="text-xs font-bold text-purple-600 uppercase mb-2">Prioritetet Urgjente — Bëji Tani</p>
            <div className="space-y-2">
              {priorities.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center shrink-0 font-bold">{i+1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{line.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => { setResult(null); setAnswers({}) }} variant="outline" className="flex-1">Diagnostikë e Re</Button>
          <Link to="/growth/plan" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700">Krijo Plan 90-Ditor →</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Diagnostikë Biznesi</h1>
          <p className="text-xs text-gray-400 mt-0.5">Analizo gjendjen aktuale të biznesit tuaj</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.round((answered/required)*100)}%` }}/>
        </div>
        <span className="text-xs text-gray-400">{answered}/{required} pyetje</span>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map(q => (
          <div key={q.id} className="card">
            <label className="block text-sm font-semibold text-gray-900 mb-2">{q.label}</label>
            {q.type === 'select' && (
              <div className="space-y-2">
                {q.options.map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${answers[q.id] === opt ? 'border-green-500 bg-green-500' : 'border-gray-300 group-hover:border-green-300'}`}>
                      {answers[q.id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                    </div>
                    <span className={`text-sm ${answers[q.id] === opt ? 'text-green-700 font-medium' : 'text-gray-600'}`}>{opt}</span>
                    <input type="radio" className="sr-only" checked={answers[q.id] === opt} onChange={() => setAnswer(q.id, opt)} />
                  </label>
                ))}
              </div>
            )}
            {q.type === 'multicheck' && (
              <div className="flex flex-wrap gap-2">
                {q.options.map(opt => {
                  const sel = (answers[q.id] || []).includes(opt)
                  return (
                    <button key={opt} onClick={() => toggleMulti(q.id, opt)}
                      className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${sel ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}
            {q.type === 'textarea' && (
              <textarea value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)}
                placeholder="Opsionale..." rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300 resize-none"/>
            )}
          </div>
        ))}
      </div>

      <Button onClick={runDiagnostic} disabled={!ready || loading}
        className="w-full gap-2 bg-green-600 hover:bg-green-700" size="lg">
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin"/>Duke analizuar...</> : <><Activity className="w-4 h-4"/>Analizo Biznesin</>}
      </Button>
    </div>
  )
}
