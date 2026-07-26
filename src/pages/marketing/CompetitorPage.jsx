import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  ArrowLeft, Sparkles, RefreshCw, TrendingUp, AlertTriangle,
  Target, Check, Copy, DollarSign, Megaphone, Star, Users,
  Zap, Shield, BarChart2, ChevronDown, ChevronUp, RotateCcw,
  Bot, Lightbulb, ArrowRight, CheckCircle2, Plus, X
} from 'lucide-react'
import { usePlanLimits } from '../../hooks/usePlanLimits'
import LimitReachedPopup from '../../components/LimitReachedPopup'

const FOCUS_AREAS = [
  { id: 'pricing',   label: 'Çmime & Oferta',      icon: DollarSign },
  { id: 'marketing', label: 'Marketing & Social',   icon: Megaphone  },
  { id: 'product',   label: 'Produkt & Shërbim',    icon: Star       },
  { id: 'customers', label: 'Klientelë & Pozicion', icon: Users      },
]

function CompetitorCard({ comp }) {
  const [open, setOpen] = useState(true)

  const lines = comp.content.split('\n').filter(l => l.trim())

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{comp.name}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-2.5">
          {lines.map((line, i) => {
            const boldMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)/)
            if (boldMatch) {
              return (
                <div key={i}>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {boldMatch[1]}
                  </span>
                  <p className="text-sm text-gray-700 mt-0.5">{boldMatch[2]}</p>
                </div>
              )
            }
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{line.slice(2)}</span>
                </div>
              )
            }
            if (line.trim()) {
              return <p key={i} className="text-sm text-gray-600">{line}</p>
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

function ActionItem({ text, priority, checked, onToggle }) {
  const priorityStyle = {
    'URGJENT': 'bg-red-100 text-red-700',
    'I RËNDËSISHËM': 'bg-amber-100 text-amber-700',
    'AFATMESËM': 'bg-blue-100 text-blue-700',
  }
  const badge = Object.keys(priorityStyle).find(k => priority?.toUpperCase().includes(k))

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 cursor-pointer transition-colors group"
      onClick={onToggle}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${checked ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-indigo-400'}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{text}</p>
      </div>
      {badge && !checked && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityStyle[badge]}`}>
          {badge}
        </span>
      )}
    </div>
  )
}

function parseSections(text) {
  const result = { summary: '', competitors: [], opportunities: [], risks: [], gaps: '', actionPlan: [] }
  const parts = text.split(/^## /m).filter(Boolean)

  for (const part of parts) {
    const lines = part.split('\n')
    const header = lines[0].toUpperCase().trim()
    const content = lines.slice(1).join('\n').trim()

    if (header.includes('PERMBLEDH') || header.includes('EKZEKUT')) {
      result.summary = content
    } else if (header.includes('KONKURRENT')) {
      const name = lines[0].replace(/^KONKURRENTI:\s*/i, '').replace(/^KONKURRENCA:\s*/i, '').trim()
      result.competitors.push({ name, content })
    } else if (header.includes('MUNDËSI') || header.includes('MUNDESI')) {
      result.opportunities = content.split('\n')
        .map(l => l.replace(/^[\*\-•\d\.]\s*/, '').trim())
        .filter(l => l.length > 3)
    } else if (header.includes('RREZIQ')) {
      result.risks = content.split('\n')
        .map(l => l.replace(/^[\*\-•\d\.]\s*/, '').trim())
        .filter(l => l.length > 3)
    } else if (header.includes('HENDEK') || header.includes('BLUE') || header.includes('UNIK')) {
      result.gaps = content
    } else if (header.includes('VEPRIM') || header.includes('PLAN')) {
      result.actionPlan = content.split('\n')
        .filter(l => /^\d+\./.test(l.trim()))
        .map(l => {
          const clean = l.trim().replace(/^\d+\.\s*/, '')
          const parts = clean.split(/\s*[—–-]\s*/)
          return { text: parts[0].trim(), priority: parts[1]?.trim() || '' }
        })
        .filter(l => l.text.length > 3)
    }
  }

  return result
}

export default function CompetitorPage() {
  const { profile } = useAuth()
  const { checkLimit, incrementUsage } = usePlanLimits()
  const [limitPopup, setLimitPopup] = useState(null)

  const [competitors, setCompetitors] = useState([
    { name: '', notes: '' },
    { name: '', notes: '' },
    { name: '', notes: '' },
  ])
  const [focus, setFocus] = useState([])
  const [myStrength, setMyStrength] = useState('')

  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [sections, setSections] = useState(null)
  const [checkedActions, setCheckedActions] = useState({})
  const [copied, setCopied] = useState(false)
  const [rawText, setRawText] = useState('')

  function updateComp(i, field, val) {
    setCompetitors(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }

  function toggleFocus(id) {
    setFocus(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const validComps = competitors.filter(c => c.name.trim())

  async function analyze() {
    if (!validComps.length) return

    const { allowed, used, limit } = checkLimit('competitor_analyses')
    if (!allowed) {
      setLimitPopup({ feature: 'competitor_analyses', used, limit })
      return
    }

    setStreaming(true)
    setStreamingText('')
    setSections(null)
    setCheckedActions({})
    setRawText('')

    const focusText = focus.length
      ? `Fokuso analizën te: ${focus.map(f => FOCUS_AREAS.find(a => a.id === f)?.label).join(', ')}.`
      : 'Bëj analizë të plotë nga të gjitha aspektet.'

    const compDetails = validComps.map((c, i) =>
      `${i + 1}. ${c.name}${c.notes ? ` — ${c.notes}` : ''}`
    ).join('\n')

    const prompt = `Analizo konkurrencën për biznesin "${profile?.business_name || 'tonin'}" (${profile?.industry || 'industria'}) në ${profile?.city || 'Shqipëri'}.

Konkurrentët:
${compDetails}

${myStrength ? `Avantazhi ynë: ${myStrength}` : ''}
${focusText}

Jep analizën EKSAKT në këtë format:

## PERMBLEDHJA
[2-3 fjali konkrete mbi situatën konkurruese dhe pozicionin tonë]

${validComps.map(c => `## KONKURRENTI: ${c.name}
**Pikat e forta:** [lista me pikë forta]
**Dobësitë:** [lista me dobësi]
**Marketing:** [kanalet dhe strategjia]
**Çmimi:** [perceptimi i çmimit në treg]`).join('\n\n')}

## MUNDËSITË TONA
[7-8 mundësi konkrete bazuar drejtpërdrejt në dobësitë e konkurrentëve]

## RREZIQET
[4-5 rreziqe konkrete që duhet të shmangim]

## HENDEQET E TREGUT
[Çfarë nuk ofron asnjë konkurrent aktualisht — mundësi unike Blue Ocean]

## PLANI VEPRIMIT — 30 DITË
1. [Veprim konkret 1] — URGJENT
2. [Veprim konkret 2] — URGJENT
3. [Veprim konkret 3] — I RËNDËSISHËM
4. [Veprim konkret 4] — I RËNDËSISHËM
5. [Veprim konkret 5] — AFATMESËM
6. [Veprim konkret 6] — AFATMESËM
7. [Veprim konkret 7] — AFATMESËM

Jep informacion konkret, specifik dhe të zbatueshëm për tregun shqiptar.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je analist strategjik i tregjeve shqiptare. Fol shqip. Jep analiza konkrete, me të dhëna specifike të industrisë. Mos bëj gjeneralizime — jep informacion të zbatueshëm menjëherë.',
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
        const parsed = parseSections(fullText)
        setSections(parsed)
        setRawText(fullText)
        if (fullText) await incrementUsage('competitor_analyses')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStreaming(false)
      setStreamingText('')
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function reset() {
    setSections(null)
    setStreamingText('')
    setRawText('')
    setCheckedActions({})
  }

  // ── Streaming view ──────────────────────────────────────────────────────
  if (streaming) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analizë Konkurrence</h1>
        </div>
        <div className="card border border-indigo-100 bg-indigo-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke analizuar konkurrencën...</p>
              <p className="text-xs text-gray-400">Ju lutem prisni, po gjenerohet analiza e plotë</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-indigo-100 max-h-[60vh] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}
                <span className="inline-block w-1 h-4 bg-indigo-500 ml-0.5 animate-pulse" />
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              Duke mbledhur të dhënat...
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Results view ────────────────────────────────────────────────────────
  if (sections) {
    const doneCount = Object.values(checkedActions).filter(Boolean).length
    const totalActions = sections.actionPlan.length

    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
        {limitPopup && <LimitReachedPopup {...limitPopup} onClose={() => setLimitPopup(null)} />}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-heading text-xl font-bold text-gray-900">Analiza e Konkurrencës</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500" />Kopjuar!</> : <><Copy className="w-3.5 h-3.5" />Kopjo</>}
            </button>
            <button onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Analizë e re
            </button>
          </div>
        </div>

        {/* Summary */}
        {sections.summary && (
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <h2 className="font-heading font-semibold text-base">Permbledhja Ekzekutive</h2>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">{sections.summary}</p>
          </div>
        )}

        {/* Competitor profiles */}
        {sections.competitors.length > 0 && (
          <div>
            <h2 className="font-heading font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Profili i Konkurrentëve
            </h2>
            <div className="space-y-3">
              {sections.competitors.map((c, i) => (
                <CompetitorCard key={i} comp={c} />
              ))}
            </div>
          </div>
        )}

        {/* Opportunities + Risks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.opportunities.length > 0 && (
            <div className="card border border-green-100 bg-green-50/50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h3 className="font-heading font-semibold text-green-800 text-sm">Mundësitë Tona</h3>
              </div>
              <ul className="space-y-2">
                {sections.opportunities.map((opp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-green-900 leading-relaxed">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sections.risks.length > 0 && (
            <div className="card border border-red-100 bg-red-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-500" />
                <h3 className="font-heading font-semibold text-red-800 text-sm">Rreziqet</h3>
              </div>
              <ul className="space-y-2">
                {sections.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-red-900 leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Market gaps */}
        {sections.gaps && (
          <div className="card border border-blue-100 bg-blue-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <h3 className="font-heading font-semibold text-blue-800 text-sm">Hendeqet e Tregut — Blue Ocean</h3>
            </div>
            <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{sections.gaps}</p>
          </div>
        )}

        {/* Action plan */}
        {sections.actionPlan.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="font-heading font-semibold text-gray-900 text-sm">Plani Veprimit — 30 Ditë</h3>
              </div>
              {totalActions > 0 && (
                <span className="text-xs font-medium text-gray-500">
                  {doneCount}/{totalActions} kompletuar
                </span>
              )}
            </div>
            {totalActions > 0 && (
              <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${(doneCount / totalActions) * 100}%` }}
                />
              </div>
            )}
            <div className="space-y-2">
              {sections.actionPlan.map((action, i) => (
                <ActionItem
                  key={i}
                  text={action.text}
                  priority={action.priority}
                  checked={!!checkedActions[i]}
                  onToggle={() => setCheckedActions(prev => ({ ...prev, [i]: !prev[i] }))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Re-analyze button */}
        <Button variant="outline" onClick={reset} className="w-full gap-2">
          <RotateCcw className="w-4 h-4" /> Analizoni konkurrencë të re
        </Button>
      </div>
    )
  }

  // ── Input view ──────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {limitPopup && <LimitReachedPopup {...limitPopup} onClose={() => setLimitPopup(null)} />}

      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analizë Konkurrence</h1>
          <p className="text-xs text-gray-400 mt-0.5">Analizë strategjike e plotë me plan veprimi</p>
        </div>
      </div>

      {/* Competitors */}
      <div className="card">
        <h2 className="font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-indigo-500" />
          Konkurrentët (deri në 3)
        </h2>
        <div className="space-y-4">
          {competitors.map((c, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                <Input
                  placeholder={`Emri ose URL i konkurrentit ${i + 1}`}
                  value={c.name}
                  onChange={e => updateComp(i, 'name', e.target.value)}
                  className="flex-1 bg-white"
                />
              </div>
              {c.name && (
                <input
                  type="text"
                  placeholder="Çfarë dini për këtë konkurrent? (opsionale)"
                  value={c.notes}
                  onChange={e => updateComp(i, 'notes', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-gray-600 placeholder:text-gray-300 ml-7"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Focus areas */}
      <div className="card">
        <h2 className="font-heading font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <BarChart2 className="w-4 h-4 text-indigo-500" />
          Fokusi i Analizës
          <span className="text-xs font-normal text-gray-400">(opsionale — zgjidhni disa)</span>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {FOCUS_AREAS.map(area => {
            const Icon = area.icon
            const selected = focus.includes(area.id)
            return (
              <button
                key={area.id}
                onClick={() => toggleFocus(area.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-indigo-500' : 'text-gray-400'}`} />
                {area.label}
                {selected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Our strength */}
      <div className="card">
        <h2 className="font-heading font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Avantazhi Juaj Konkurrues
          <span className="text-xs font-normal text-gray-400">(opsionale)</span>
        </h2>
        <input
          type="text"
          placeholder="p.sh. Çmim i ulët, shërbim 24/7, cilësi premium, shpërndarje falas..."
          value={myStrength}
          onChange={e => setMyStrength(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-gray-700 placeholder:text-gray-300"
        />
        <p className="text-xs text-gray-400 mt-2">
          Kjo ndihmon AI të identifikojë mundësitë specifike për biznesin tuaj.
        </p>
      </div>

      <Button
        onClick={analyze}
        disabled={!validComps.length}
        className="w-full gap-2 py-3 text-base"
        size="lg"
      >
        <Sparkles className="w-5 h-5" />
        Analizoni Konkurrencën
      </Button>
    </div>
  )
}
