import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, PartyPopper, RefreshCw, RotateCcw, Copy, Check } from 'lucide-react'

const TRIGGERS = [
  { id: 'new_client', label: 'Kur regjistrohet klient i ri' },
  { id: 'first_purchase', label: 'Kur bëhet blerja e parë' },
  { id: 'social_msg', label: 'Kur dikush shkruan në Instagram/WhatsApp' },
  { id: 'all', label: 'Të gjitha situatat' },
]
const CHANNELS = ['WhatsApp', 'SMS', 'Email', 'Instagram DM']
const TONES = ['Profesional', 'Miqësor', 'I ngrohtë']

const SYSTEM_PROMPT = `Ti je një ekspert i automatizimit të komunikimit me klientë. Krijo mesazhe mirëseardhje për klientë të rinj.

Gjenero 3 variante — një për secilin skenar që kërkohet nga: KLIENT I RI I REGJISTRUAR, PAS BLERJES SË PARË, MESAZH NË SOCIAL MEDIA (gjenero vetëm skenarët e kërkuar).

Secili variant përfshin: placeholder [EMRI_KLIENTIT], [EMRI_BIZNESIT], [LINK], [KODI_ZBRITJES] kur duhet; emoji të matura (1-2); CTA e butë.

Rregulla: Mesazhi nuk duhet të duket spam — personal dhe i ngrohtë. Max 4-5 fjali. Fol shqip.

Në fund të çdo skenari, shto konfigurimin në formatin:
"✅ Trigger: [kur ndodh] · 📱 Kanali: [kanali] · ⏰ Vonesa: [menjëherë/pas pak]"`

function buildPrompt({ businessName, trigger, channel, tone, hasOffer }) {
  const trigLabel = TRIGGERS.find(t => t.id === trigger)?.label
  return `Biznesi: ${businessName}
Trigger: ${trigLabel}
Kanali: ${channel}
Toni: ${tone}
${hasOffer ? 'Përfshi ofertë speciale për klientë të rinj (p.sh. 10% zbritje me kod)' : 'Pa ofertë speciale'}

Gjenero mesazhet mirëseardhje sipas formatit.`
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

export default function WelcomeMessagePage() {
  const { profile } = useAuth()
  const [trigger, setTrigger] = useState('all')
  const [channel, setChannel] = useState('WhatsApp')
  const [tone, setTone] = useState('Miqësor')
  const [hasOffer, setHasOffer] = useState(true)
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  const businessName = profile?.business_name || 'Biznesi Im'

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = buildPrompt({ businessName, trigger, channel, tone, hasOffer })
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
      <div className="flex items-center gap-2 mb-6"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Mirëseardhje Automatike</h1></div>
      <div className="card border border-pink-100 bg-pink-50/30">
        <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-pink-500 rounded-xl flex items-center justify-center animate-pulse"><PartyPopper className="w-5 h-5 text-white"/></div><p className="text-sm font-semibold text-gray-900">Duke krijuar mesazhet...</p></div>
        {streamingText ? <div className="bg-white rounded-xl p-4 border border-pink-100 max-h-64 overflow-y-auto"><pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-pink-500 ml-0.5 animate-pulse"/></pre></div> : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-pink-500"/>Duke shkruar...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Mesazhet Gati!</h1></div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero</button>
      </div>
      <CopyBlock label="Mesazhet e Mirëseardhjes" text={result}/>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3"><p className="text-xs text-blue-700">💡 Ngjiti mesazhet te WhatsApp Business Quick Replies, ose te automatizimet e Instagram/Facebook për t'i dërguar automatikisht.</p></div>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Krijo mesazhe të reja</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div><h1 className="font-heading text-xl font-bold text-gray-900">Mirëseardhje Automatike</h1><p className="text-xs text-gray-400 mt-0.5">Çdo klient i ri merr mesazh profesional</p></div>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Kur do dërgohet?</label>
          <div className="space-y-1.5">{TRIGGERS.map(t => <button key={t.id} onClick={() => setTrigger(t.id)} className={`w-full text-left px-3 py-2 rounded-xl border-2 text-sm ${trigger === t.id ? 'border-pink-500 bg-pink-50 font-semibold text-pink-700' : 'border-gray-200 text-gray-600'}`}>{t.label}</button>)}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Kanali</label>
          <div className="flex flex-wrap gap-2">{CHANNELS.map(c => <button key={c} onClick={() => setChannel(c)} className={`px-3 py-1.5 rounded-lg text-xs border-2 ${channel === c ? 'border-pink-500 bg-pink-50 font-semibold text-pink-700' : 'border-gray-200 text-gray-500'}`}>{c}</button>)}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Toni</label>
          <div className="flex flex-wrap gap-2">{TONES.map(t => <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 rounded-lg text-xs border-2 ${tone === t ? 'border-pink-500 bg-pink-50 font-semibold text-pink-700' : 'border-gray-200 text-gray-500'}`}>{t}</button>)}</div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hasOffer} onChange={e => setHasOffer(e.target.checked)} className="w-4 h-4 rounded accent-pink-600"/>
          <span className="text-sm text-gray-700">Përfshi ofertë speciale për klientë të rinj</span>
        </label>
      </div>
      <Button onClick={generate} className="w-full gap-2 bg-pink-600 hover:bg-pink-700" size="lg"><PartyPopper className="w-5 h-5"/>Gjenero Mesazhet</Button>
    </div>
  )
}
