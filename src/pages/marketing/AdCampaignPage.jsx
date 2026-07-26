import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, RefreshCw, Megaphone, Check, Copy, RotateCcw, Target, DollarSign, Zap } from 'lucide-react'

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook Ads',   emoji: '📘', color: 'border-blue-500 bg-blue-50 text-blue-700'   },
  { id: 'instagram', label: 'Instagram Ads',   emoji: '📸', color: 'border-pink-500 bg-pink-50 text-pink-700'   },
  { id: 'tiktok',    label: 'TikTok Ads',      emoji: '🎵', color: 'border-gray-800 bg-gray-50 text-gray-800'   },
  { id: 'google',    label: 'Google Ads',      emoji: '🔍', color: 'border-green-500 bg-green-50 text-green-700' },
]

const OBJECTIVES = [
  { id: 'sales',      label: '🛍️ Shitje',            desc: 'Rrit shitjet online ose në dyqan' },
  { id: 'leads',      label: '📋 Leads / Kontaktime', desc: 'Mblidh kontakte dhe klientë potencialë' },
  { id: 'awareness',  label: '👁️ Ndërgjegjësim',      desc: 'Bën njerëzit të njohin markën tënde' },
  { id: 'traffic',    label: '🌐 Trafik',              desc: 'Dërgo vizitorë në website ose profil' },
  { id: 'engagement', label: '❤️ Angazhim',            desc: 'Like, komente, share dhe ndërveprim' },
  { id: 'appinstall', label: '📱 Instalim Aplikacioni', desc: 'Nxit shkarkimin e aplikacionit' },
]

const BUDGETS = [
  { id: 'micro',  label: '500–2,000 ALL/ditë',  desc: 'Fillim' },
  { id: 'small',  label: '2,000–5,000 ALL/ditë', desc: 'i Vogël' },
  { id: 'medium', label: '5,000–15,000 ALL/ditë', desc: 'Mesatar' },
  { id: 'large',  label: '15,000+ ALL/ditë',      desc: 'i Madh'  },
]

function AdVariant({ index, headline, primaryText, cta, color }) {
  const [copied, setCopied] = useState(false)
  const full = `Titulli: ${headline}\n\nTeksti kryesor:\n${primaryText}\n\nCTA: ${cta}`
  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide opacity-60">Varianti {index + 1}</span>
        <button onClick={() => { navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100">
          {copied ? <><Check className="w-3 h-3"/>Kopjuar</> : <><Copy className="w-3 h-3"/>Kopjo</>}
        </button>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide opacity-50 mb-1">TITULLI / HEADLINE</p>
        <p className="text-base font-bold">{headline}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide opacity-50 mb-1">TEKSTI KRYESOR</p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">{primaryText}</p>
      </div>
      {cta && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-50">CTA:</span>
          <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">{cta}</span>
        </div>
      )}
    </div>
  )
}

const AD_VARIANT_COLORS = [
  'border-violet-300 bg-violet-50 text-violet-900',
  'border-rose-300 bg-rose-50 text-rose-900',
  'border-amber-300 bg-amber-50 text-amber-900',
]

function parseAds(text) {
  const variants = []
  const blocks = text.split(/---+|\*\*Varianti \d+\*\*|## Varianti \d+/i).filter(b => b.trim())

  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim())
    let headline = '', primaryText = '', cta = '', bodyLines = [], inBody = false

    for (const line of lines) {
      const upper = line.toUpperCase()
      if (upper.includes('TITULL') || upper.includes('HEADLINE')) {
        headline = line.replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim()
        inBody = false
      } else if (upper.includes('CTA') || upper.includes('BUTON') || upper.includes('THIRRJE')) {
        cta = line.replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim()
        inBody = false
      } else if (upper.includes('TEKST') || upper.includes('PRIMARY') || upper.includes('KRYESOR') || upper.includes('COPY')) {
        inBody = true
      } else if (inBody || (!headline && line.length > 20)) {
        bodyLines.push(line.replace(/\*\*/g, ''))
        inBody = true
      }
    }

    primaryText = bodyLines.join('\n').trim()
    if (headline && primaryText) {
      variants.push({ headline, primaryText, cta })
    }
  }
  return variants.slice(0, 3)
}

function parseTargeting(text) {
  const lower = text.toLowerCase()
  const start = lower.indexOf('target')
  if (start === -1) return ''
  const chunk = text.slice(start, start + 600)
  return chunk.split('\n').slice(1).filter(l => l.trim()).slice(0, 8).join('\n')
}

export default function AdCampaignPage() {
  const { profile } = useAuth()
  const [platform, setPlatform] = useState('facebook')
  const [objective, setObjective] = useState('sales')
  const [budget, setBudget] = useState('small')
  const [audience, setAudience] = useState('')
  const [offer, setOffer] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  async function generate() {
    if (!offer.trim()) return
    setLoading(true)
    setStreamingText('')
    setResult(null)

    const platLabel = PLATFORMS.find(p => p.id === platform)?.label || ''
    const objLabel  = OBJECTIVES.find(o => o.id === objective)?.label || ''
    const budLabel  = BUDGETS.find(b => b.id === budget)?.label || ''

    const prompt = `Shkruaj 3 variante reklamash ${platLabel} për biznesin "${profile?.business_name || 'tonin'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Objektivi: ${objLabel}
Oferta/Produkti: ${offer}
Audienca e synuar: ${audience || 'Klientë shqiptarë të interesuar për ' + (profile?.industry || 'produktin')}
Buxheti ditor: ${budLabel}

Shkruaj EKSAKT 3 variante, secili i ndarë me "---":

**Varianti 1**
Titulli: [Titull tërheqës, max 40 karaktere]
Teksti kryesor:
[Teksti i reklamës — 2-4 fjali, konkret, emocionuese, me shifra nëse ka]
CTA: [Butoni — p.sh. Porosit Tani / Mëso Më Shumë / Kontakto]

---

**Varianti 2**
(qasje tjetër — p.sh. social proof, kursim kohe, frikë nga humbja)

---

**Varianti 3**
(qasje tjetër — p.sh. pyetje, histori, UGC-style)

---

## TARGETING — Sugjerime për targetim

[Jep 5-7 pika konkrete për targetim: mosha, interesa, sjellje, vendndodhje, etj.]

## KËSHILLA OPTIMIZIMI

[2-3 këshilla praktike për të marrë rezultate më të mira nga kjo reklamë]

Fol shqip. Ji KONKRET për ${profile?.city || 'Shqipëri'} dhe industrinë ${profile?.industry || ''}.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i reklamave dixhitale për biznese shqiptare. Shkruaj copy reklamash profesionale dhe efektive që konvertojnë. Fol shqip gjithmonë.',
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
        const variants = parseAds(fullText)
        const targeting = parseTargeting(fullText)
        const tipsMatch = fullText.match(/## KËSHILLA OPTIMIZIMI([\s\S]*?)(?:$|##)/i)
        const tips = tipsMatch ? tipsMatch[1].trim() : ''
        setResult({ variants, targeting, tips, raw: fullText })
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  const platObj = PLATFORMS.find(p => p.id === platform)

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Reklamë Dixhitale</h1>
        </div>
        <div className="card border border-violet-100 bg-violet-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center animate-pulse">
              <Megaphone className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke shkruar reklamat...</p>
              <p className="text-xs text-gray-400">3 variante për {platObj?.label}</p>
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

  if (result) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900">Reklamat e Gjeneruara</h1>
              <p className="text-xs text-gray-400">{platObj?.label} · {OBJECTIVES.find(o => o.id === objective)?.label}</p>
            </div>
          </div>
          <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
          </button>
        </div>

        <div className="space-y-4">
          {result.variants.map((v, i) => (
            <AdVariant key={i} index={i} {...v} color={AD_VARIANT_COLORS[i % AD_VARIANT_COLORS.length]} />
          ))}
        </div>

        {result.targeting && (
          <div className="card border border-blue-100 bg-blue-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-500"/>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Sugjerime Targetimi</p>
            </div>
            <div className="space-y-1.5">
              {result.targeting.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"/>
                  <p className="text-sm text-blue-800">{line.replace(/^[-•]\s*/, '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.tips && (
          <div className="card border border-amber-100 bg-amber-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500"/>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Këshilla Optimizimi</p>
            </div>
            <div className="space-y-1.5">
              {result.tips.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"/>
                  <p className="text-sm text-amber-900">{line.replace(/^[-•]\s*/, '').replace(/\*\*/g, '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2">
          <RotateCcw className="w-4 h-4"/>Gjenero reklamë të re
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Reklamë Dixhitale</h1>
          <p className="text-xs text-gray-400 mt-0.5">Facebook · Instagram · TikTok · Google — copy gati për publikim</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Platforma</label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${platform === p.id ? p.color : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <span className="text-base">{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Objektivi i Reklamës</label>
        <div className="grid grid-cols-2 gap-2">
          {OBJECTIVES.map(o => (
            <button key={o.id} onClick={() => setObjective(o.id)}
              className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${objective === o.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-sm font-semibold text-gray-900">{o.label}</span>
              <span className="text-xs text-gray-400 mt-0.5">{o.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500"/>Buxheti Ditor
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BUDGETS.map(b => (
            <button key={b.id} onClick={() => setBudget(b.id)}
              className={`py-3 px-3 text-left rounded-xl border-2 transition-all ${budget === b.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <p className="text-sm font-bold text-gray-900">{b.label}</p>
              <p className="text-xs text-gray-400">{b.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Oferta / Produkti / Shërbimi</label>
        <Textarea
          value={offer}
          onChange={e => setOffer(e.target.value)}
          placeholder="p.sh. 20% zbritje në kursin e gatimit — çmimi normal 5,000 ALL, tani 4,000 ALL. Kursi fillon të hënën..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Audienca e Synuar <span className="text-gray-400 font-normal">(opsionale)</span>
        </label>
        <Textarea
          value={audience}
          onChange={e => setAudience(e.target.value)}
          placeholder="p.sh. Gra 25-45 vjeç në Tiranë, të interesuara për gatim, shtëpi dhe kuzhinë..."
          rows={2}
          className="mt-1"
        />
      </div>

      <Button onClick={generate} disabled={!offer.trim()} className="w-full gap-2 bg-violet-600 hover:bg-violet-700" size="lg">
        <Megaphone className="w-5 h-5"/>Shkruaj 3 Variante Reklame
      </Button>
    </div>
  )
}
