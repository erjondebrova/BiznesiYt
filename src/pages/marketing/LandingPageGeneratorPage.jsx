import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, Globe, RefreshCw, Copy, Check, RotateCcw, ArrowRight } from 'lucide-react'

const GOALS = [
  { id: 'sell',    label: '🛍️ Shitje Produkti',    desc: 'Produkt fizik ose dixhital' },
  { id: 'service', label: '🛠️ Shërbim',             desc: 'Konsulencë, riparim, etj.' },
  { id: 'lead',    label: '📋 Mbledh Kontakte',      desc: 'Formular, ofertë falas' },
  { id: 'event',   label: '🎟️ Event / Webinar',      desc: 'Regjistrim për ngjarje' },
]

const SECTIONS = [
  { key: 'headline',     label: 'HEADLINE KRYESOR' },
  { key: 'subheadline',  label: 'SUBHEADLINE' },
  { key: 'benefits',     label: 'BENEFITET (3-5)' },
  { key: 'testimonials', label: 'TESTIMONIALE' },
  { key: 'cta',          label: 'CTA KRYESOR' },
  { key: 'faq',          label: 'FAQ (3 pyetje)' },
]

function LandingResult({ result, onReset }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Landing Page e Gjeneruar</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo të gjitha</>}
          </button>
          <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
          </button>
        </div>
      </div>

      <div className="card border border-violet-100 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
        {result}
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
        <ArrowRight className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0"/>
        <div>
          <p className="text-sm font-semibold text-violet-800">Hapi i dytë natyral</p>
          <p className="text-xs text-violet-600 mt-0.5">Ke tekstin e faqes — tani krijo reklamat dixhitale që të çojnë trafikun aty.</p>
          <Link to="/marketing/ads" className="text-xs font-semibold text-violet-700 hover:underline mt-1 inline-block">Shko te Reklamat Dixhitale →</Link>
        </div>
      </div>

      <Button variant="outline" onClick={onReset} className="w-full gap-2">
        <RotateCcw className="w-4 h-4"/>Gjenero landing page të re
      </Button>
    </div>
  )
}

export default function LandingPageGeneratorPage() {
  const { profile } = useAuth()
  const [goal, setGoal] = useState('sell')
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  async function generate() {
    if (!product.trim()) return
    setLoading(true)
    setStreamingText('')
    setResult(null)

    const goalLabel = GOALS.find(g => g.id === goal)?.label || ''

    const prompt = `Shkruaj tekstin e plotë për një Landing Page / Faqe Shitjeje profesionale.

Biznesi: ${profile?.business_name || 'biznesi ynë'} (${profile?.industry || ''})
Qyteti: ${profile?.city || 'Shqipëri'}
Qëllimi: ${goalLabel}
Produkti / Shërbimi: ${product}
Audienca target: ${audience || 'klientë të interesuar'}

Shkruaj duke ndjekur SAKTËSISHT këtë strukturë:

## HEADLINE KRYESOR
[Titull i fuqishëm, specifik, fokus te benefiti kryesor — max 10 fjalë]

## SUBHEADLINE
[Shpjegim i shkurtër 1-2 fjali që mbështet headline-in]

## BENEFITET KRYESORE
[5 benefite të qarta — secila me: ✅ titull + shpjegim 1 fjali]

## PROVA SOCIALE / TESTIMONIALE
[3 testimoniale të besueshme — emër + pozicion + citate konkrete me numra/rezultate]

## CTA KRYESOR
[Teksti i butonit + teksti shpjegues poshtë tij]

## FAQ — Pyetje të Shpeshta
[3 pyetje + përgjigje të shkurtra që heqin dyshimet e blerjes]

## FOOTER CTA
[Thirrje finale për veprim me urgjencë ose garanci]

Ji konkret, specifik për ${profile?.industry || 'industrinë'}, dhe shkruaj shqip natyral — jo formaliste.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je copywriter ekspert për biznese shqiptare. Shkruaj tekste bindëse, konkreting dhe të fokusuara te konversioni. Fol shqip gjithmonë.',
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
          for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || ''
              if (delta) { fullText += delta; setStreamingText(fullText) }
            } catch {}
          }
        }
        setResult(fullText.trim())
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Landing Page Generator</h1>
        </div>
        <div className="card border border-violet-100 bg-violet-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center animate-pulse">
              <Globe className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke ndërtuar faqen...</p>
              <p className="text-xs text-gray-400">Headline, benefite, testimoniale, CTA</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-violet-100 max-h-[50vh] overflow-y-auto">
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

  if (result) return <LandingResult result={result} onReset={() => setResult(null)} />

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Landing Page Generator</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tekst i plotë për faqen tënde të shitjeve</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Qëllimi i Faqes</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button key={g.id} onClick={() => setGoal(g.id)}
              className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${goal === g.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-sm font-semibold text-gray-900">{g.label}</span>
              <span className="text-xs text-gray-400">{g.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Produkti / Shërbimi</label>
          <Textarea
            value={product}
            onChange={e => setProduct(e.target.value)}
            placeholder="p.sh. Kurs online gatimi italian — 8 javë, 40 video, certifikatë. Çmimi 4,900 lekë."
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Audienca Target <span className="text-gray-400 font-normal">(opsionale)</span></label>
          <Textarea
            value={audience}
            onChange={e => setAudience(e.target.value)}
            placeholder="p.sh. Gra 25-45 vjeç, të interesuara për gatim, familje me fëmijë..."
            rows={2}
          />
        </div>
      </div>

      <Button onClick={generate} disabled={!product.trim()} className="w-full gap-2 bg-violet-600 hover:bg-violet-700" size="lg">
        <Globe className="w-5 h-5"/>Gjenero Landing Page
      </Button>
    </div>
  )
}
