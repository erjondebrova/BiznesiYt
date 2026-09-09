import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, ClipboardList, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const KNOWLEDGE_LEVELS = ['Fillestar i plotë', 'Pak eksperiencë', 'Mesatar', 'Ekspert']
const WEEK_SECTIONS = [
  { key: 'JAVA E PARË', label: 'Java e Parë — Orientimi', gradient: 'from-teal-500 to-cyan-500' },
  { key: 'JAVA E DYTË', label: 'Java e Dytë — Integrimi', gradient: 'from-cyan-500 to-sky-500' },
  { key: 'JAVA E TRETË DHE KATËRT', label: 'Jata 3-4 — Kontributi i Parë', gradient: 'from-sky-500 to-blue-500' },
  { key: 'OBJEKTIVAT 3-MUJORE', label: 'Objektivat 30-60-90 Ditorë', gradient: 'from-blue-500 to-indigo-500' },
  { key: 'CHECKLIST ONBOARDING', label: 'Checklist Onboarding', gradient: 'from-indigo-500 to-violet-500' },
]

function parseSection(text, header) {
  const regex = new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`, 'i')
  const m = text.match(regex)
  return m ? m[1].trim() : ''
}

function WeekCard({ title, gradient, content }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${gradient} text-white text-left`}
      >
        <span className="font-heading font-semibold text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
      </button>
      {open && (
        <div className="p-4 bg-white">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  )
}

export default function OnboardingPlanPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ name: '', role: '', dept: '', knowledge: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [streaming, setStreaming] = useState('')

  function upd(f, v) { setForm(p => ({ ...p, [f]: v })) }

  async function generate() {
    if (!form.name.trim() || !form.role.trim()) return
    setLoading(true); setResult(''); setStreaming('')

    const prompt = `Krijo plan onboarding 30-ditor (4 javë) për punonjësin e ri:
Biznesi: ${profile?.business_name || 'kompania'} (${profile?.industry || ''}) — ${profile?.city || 'Shqipëri'}
Emri i punonjësit: ${form.name}
Roli: ${form.role}${form.dept ? ` — Departamenti: ${form.dept}` : ''}
Niveli i njohurive fillestare: ${form.knowledge || 'Mesatar'}

Kthe SAKTËSISHT këto seksione:

## JAVA E PARË
[Detyra dhe aktivitete ditore — orientimi, familjarizimi me ekipin, sistemet, politikat]

## JAVA E DYTË
[Detyra dhe aktivitete — fillim i punës reale nën supervizim, trajnime specifike]

## JAVA E TRETË DHE KATËRT
[Kontribut i pavarur, projektet e para, takimet me ekipin]

## OBJEKTIVAT 3-MUJORE
[Objektivat e qarta dhe të matshme për muajin 1, 2 dhe 3 — specifike për rolin]

## CHECKLIST ONBOARDING
[Lista e detyrave administrative dhe praktike: kontratat, sistemet, akseset, prezantimi ekipit]

Shkruaj shqip. Ji specifik dhe praktik. Inkluzo emrin ${form.name} në plan.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je specialist HR dhe onboarding. Gjenero plane onboarding praktike dhe të detajuara. Fol shqip.',
        }),
      })
      if (!res.ok) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const p = JSON.parse(data)
            const delta = p.delta?.text || p.choices?.[0]?.delta?.content || ''
            if (delta) { full += delta; setStreaming(full) }
          } catch {}
        }
      }
      setResult(full)
    } catch (e) { console.error(e) }
    finally { setLoading(false); setStreaming('') }
  }

  const displayText = result || streaming

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <Link to="/hr" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> HR & Ekipi
      </Link>

      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-purple-500 to-violet-600 text-white p-5 sm:p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold mb-1">Plan Onboarding</h1>
            <p className="text-purple-100 text-sm">Plan 30-ditor me AI — integrate çdo punonjës të ri me sukses.</p>
          </div>
        </div>
      </div>

      <div className="card mb-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Emri i Punonjësit <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => upd('name', e.target.value)}
              placeholder="p.sh. Arta Hoxha" className="input-field" />
          </div>
          <div>
            <label className="label">Roli / Pozicioni <span className="text-red-500">*</span></label>
            <input value={form.role} onChange={e => upd('role', e.target.value)}
              placeholder="p.sh. Kontabilist, Shitës..." className="input-field" />
          </div>
          <div>
            <label className="label">Departamenti</label>
            <input value={form.dept} onChange={e => upd('dept', e.target.value)}
              placeholder="p.sh. Financë, Marketing..." className="input-field" />
          </div>
          <div>
            <label className="label">Njohuri Fillestare</label>
            <select value={form.knowledge} onChange={e => upd('knowledge', e.target.value)} className="input-field">
              <option value="">Zgjidhni...</option>
              {KNOWLEDGE_LEVELS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={generate} disabled={loading || !form.name.trim() || !form.role.trim()} className="w-full gap-2">
          {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Duke gjeneruar...</> : <><Sparkles className="w-4 h-4" />Gjenero Planin</>}
        </Button>
      </div>

      {displayText && (
        <div className="space-y-3">
          {result ? WEEK_SECTIONS.map(s => {
            const content = parseSection(result, s.key)
            if (!content) return null
            return <WeekCard key={s.key} title={s.label} gradient={s.gradient} content={content} />
          }) : (
            <div className="card">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{streaming}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
