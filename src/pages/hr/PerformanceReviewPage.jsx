import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Star, Wand2, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

function parseSection(text, header) {
  const match = text.match(new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`))
  return match ? match[1].trim() : ''
}

const SECTIONS = [
  { key: 'VLERËSIMI I PËRGJITHSHËM', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  { key: 'ARRITJET KRYESORE',        color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { key: 'PIKAT E FORTA',            color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  { key: 'FUSHAT PËR ZHVILLIM',      color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100' },
  { key: 'QËLLIMET PËR PERIUDHËN TJETËR', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { key: 'REKOMANDIMI',              color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-100' },
]

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1 mt-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-lg transition-all ${n <= value ? 'text-amber-400' : 'text-gray-200'} hover:text-amber-300`}>
          <Star className="w-full h-full fill-current"/>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 self-center">
        {['', 'Nën pritshmëritë', 'Duhet përmirësim', 'Plotëson pritshmëritë', 'Tejkalon pritshmëritë', 'Shëmtim i rrallë'][value] || ''}
      </span>
    </div>
  )
}

export default function PerformanceReviewPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({
    name: '', role: '', period: '', rating: 3,
    achievements: '', strengths: '', improvements: '', goals: '',
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function update(field, val) { setForm(p => ({ ...p, [field]: val })) }

  async function generate() {
    if (!form.name || !form.role || !form.achievements) return
    setLoading(true); setResult('')
    const ratingLabels = { 1: 'Nën pritshmëritë', 2: 'Duhet përmirësim', 3: 'Plotëson pritshmëritë', 4: 'Tejkalon pritshmëritë', 5: 'Shëmbull i rrallë — i jashtëzakonshëm' }
    const prompt = `Shkruaj një vlerësim performancë profesional dhe të ekuilibruar.

Biznesi: ${profile?.business_name || 'Kompania jonë'}
Punonjësi: ${form.name}
Pozicioni: ${form.role}
Periudha e vlerësimit: ${form.period || 'Periudha e fundit'}
Vlerësimi i përgjithshëm: ${form.rating}/5 — ${ratingLabels[form.rating]}

Arritjet kryesore:
${form.achievements}

Pikat e forta të vëzhguara:
${form.strengths || 'Sipas arritjeve të përshkruara'}

Fushat që nevojiten përmirësim:
${form.improvements || 'Sipas kontekstit'}

${form.goals ? `Qëllimet e sugjeruara nga menaxheri:\n${form.goals}` : ''}

Shkruaj vlerësimin e ndarë SAKTËSISHT në këto seksione:

## VLERËSIMI I PËRGJITHSHËM
(2-3 paragrafë: vlerësim i balancuar, i drejtpërdrejtë dhe konstruktiv)

## ARRITJET KRYESORE
(Lista me 4-6 arritje konkrete, me ndikim të matshëm kur është e mundur)

## PIKAT E FORTA
(3-4 pika me shembuj konkretë)

## FUSHAT PËR ZHVILLIM
(2-3 fusha me sugjerime konstruktive dhe veprime konkrete — jo kritikë, por mundësi)

## QËLLIMET PËR PERIUDHËN TJETËR
(3-5 objektiva SMART për 6-12 muajt e ardhshëm)

## REKOMANDIMI
(Konkluzion i qartë: promovim, rritje page, trajnim specifik, vazhdim normal — me arsyetim)

Ton: profesional, i drejtpërdrejtë, konstruktiv dhe motivues. Shqip.`

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }) })
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ')) { try { const d = JSON.parse(line.slice(6)); if (d.content) { full += d.content; setResult(full) } } catch {} }
        }
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  function copy() { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const sections = SECTIONS.map(s => ({ ...s, content: parseSection(result, s.key) })).filter(s => s.content)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <Link to="/hr" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4"/> HR & Ekipi
      </Link>

      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5"/>
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Vlerësim Performancë</h1>
            <p className="text-amber-100 text-sm">Vlerësime të ekuilibruara dhe profesionale me AI</p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Label>Emri i Punonjësit *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} className="mt-1" placeholder="p.sh. Enis Berisha"/>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Roli / Pozicioni *</Label>
            <Input value={form.role} onChange={e => update('role', e.target.value)} className="mt-1" placeholder="p.sh. Menaxher Operacionesh"/>
          </div>
        </div>
        <div>
          <Label>Periudha e Vlerësimit</Label>
          <Input value={form.period} onChange={e => update('period', e.target.value)} className="mt-1" placeholder="p.sh. Janari – Qershori 2025"/>
        </div>
        <div>
          <Label>Vlerësimi i Përgjithshëm</Label>
          <StarRating value={form.rating} onChange={v => update('rating', v)}/>
        </div>
        <div>
          <Label>Arritjet Kryesore *</Label>
          <Textarea value={form.achievements} onChange={e => update('achievements', e.target.value)} rows={3} className="mt-1"
            placeholder="Çfarë arriti ky punonjës gjatë kësaj periudhe? Numra, projekte, rezultate konkrete..."/>
        </div>
        <div>
          <Label>Pikat e Forta të Vëzhguara</Label>
          <Textarea value={form.strengths} onChange={e => update('strengths', e.target.value)} rows={2} className="mt-1"
            placeholder="p.sh. komunikim i shkëlqyer, iniciativë, punë në ekip..."/>
        </div>
        <div>
          <Label>Fushat për Përmirësim</Label>
          <Textarea value={form.improvements} onChange={e => update('improvements', e.target.value)} rows={2} className="mt-1"
            placeholder="Fusha ku ka hapësirë për t'u rritur — formuluar konstruktivisht..."/>
        </div>
        <div>
          <Label>Qëllimet e Sugjeruara <span className="text-gray-400 font-normal">(opsionale)</span></Label>
          <Textarea value={form.goals} onChange={e => update('goals', e.target.value)} rows={2} className="mt-1"
            placeholder="Objektiva ose pritshmëri specifike për periudhën tjetër..."/>
        </div>
        <Button onClick={generate} disabled={loading || !form.name || !form.role || !form.achievements} className="w-full gap-2 h-11">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Duke gjeneruar...</> : <><Wand2 className="w-4 h-4"/>Shkruaj Vlerësimin</>}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-gray-900">Vlerësimi — {form.name}</h3>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo</>}
            </button>
          </div>
          {sections.length > 0 ? sections.map(s => (
            <div key={s.key} className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${s.color}`}>{s.key}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</p>
            </div>
          )) : (
            <div className="card"><p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p></div>
          )}
        </div>
      )}
    </div>
  )
}
