import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ArrowLeft, CalendarClock, RefreshCw, RotateCcw, Copy, Check } from 'lucide-react'

const NETWORKS = ['Instagram', 'Facebook', 'TikTok']
const FREQUENCIES = [3, 5, 7]

const SYSTEM_PROMPT = `Ti je një menaxher përmbajtjeje për biznese të vogla shqiptare. Krijo plan postimesh javor për rrjetet sociale.

Gjenero planin si tabelë: | Dita | Lloji | Titulli/Ideja | Kanali |

Për secilën ditë jep: idenë e postimit (1 fjali), caption të plotë sugjeruar, 5-10 hashtag-e relevante, sugjerim formati (foto/video/carousel/reel), ora optimale.

RREGULLA:
- Balanco: 80% vlerë (edukim, prapaskenave, testimoniale), 20% shitje/oferta
- Hashtag-et: 5 specifike + 3 mesatare + 2 të gjera
- Caption max 150 fjalë, me CTA në fund
- Mos përsërit të njëjtin format dy ditë radhazi
- Përshtat sipas sezonit/festave shqiptare nëse është relevante
- Fol shqip`

function buildPrompt({ businessName, industry, networks, frequency, audience, focus }) {
  return `Biznesi: ${businessName} (${industry})
Rrjetet: ${networks.join(', ')}
Postime në javë: ${frequency}
Audienca: ${audience || 'klientë të interesuar'}
${focus ? `Produkte/shërbime për t'u promovuar këtë javë: ${focus}` : ''}

Gjenero planin javor të postimeve sipas formatit.`
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

export default function PostPlannerPage() {
  const { profile } = useAuth()
  const [networks, setNetworks] = useState(['Instagram'])
  const [frequency, setFrequency] = useState(5)
  const [audience, setAudience] = useState('')
  const [focus, setFocus] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  const businessName = profile?.business_name || 'Biznesi Im'
  const industry = profile?.industry || ''

  function toggleNetwork(n) { setNetworks(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]) }

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = buildPrompt({ businessName, industry, networks, frequency, audience, focus })
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
      <div className="flex items-center gap-2 mb-6"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Postime Automatike</h1></div>
      <div className="card border border-fuchsia-100 bg-fuchsia-50/30">
        <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-fuchsia-500 rounded-xl flex items-center justify-center animate-pulse"><CalendarClock className="w-5 h-5 text-white"/></div><p className="text-sm font-semibold text-gray-900">Duke planifikuar javën...</p></div>
        {streamingText ? <div className="bg-white rounded-xl p-4 border border-fuchsia-100 max-h-64 overflow-y-auto"><pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-fuchsia-500 ml-0.5 animate-pulse"/></pre></div> : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-fuchsia-500"/>Duke gjeneruar idetë...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Plani Gati!</h1></div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero</button>
      </div>
      <CopyBlock label="Plani Javor i Postimeve" text={result}/>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Krijo plan të ri</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div><h1 className="font-heading text-xl font-bold text-gray-900">Automatizo Postimet</h1><p className="text-xs text-gray-400 mt-0.5">AI sugjeron, ti aprovon</p></div>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Rrjetet sociale</label>
          <div className="flex gap-2">{NETWORKS.map(n => <button key={n} onClick={() => toggleNetwork(n)} className={`px-3 py-1.5 rounded-lg text-xs border-2 ${networks.includes(n) ? 'border-fuchsia-500 bg-fuchsia-50 font-semibold text-fuchsia-700' : 'border-gray-200 text-gray-500'}`}>{n}</button>)}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Sa herë në javë?</label>
          <div className="flex gap-2">{FREQUENCIES.map(f => <button key={f} onClick={() => setFrequency(f)} className={`px-4 py-1.5 rounded-lg text-xs border-2 ${frequency === f ? 'border-fuchsia-500 bg-fuchsia-50 font-semibold text-fuchsia-700' : 'border-gray-200 text-gray-500'}`}>{f}x</button>)}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Audienca <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="p.sh. Gra 25-45, Tiranë"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Produkte për t'u promovuar <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Input value={focus} onChange={e => setFocus(e.target.value)} placeholder="p.sh. Koleksioni i ri, ofertë vjeshte"/>
        </div>
      </div>
      <Button onClick={generate} disabled={networks.length === 0} className="w-full gap-2 bg-fuchsia-600 hover:bg-fuchsia-700" size="lg"><CalendarClock className="w-5 h-5"/>Planifiko Javën</Button>
    </div>
  )
}
