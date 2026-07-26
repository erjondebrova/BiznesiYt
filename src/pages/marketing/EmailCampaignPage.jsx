import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, Sparkles, RefreshCw, Mail, Check, Copy, RotateCcw } from 'lucide-react'

const TYPES = [
  { id: 'promo',    label: '🔥 Ofertë Speciale',    desc: 'Zbritje, promocion, aksion' },
  { id: 'newletter',label: '📰 Newsletter',          desc: 'Lajme dhe përditësime' },
  { id: 'reengage', label: '💌 Rikthim Klientësh',  desc: 'Klientë që nuk kanë blerë' },
  { id: 'launch',   label: '🚀 Lansim Produkti',     desc: 'Produkt ose shërbim i ri' },
  { id: 'followup', label: '🤝 Follow-Up',           desc: 'Pas takimit ose blerjes' },
  { id: 'seasonal', label: '🎉 Sezonale',            desc: 'Festë, sezon, event' },
]

const TONES = [
  { id: 'professional', label: 'Profesional' },
  { id: 'friendly',     label: 'Miqësor'     },
  { id: 'urgent',       label: 'Urgjent'      },
  { id: 'inspiring',    label: 'Frymëzues'   },
]

function EmailVariant({ index, subject, preview, body }) {
  const [copied, setCopied] = useState(false)
  const full = `Subjekt: ${subject}\nPreview: ${preview}\n\n${body}`

  return (
    <div className="card border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Varianti {index + 1}</span>
        <button onClick={() => { navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
          {copied ? <><Check className="w-3 h-3 text-green-500"/>Kopjuar</> : <><Copy className="w-3 h-3"/>Kopjo</>}
        </button>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-bold text-gray-400 mb-1">SUBJEKTI</p>
          <p className="text-sm font-semibold text-gray-900">{subject}</p>
        </div>
        {preview && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-bold text-blue-400 mb-1">PREVIEW TEXT</p>
            <p className="text-xs text-blue-800">{preview}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2">TRUPI I EMAIL-IT</p>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100 rounded-lg p-3 bg-white">
            {body}
          </div>
        </div>
      </div>
    </div>
  )
}

function parseEmails(text) {
  const variants = []
  const variantBlocks = text.split(/---+|\*\*Varianti \d+\*\*|## Varianti \d+/i).filter(b => b.trim())

  for (const block of variantBlocks) {
    const lines = block.split('\n').filter(l => l.trim())
    let subject = '', preview = '', bodyLines = [], inBody = false

    for (const line of lines) {
      const upper = line.toUpperCase()
      if (upper.includes('SUBJEKT') || upper.includes('SUBJECT')) {
        subject = line.replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim()
        inBody = false
      } else if (upper.includes('PREVIEW')) {
        preview = line.replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim()
        inBody = false
      } else if (upper.includes('TRUPI') || upper.includes('BODY') || upper.includes('EMAIL-IT')) {
        inBody = true
      } else if (inBody || (!subject && !preview && line.length > 30)) {
        bodyLines.push(line.replace(/\*\*/g, ''))
        inBody = true
      }
    }

    if (subject && bodyLines.length > 0) {
      variants.push({ subject, preview, body: bodyLines.join('\n').trim() })
    }
  }

  return variants.slice(0, 3)
}

export default function EmailCampaignPage() {
  const { profile } = useAuth()
  const [type, setType] = useState('promo')
  const [tone, setTone] = useState('friendly')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [variants, setVariants] = useState(null)

  async function generate() {
    if (!message.trim()) return
    setLoading(true)
    setStreamingText('')
    setVariants(null)

    const typeLabel = TYPES.find(t => t.id === type)?.label || ''
    const toneLabel = TONES.find(t => t.id === tone)?.label || ''

    const prompt = `Shkruaj 3 variante të ndryshme email marketing për biznesin "${profile?.business_name || 'tonin'}" (${profile?.industry || ''}).

Lloji: ${typeLabel}
Toni: ${toneLabel}
Mesazhi kryesor: ${message}

Shkruaj EKSAKT 3 variante, të ndara me "---", secili me:

**Varianti 1**
Subjekt: [Subjekt i fortë, max 50 karaktere]
Preview text: [Tekst preview, max 90 karaktere]
Trupi i email-it:
[Trupi i plotë i email-it — hyrje, mesazh kryesor, CTA i fortë, nënshkrim]

---

**Varianti 2**
(e njëjta strukturë, ton dhe qasje të ndryshme)

---

**Varianti 3**
(e njëjta strukturë, ton dhe qasje të ndryshme)

Çdo variant duhet të jetë krejtësisht i ndryshëm nga tjetri. Ji konkret për ${profile?.city || 'Shqipëri'} dhe industrinë ${profile?.industry || ''}. Fol shqip.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i email marketing për biznese shqiptare. Shkruaj email marketing profesionale, tërheqëse dhe efektive. Fol shqip gjithmonë.',
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
        setVariants(parseEmails(fullText))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Email Marketing</h1>
        </div>
        <div className="card border border-teal-100 bg-teal-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center animate-pulse">
              <Mail className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke shkruar emailet...</p>
              <p className="text-xs text-gray-400">3 variante të ndryshme</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-teal-100 max-h-[50vh] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-teal-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-teal-500"/>Duke menduar...</div>
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
            <h1 className="font-heading text-xl font-bold text-gray-900">Emailet e Gjeneruara</h1>
          </div>
          <button onClick={() => setVariants(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
          </button>
        </div>
        <div className="space-y-4">
          {variants.map((v, i) => <EmailVariant key={i} index={i} {...v} />)}
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
          <h1 className="font-heading text-xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-xs text-gray-400 mt-0.5">3 variante email gati për dërgim</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Lloji i Kampanjës</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${type === t.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-sm font-semibold text-gray-900">{t.label}</span>
              <span className="text-xs text-gray-400">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Toni</label>
        <div className="grid grid-cols-4 gap-2">
          {TONES.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className={`py-2.5 text-sm rounded-xl border-2 font-medium transition-all ${tone === t.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Mesazhi Kryesor / Oferta</label>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="p.sh. 30% zbritje në të gjitha produktet për 48 orë. Oferta skadon të premten..."
          rows={3}
          className="mt-1"
        />
      </div>

      <Button onClick={generate} disabled={!message.trim()} className="w-full gap-2 bg-teal-600 hover:bg-teal-700" size="lg">
        <Mail className="w-5 h-5"/>Shkruaj 3 Variante Email
      </Button>
    </div>
  )
}
