import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Star, Sparkles, RefreshCw } from 'lucide-react'

const PERIODS = ['Tremujori 1 (Jan-Mar)', 'Tremujori 2 (Apr-Qer)', 'Tremujori 3 (Kor-Set)', 'Tremujori 4 (Tet-Dhj)', '6-Mujori i Parë', '6-Mujori i Dytë', 'Vjetor']
const SECTIONS = [
  { key: 'VLERËSIMI I PËRGJITHSHËM', color: 'border-amber-200 bg-amber-50', label: 'Vlerësimi i Përgjithshëm' },
  { key: 'ARRITJET KRYESORE', color: 'border-emerald-200 bg-emerald-50', label: 'Arritjet Kryesore' },
  { key: 'PIKAT E FORTA', color: 'border-blue-200 bg-blue-50', label: 'Pikat e Forta' },
  { key: 'FUSHAT E PËRMIRËSIMIT', color: 'border-orange-200 bg-orange-50', label: 'Fushat e Përmirësimit' },
  { key: 'PLANI I ZHVILLIMIT', color: 'border-purple-200 bg-purple-50', label: 'Plani i Zhvillimit' },
  { key: 'OBJEKTIVAT E PERIUDHËS SË ARDHSHME', color: 'border-indigo-200 bg-indigo-50', label: 'Objektivat e Ardhshme' },
]

const RATING_LABELS = ['', 'Nën Pritshmëri', 'Duhet Përmirësim', 'Plotëson Pritshmëritë', 'Tejkalon Pritshmëritë', 'Jashtëzakonisht i Shkëlqyer']

function parseSection(text, header) {
  const regex = new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`, 'i')
  const m = text.match(regex)
  return m ? m[1].trim() : ''
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star className={`w-7 h-7 ${(hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-sm font-medium text-gray-600">{RATING_LABELS[value]}</span>
      )}
    </div>
  )
}

export default function PerformanceReviewPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ name: '', role: '', period: '', rating: 0, achievements: '', strengths: '', improvements: '', goals: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [streaming, setStreaming] = useState('')

  function upd(f, v) { setForm(p => ({ ...p, [f]: v })) }

  async function generate() {
    if (!form.name.trim() || !form.role.trim()) return
    setLoading(true); setResult(''); setStreaming('')

    const prompt = `Krijo raport vlerësimi gjithëpërfshirës të performancës:
Biznesi: ${profile?.business_name || 'kompania'} (${profile?.industry || ''})
Emri: ${form.name}
Roli: ${form.role}
Periudha: ${form.period || 'Vjetor'}
Vlerësimi: ${form.rating}/5 — ${RATING_LABELS[form.rating] || 'Pa vlerësim'}
${form.achievements ? `Arritjet kryesore: ${form.achievements}` : ''}
${form.strengths ? `Pikat e forta të vërejtura: ${form.strengths}` : ''}
${form.improvements ? `Fushat e përmirësimit: ${form.improvements}` : ''}
${form.goals ? `Objektivat e ardhshme: ${form.goals}` : ''}

Kthe saktësisht këto seksione:

## VLERËSIMI I PËRGJITHSHËM
[Paragraf hyrës me vlerësimin e performancës dhe tonin e duhur]

## ARRITJET KRYESORE
[Lista e arritjeve konkrete me impaktin e tyre]

## PIKAT E FORTA
[3-5 pika të forta specifike me shembuj]

## FUSHAT E PËRMIRËSIMIT
[2-3 fusha me sugjerime konstruktive dhe pozitive]

## PLANI I ZHVILLIMIT
[3-4 hapa konkrete për zhvillim profesional të punonjësit]

## OBJEKTIVAT E PERIUDHËS SË ARDHSHME
[4-5 objektiva SMART për periudhën tjetër]

Shkruaj shqip. Toni duhet të jetë profesional, konstruktiv dhe motivues. Inkluzo emrin ${form.name}.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je specialist HR dhe manageri me eksperiencë në vlerësimin e performancës. Shkruaj raporte profesionale, konstruktive dhe motivuese. Fol shqip.',
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

      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 sm:p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold mb-1">Vlerësim Performancë</h1>
            <p className="text-amber-100 text-sm">Raporte vlerësimi profesionale dhe konstruktive me AI.</p>
          </div>
        </div>
      </div>

      <div className="card mb-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Emri i Punonjësit <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => upd('name', e.target.value)}
              placeholder="p.sh. Besnik Gashi" className="input-field" />
          </div>
          <div>
            <label className="label">Roli / Pozicioni <span className="text-red-500">*</span></label>
            <input value={form.role} onChange={e => upd('role', e.target.value)}
              placeholder="p.sh. Shitës, Kontabilist..." className="input-field" />
          </div>
          <div>
            <label className="label">Periudha e Vlerësimit</label>
            <select value={form.period} onChange={e => upd('period', e.target.value)} className="input-field">
              <option value="">Zgjidhni...</option>
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Vlerësimi Overall</label>
            <div className="mt-2">
              <StarRating value={form.rating} onChange={v => upd('rating', v)} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Arritjet Kryesore <span className="text-red-500">*</span></label>
            <textarea value={form.achievements} onChange={e => upd('achievements', e.target.value)}
              placeholder="Cilat janë arritjet kryesore të punonjësit gjatë kësaj periudhe?"
              rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">Pikat e Forta</label>
            <textarea value={form.strengths} onChange={e => upd('strengths', e.target.value)}
              placeholder="Kompetenca, aftësi dhe cilësi pozitive..." rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">Fushat e Përmirësimit</label>
            <textarea value={form.improvements} onChange={e => upd('improvements', e.target.value)}
              placeholder="Çfarë mund të bëjë më mirë?" rows={2} className="input-field resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Objektivat e Ardhshme</label>
            <input value={form.goals} onChange={e => upd('goals', e.target.value)}
              placeholder="Çfarë duhet të arrijë periudhën tjetër?" className="input-field" />
          </div>
        </div>
        <Button onClick={generate} disabled={loading || !form.name.trim() || !form.role.trim()} className="w-full gap-2">
          {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Duke gjeneruar...</> : <><Sparkles className="w-4 h-4" />Gjenero Vlerësimin</>}
        </Button>
      </div>

      {displayText && (
        <div className="space-y-3">
          {result ? SECTIONS.map(s => {
            const content = parseSection(result, s.key)
            if (!content) return null
            return (
              <div key={s.key} className={`rounded-2xl border p-4 ${s.color}`}>
                <h3 className="font-heading font-semibold text-gray-800 text-sm mb-2">{s.label}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
              </div>
            )
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
