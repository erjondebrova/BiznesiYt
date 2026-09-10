import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, Star, RefreshCw, Copy, Check, RotateCcw } from 'lucide-react'

const TYPES = [
  { id: 'request',   label: '📨 Kërko Review',      desc: 'Mesazh për të lutur klientin' },
  { id: 'followup',  label: '🔔 Follow-Up',          desc: 'Kujtesë pas 3-7 ditësh' },
  { id: 'questions', label: '❓ Pyetje Testimoniali', desc: 'Pyetje për testimonial cilësor' },
  { id: 'template',  label: '📝 Template Review',    desc: 'Shembull review për klientin' },
]

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'sms',      label: 'SMS'      },
  { id: 'email',    label: 'Email'    },
  { id: 'inperson', label: 'Personalisht' },
]

function ReviewVariant({ index, text }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="card border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Varianti {index + 1}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
        >
          {copied ? <><Check className="w-3 h-3 text-green-500"/>Kopjuar</> : <><Copy className="w-3 h-3"/>Kopjo</>}
        </button>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
        {text}
      </div>
    </div>
  )
}

function parseVariants(text) {
  const blocks = text.split(/---+|\*\*Varianti \d+\*\*|## Varianti \d+/i).filter(b => b.trim())
  return blocks.slice(0, 3).map(b => b.replace(/\*\*/g, '').trim())
}

export default function ReviewGeneratorPage() {
  const { profile } = useAuth()
  const [type, setType] = useState('request')
  const [channel, setChannel] = useState('whatsapp')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [variants, setVariants] = useState(null)

  const typeLabel = TYPES.find(t => t.id === type)?.label || ''
  const channelLabel = CHANNELS.find(c => c.id === channel)?.label || ''

  function buildPrompt() {
    if (type === 'questions') {
      return `Shkruaj 5-7 pyetje të strukturuara për të nxjerrë testimoniale cilësore nga klientët e "${profile?.business_name || 'biznesit tonë'}" (${profile?.industry || ''}).

Pyetjet duhet:
- Të nxjerrin përgjigje specifike me numra dhe rezultate
- Të evitojnë përgjigjet "po/jo"
- Të jenë të lehta dhe natyrale

Strukturo kështu:
## Pyetjet për Testimonial
[Pyetje 1 — për situatën para...]
[Pyetje 2 — për problemin kryesor...]
[Pyetje 3 — për rezultatin pas...]
[Pyetje 4 — për shifrat/përfitimet...]
[Pyetje 5 — për rekomandimin...]

## Udhëzime për Klientët
[2-3 këshilla si t'u jepet pyetjeve]

Fol shqip.`
    }

    if (type === 'template') {
      return `Shkruaj 2 shembuj review/testimonial realist që biznesi "${profile?.business_name || 'biznesi ynë'}" (${profile?.industry || ''}, ${profile?.city || 'Shqipëri'}) mund t'ua tregojë klientëve si model.

Secili review duhet:
- Të ketë emër shqiptar + profesion
- Të përmbajë problem konkret para + rezultat pas me shifra
- Të jetë 3-5 fjali, natyral, jo reklamë

---

**Shembull 1**
[Emri, profesioni]
"[Review realist me detaje specifike...]"
⭐⭐⭐⭐⭐

---

**Shembull 2**
[Emri, profesioni]
"[Review realist, qasje tjetër...]"
⭐⭐⭐⭐⭐

Fol shqip.`
    }

    const typeMap = {
      request:  'kërkesë për review — mesazh i parë pas blerjes/shërbimit',
      followup: 'follow-up/kujtesë për review pas 5-7 ditësh pa përgjigje',
    }

    return `Shkruaj 3 variante mesazhi ${typeMap[type]} për biznesin "${profile?.business_name || 'biznesi ynë'}" (${profile?.industry || ''}).

Kanali: ${channelLabel}
${context ? `Konteksti: ${context}` : ''}

Secili variant duhet të jetë:
- I shkurtër dhe i drejtpërdrejtë
- Natyral — si nga njeriu, jo robot
- Me link/instruksion të qartë
- Ton miqësor, jo kërkues

---

**Varianti 1**
[Mesazhi — ton miqësor/informal]

---

**Varianti 2**
[Mesazhi — ton pak më profesional]

---

**Varianti 3**
[Mesazhi — me incentivë/ofertë opsionale]

Fol shqip.`
  }

  async function generate() {
    setLoading(true)
    setStreamingText('')
    setVariants(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: buildPrompt() }],
          systemPrompt: 'Ti je ekspert i reputacionit online dhe marketingut me prova sociale për biznese shqiptare. Shkruaj mesazhe natyrale dhe efektive. Fol shqip gjithmonë.',
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
        setVariants(parseVariants(fullText))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Gjenerator Reviewsh</h1>
        </div>
        <div className="card border border-amber-100 bg-amber-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center animate-pulse">
              <Star className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke shkruar mesazhet...</p>
              <p className="text-xs text-gray-400">3 variante të ndryshme</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-amber-100 max-h-[50vh] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-amber-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-amber-500"/>Duke menduar...</div>
          )}
        </div>
      </div>
    )
  }

  if (variants?.length > 0) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <h1 className="font-heading text-xl font-bold text-gray-900">Mesazhet e Gjeneruara</h1>
          </div>
          <button onClick={() => setVariants(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
          </button>
        </div>
        <div className="space-y-4">
          {variants.map((v, i) => <ReviewVariant key={i} index={i} text={v} />)}
        </div>
        <Button variant="outline" onClick={() => setVariants(null)} className="w-full gap-2">
          <RotateCcw className="w-4 h-4"/>Gjenero variante të reja
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Gjenerator Reviewsh</h1>
          <p className="text-xs text-gray-400 mt-0.5">Mesazhe për reviews, follow-up dhe testimoniale</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Çfarë dëshiron të gjenerosh?</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${type === t.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-sm font-semibold text-gray-900">{t.label}</span>
              <span className="text-xs text-gray-400">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {(type === 'request' || type === 'followup') && (
        <div className="card">
          <label className="block text-sm font-semibold text-gray-900 mb-3">Kanali i Komunikimit</label>
          <div className="grid grid-cols-4 gap-2">
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => setChannel(c.id)}
                className={`py-2.5 text-sm rounded-xl border-2 font-medium transition-all ${channel === c.id ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Konteksti <span className="text-gray-400 font-normal">(opsionale)</span>
        </label>
        <Textarea
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="p.sh. Klienti bleu prerje flokësh dhe qe shumë i kënaqur. Kërko review në Google Maps..."
          rows={3}
        />
      </div>

      <Button onClick={generate} className="w-full gap-2 bg-amber-500 hover:bg-amber-600" size="lg">
        <Star className="w-5 h-5"/>Gjenero Mesazhet
      </Button>
    </div>
  )
}
