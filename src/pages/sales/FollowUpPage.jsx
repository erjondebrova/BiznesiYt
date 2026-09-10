import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ArrowLeft, MessageCircle, RefreshCw, RotateCcw, Copy, Check } from 'lucide-react'

const SITUATIONS = [
  { id: 'new_lead',   label: 'Lead i Ri',        emoji: '🆕', desc: 'Ka pyetur, s\'ka blerë ende' },
  { id: 'offer_noresp',label: 'Ofertë pa Përgjigje', emoji: '⏳', desc: 'I dhe çmimin, s\'u kthye' },
  { id: 'post_purchase', label: 'Pas Blerjes',   emoji: '🙏', desc: 'Falenderim + kërko review' },
  { id: 'lost_client', label: 'Klient i Humbur', emoji: '💤', desc: '30+ ditë pa blerje' },
  { id: 'reminder',    label: 'Kujtesë',          emoji: '📌', desc: 'I ke premtuar diçka' },
]

const CHANNELS = ['WhatsApp', 'SMS', 'Email', 'Thirrje telefonike', 'Instagram DM']
const TONES = ['Miqësor', 'Profesional', 'Urgjent por i sjellshëm']

const SYSTEM_PROMPT = `Ti je një ekspert komunikimi me klientë për biznese të vogla shqiptare. Gjenero mesazhe follow-up të personalizuara.

Gjenero 3 variante:
VARIANTI 1 — I BUTË: ton miqësor, pa presion.
VARIANTI 2 — ME VLERË: ofron diçka shtesë (informacion, ofertë, novitet).
VARIANTI 3 — ME URGJENCË TË BUTË: krijon nxitje pa qenë agresiv.

Nëse situata është "Klient i Humbur", shto edhe VARIANTIN 4 — WIN-BACK: "Na ke munguar! Kemi diçka të re / ofertë speciale."

RREGULLA:
- Çdo mesazh: përshëndetje personale + arsye kontakti + CTA e butë
- Mos përdor presion agresiv ("blej tani ose humb")
- Gjatësia sipas kanalit: WhatsApp/SMS = 2-4 fjali, Email = 5-8 fjali, Thirrje = skript 30 sekondash, Instagram DM = shkurt e natyral
- Emoji me masë — 1-2 në mesazh
- Placeholder: [EMRI], [PRODUKTI], [OFERTA], [DATA]
- Në fund shto: "💡 Dërgo follow-up brenda 24-48 orëve — sa më shpejt, aq më shumë shanset e konvertimit."
- Fol shqip, natyral`

function buildPrompt({ situation, clientName, product, daysSince, channel, tone }) {
  const sitLabel = SITUATIONS.find(s => s.id === situation)?.label
  return `Situata: ${sitLabel}
Emri i klientit: ${clientName || '[EMRI]'}
Produkti/Shërbimi: ${product || 'i papërcaktuar'}
Kohë nga kontakti i fundit: ${daysSince || 'e panjohur'}
Kanali: ${channel}
Toni: ${tone}

Gjenero variantet e follow-up sipas formatit.`
}

function CopyBlock({ label, text }) {
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
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{text}</div>
    </div>
  )
}

export default function FollowUpPage() {
  const { profile } = useAuth()
  const [situation, setSituation] = useState('new_lead')
  const [clientName, setClientName] = useState('')
  const [product, setProduct] = useState('')
  const [daysSince, setDaysSince] = useState('')
  const [channel, setChannel] = useState('WhatsApp')
  const [tone, setTone] = useState('Miqësor')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = buildPrompt({ situation, clientName, product, daysSince, channel, tone })
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], systemPrompt: SYSTEM_PROMPT }),
      })
      if (res.ok) {
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
              const parsed = JSON.parse(data)
              const delta = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || ''
              if (delta) { full += delta; setStreamingText(full) }
            } catch {}
          }
        }
        setResult(full)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <h1 className="font-heading text-xl font-bold text-gray-900">Follow-up Klientësh</h1>
      </div>
      <div className="card border border-rose-100 bg-rose-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center animate-pulse"><MessageCircle className="w-5 h-5 text-white"/></div>
          <p className="text-sm font-semibold text-gray-900">Duke shkruar mesazhet...</p>
        </div>
        {streamingText ? (
          <div className="bg-white rounded-xl p-4 border border-rose-100 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-rose-500 ml-0.5 animate-pulse"/></pre>
          </div>
        ) : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-rose-500"/>Duke analizuar situatën...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Mesazhet Gati!</h1>
        </div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
        </button>
      </div>
      <CopyBlock label="Variantet e Follow-up" text={result}/>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Krijo mesazhe të reja</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Gjenerator Follow-up</h1>
          <p className="text-xs text-gray-400 mt-0.5">Mos lër asnjë klient pa përgjigje</p>
        </div>
      </div>

      <div className="card space-y-2">
        <label className="block text-sm font-semibold text-gray-900 mb-1">Çfarë lloj follow-up-i?</label>
        {SITUATIONS.map(s => (
          <button key={s.id} onClick={() => setSituation(s.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all ${situation === s.id ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="text-lg">{s.emoji}</span>
            <div><div className="text-sm font-semibold text-gray-800">{s.label}</div><div className="text-xs text-gray-400">{s.desc}</div></div>
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Emri i klientit</label>
            <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="opsionale"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Sa kohë ka kaluar</label>
            <Input value={daysSince} onChange={e => setDaysSince(e.target.value)} placeholder="p.sh. 3 ditë"/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Produkti/Shërbimi në fjalë</label>
          <Input value={product} onChange={e => setProduct(e.target.value)} placeholder="opsionale"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Kanali</label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(c => (
              <button key={c} onClick={() => setChannel(c)} className={`px-3 py-1.5 rounded-lg text-xs border-2 ${channel === c ? 'border-rose-500 bg-rose-50 font-semibold text-rose-700' : 'border-gray-200 text-gray-500'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Toni</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 rounded-lg text-xs border-2 ${tone === t ? 'border-rose-500 bg-rose-50 font-semibold text-rose-700' : 'border-gray-200 text-gray-500'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={generate} className="w-full gap-2 bg-rose-600 hover:bg-rose-700" size="lg"><MessageCircle className="w-5 h-5"/>Gjenero Mesazhet</Button>
    </div>
  )
}
