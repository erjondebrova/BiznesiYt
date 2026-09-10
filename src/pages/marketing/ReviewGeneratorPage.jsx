import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { ArrowLeft, Star, RefreshCw, Copy, Check, RotateCcw, MessageSquare, Send } from 'lucide-react'

const TABS = [
  { id: 'request',    label: '📨 Kërko Review',         desc: 'Mesazh gati për klientin' },
  { id: 'transform',  label: '✨ Krijo Testimonial',     desc: 'Nga feedback → testimonial' },
]

const CHANNELS = [
  { id: 'whatsapp', label: '💬 WhatsApp', placeholder: 'Mesazh WhatsApp — i shkurtër, personal' },
  { id: 'sms',      label: '📱 SMS',      placeholder: 'SMS — shumë i shkurtër, max 160 karaktere' },
  { id: 'email',    label: '📧 Email',    placeholder: 'Email — pak më formal, me subjekt' },
  { id: 'inperson', label: '🤝 Personalisht', placeholder: 'Skript verbal — çfarë të thuash' },
]

const REVIEW_PLATFORMS = [
  { id: 'google',    label: '⭐ Google Maps' },
  { id: 'facebook',  label: '👍 Facebook'    },
  { id: 'instagram', label: '📸 Instagram'   },
  { id: 'tripadvisor',label: '🌍 TripAdvisor' },
]

function CopyBlock({ label, text, color = 'indigo' }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="card border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
          {copied ? <><Check className="w-3 h-3 text-green-500"/>Kopjuar</> : <><Copy className="w-3 h-3"/>Kopjo</>}
        </button>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
        {text}
      </div>
    </div>
  )
}

function parseRequestVariants(text) {
  const blocks = text.split(/---+|\*\*Varianti \d+\*\*|## Varianti \d+/i).filter(b => b.trim())
  return blocks.slice(0, 3).map(b => b.replace(/\*\*/g, '').trim()).filter(Boolean)
}

function parseTestimonialVariants(text) {
  const labels = ['I Shkurtër', 'I Mesëm', 'I Detajuar']
  const blocks = text.split(/---+|\*\*(I Shkurtër|I Mesëm|I Detajuar|Varianti \d+)\*\*|## (I Shkurtër|I Mesëm|I Detajuar|Varianti \d+)/i)
    .filter(b => b && b.trim().length > 20 && !['I Shkurtër','I Mesëm','I Detajuar'].includes(b.trim()))
  return blocks.slice(0, 3).map((b, i) => ({ label: labels[i] || `Varianti ${i+1}`, text: b.replace(/\*\*/g, '').trim() }))
}

export default function ReviewGeneratorPage() {
  const { profile } = useAuth()
  const [tab, setTab]           = useState('request')
  const [channel, setChannel]   = useState('whatsapp')
  const [platform, setPlatform] = useState('google')
  const [context, setContext]   = useState('')
  const [clientName, setClientName] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading]   = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult]     = useState(null)

  const channelMeta = CHANNELS.find(c => c.id === channel)
  const platformLabel = REVIEW_PLATFORMS.find(p => p.id === platform)?.label || ''

  async function generate() {
    setLoading(true)
    setStreamingText('')
    setResult(null)

    let prompt = ''

    if (tab === 'request') {
      prompt = `Shkruaj 3 variante mesazhi për të kërkuar review nga klienti, për biznesin "${profile?.business_name || 'biznesi ynë'}" (${profile?.industry || ''}, ${profile?.city || 'Shqipëri'}).

Kanali: ${channelMeta?.label || channel}
Platforma ku duam review: ${platformLabel}
${clientName ? `Emri i klientit: ${clientName}` : ''}
${context ? `Konteksti (çfarë bleu / shërbimi i marrë): ${context}` : ''}

Kërkesat:
- Varianti 1: Miqësor dhe personal (sikur nga njeriu)
- Varianti 2: Profesional me pak formalizëm
- Varianti 3: Me incentivë ose ofertë (p.sh. zbritje herën tjetër)
${channel === 'sms' ? '- Secili variant MAX 160 karaktere' : ''}
${channel === 'email' ? '- Çdo variant me SUBJEKT: [teksti] + MESAZHI: [teksti]' : ''}
${channel === 'inperson' ? '- Skript verbal — çfarë të thuash me gojë, natyral' : ''}
- Lër [LINK] si placeholder për linkun e reviews
- Fol shqip, natyral, jo si robot

Ndajini me ---

**Varianti 1**
[mesazhi]

---

**Varianti 2**
[mesazhi]

---

**Varianti 3**
[mesazhi]`
    } else {
      prompt = `Kthe këtë feedback të klientit në 3 variante testimoniali profesionale, të gatshme për t'u përdorur në reklama, faqe web dhe postime.

Biznesi: ${profile?.business_name || 'biznesi ynë'} (${profile?.industry || ''})
Feedback origjinal i klientit: "${feedback}"
${clientName ? `Emri i klientit: ${clientName}` : ''}

Kërkesat:
- Ruaj thelbin dhe faktet nga feedback origjinal
- Ji specifik — mos e bëj të përgjithshëm
- Shtoj detaje nëse mungojnë (bazuar te konteksti)
- Mos shpik shifra që nuk janë në feedback

Shkruaj 3 variante:

**I Shkurtër** (1-2 fjali, ideal për Instagram/Facebook)
[Testimoniali i shkurtër]
— [Emri], [Profesioni/Zona]
⭐⭐⭐⭐⭐

---

**I Mesëm** (3-4 fjali, ideal për reklamat)
[Testimoniali i mesëm]
— [Emri], [Profesioni/Zona]
⭐⭐⭐⭐⭐

---

**I Detajuar** (1 paragraf, ideal për faqen web)
[Testimoniali i detajuar me kontekst para/pas]
— [Emri], [Profesioni/Zona]
⭐⭐⭐⭐⭐

Fol shqip.`
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i reputacionit online dhe copywritingut për biznese shqiptare. Shkruaj mesazhe natyrale dhe bindëse. Fol shqip gjithmonë.',
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
        setResult(fullText)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  const canGenerate = tab === 'request' ? true : feedback.trim().length > 5

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
              <p className="text-sm font-semibold text-gray-900">{tab === 'request' ? 'Duke shkruar mesazhet...' : 'Duke krijuar testimonialet...'}</p>
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

  if (result) {
    const variants = tab === 'request'
      ? parseRequestVariants(result)
      : parseTestimonialVariants(result)

    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <h1 className="font-heading text-xl font-bold text-gray-900">
              {tab === 'request' ? 'Mesazhet e Gatshme' : 'Testimonialet e Formatuara'}
            </h1>
          </div>
          <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
          </button>
        </div>

        {tab === 'request' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>💡 Zëvendëso [LINK]</strong> me linkun tuaj real të Google Maps, Facebook Page, ose TripAdvisor para dërgimit.
          </div>
        )}
        {tab === 'transform' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
            <strong>💡 Këto testimoniale</strong> janë gati për Instagram, reklamat e Meta, faqen web, ose fletushka.
          </div>
        )}

        <div className="space-y-4">
          {tab === 'request'
            ? variants.map((v, i) => <CopyBlock key={i} label={`Varianti ${i + 1}`} text={v} />)
            : variants.map((v, i) => <CopyBlock key={i} label={v.label} text={v.text} />)
          }
        </div>

        <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2">
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
          <p className="text-xs text-gray-400 mt-0.5">Kërko reviews dhe kthe feedback-un në testimoniale</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null) }}
            className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all ${tab === t.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="text-sm font-semibold text-gray-900">{t.label}</span>
            <span className="text-xs text-gray-400 mt-0.5">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* TAB A: Request Review */}
      {tab === 'request' && (
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Kanali i Komunikimit</label>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map(c => (
                <button key={c.id} onClick={() => setChannel(c.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${channel === c.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-sm font-semibold text-gray-900">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Platforma ku duam Review</label>
            <div className="grid grid-cols-2 gap-2">
              {REVIEW_PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${platform === p.id ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Emri i Klientit <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="p.sh. Arta, Blerim, Znj. Kelmendi..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Çfarë bleu / shërbimi i marrë <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
              <Textarea value={context} onChange={e => setContext(e.target.value)}
                placeholder="p.sh. Bleu kursin e gatimit, ishte shumë e kënaqur, e kishte rekomanduar edhe njohura..."
                rows={2}/>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: Transform feedback */}
      {tab === 'transform' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Çfarë tha klienti? <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="p.sh. 'ishte super, u kënaqëm shumë, çmimet ishin të arsyeshme dhe shërbimi i shpejtë, do vij sërish'

ose kopjo mesazhin nga WhatsApp/Instagram direkt këtu..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Emri i Klientit <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="p.sh. Elona M., Arben K., Znj. Hoxha..." />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-700">
              <strong>Si funksionon:</strong> Fut feedback-un e papërpunuar (mesazh WhatsApp, koment, gjë e thënë me gojë) dhe AI e kthen në 3 variante testimoniali të formatuara, gati për reklamat dhe faqen web.
            </p>
          </div>
        </div>
      )}

      <Button onClick={generate} disabled={!canGenerate} className="w-full gap-2 bg-amber-500 hover:bg-amber-600" size="lg">
        {tab === 'request'
          ? <><Send className="w-5 h-5"/>Gjenero Mesazhet e Kërkesës</>
          : <><Star className="w-5 h-5"/>Krijo 3 Variante Testimoniali</>
        }
      </Button>
    </div>
  )
}
