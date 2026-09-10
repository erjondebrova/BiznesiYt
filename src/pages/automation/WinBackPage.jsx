import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Heart, RefreshCw, RotateCcw, Copy, Check, Loader2 } from 'lucide-react'

const SYSTEM_PROMPT = `Ti je një ekspert i rikthimit të klientëve (win-back) për biznese të vogla shqiptare. Krijo fushatë mesazhesh për t'i rikthyer klientët inaktivë.

Gjenero sekuencën:
MESAZHI 1 — KUJTESË E BUTË (dita 1): ton i ngrohtë, pa presion, "ka kohë që nuk shihemi".
MESAZHI 2 — OFERTË (pas 3-5 ditësh): ofertë konkrete e personalizuar, urgjencë e butë.
MESAZHI 3 — I FUNDIT (pas 5-7 ditësh): mbyll ciklin pa presion, le derën hapur.

Në fund shto planin: "📅 Dita 1: Mesazhi 1 → [X] klientë · Dita 4: Mesazhi 2 → pa përgjigje · Dita 9: Mesazhi 3"

RREGULLA:
- Max 3 mesazhe — pas kësaj bëhet spam
- Toni miqësor, personal — jo si reklamë masive
- Placeholder [EMRI], [BIZNESI], [OFERTA]
- Fol shqip`

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

export default function WinBackPage() {
  const { user, profile } = useAuth()
  const [clients, setClients] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [offer, setOffer] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('clients').select('*').eq('user_id', user.id)
      setClients(data || [])
      setLoadingData(false)
    })()
  }, [])

  const buckets = useMemo(() => {
    const now = new Date()
    const daysSince = c => {
      const ref = c.last_purchase_date || c.contact_date || c.created_at
      return Math.floor((now - new Date(ref)) / 86400000)
    }
    const d30 = clients.filter(c => { const d = daysSince(c); return d >= 30 && d < 60 })
    const d60 = clients.filter(c => { const d = daysSince(c); return d >= 60 && d < 90 })
    const d90 = clients.filter(c => daysSince(c) >= 90)
    return { d30, d60, d90, all: [...d30, ...d60, ...d90] }
  }, [clients])

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = `Biznesi: ${profile?.business_name || 'Biznesi Im'}
Klientë inaktivë 30-60 ditë: ${buckets.d30.length}
Klientë inaktivë 60-90 ditë: ${buckets.d60.length}
Klientë inaktivë 90+ ditë: ${buckets.d90.length}
${offer ? `Oferta speciale: ${offer}` : 'Pa ofertë specifike — sugjero diçka'}

Gjenero fushatën win-back sipas formatit.`
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

  if (loadingData) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-6 h-6 animate-spin text-gray-300"/></div>

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Rikthe Klientët</h1></div>
      <div className="card border border-red-100 bg-red-50/30">
        <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center animate-pulse"><Heart className="w-5 h-5 text-white"/></div><p className="text-sm font-semibold text-gray-900">Duke krijuar fushatën...</p></div>
        {streamingText ? <div className="bg-white rounded-xl p-4 border border-red-100 max-h-64 overflow-y-auto"><pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-red-500 ml-0.5 animate-pulse"/></pre></div> : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-red-500"/>Duke shkruar mesazhet...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Fushata Win-back Gati!</h1></div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero</button>
      </div>
      <CopyBlock label="Sekuenca Win-back" text={result}/>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Krijo fushatë të re</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div><h1 className="font-heading text-xl font-bold text-gray-900">Rikthe Klientët (Win-back)</h1><p className="text-xs text-gray-400 mt-0.5">Klientë inaktivë? Kontaktoji me ofertë të personalizuar</p></div>
      </div>

      {buckets.all.length === 0 ? (
        <div className="card text-center py-10">
          <PartyIcon/>
          <p className="text-sm font-semibold text-gray-700 mt-2">Lajm i mirë! 🎉</p>
          <p className="text-xs text-gray-400 mt-1">Të gjithë klientët janë aktivë (bazuar te data e regjistrimit). Kontrollo përsëri muajin tjetër.</p>
        </div>
      ) : (
        <>
          <div className="card space-y-2">
            <p className="text-sm font-semibold text-gray-900 mb-1">📋 Klientë inaktivë:</p>
            {buckets.d30.length > 0 && <p className="text-xs text-gray-600">🟡 {buckets.d30.length} klientë pa aktivitet 30-60 ditë (ende ngrohtë)</p>}
            {buckets.d60.length > 0 && <p className="text-xs text-gray-600">🟠 {buckets.d60.length} klientë pa aktivitet 60-90 ditë (duke u ftohur)</p>}
            {buckets.d90.length > 0 && <p className="text-xs text-gray-600">🔴 {buckets.d90.length} klientë pa aktivitet 90+ ditë (kërkon ofertë të fortë)</p>}
          </div>
          <div className="card">
            <label className="block text-sm font-semibold text-gray-900 mb-1">Oferta speciale <span className="text-gray-400 font-normal text-xs">(opsionale — AI sugjeron nëse s'ke)</span></label>
            <input value={offer} onChange={e => setOffer(e.target.value)} placeholder="p.sh. 15% zbritje, dhuratë me blerjen, transport falas"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"/>
          </div>
          <Button onClick={generate} className="w-full gap-2 bg-red-500 hover:bg-red-600" size="lg"><Heart className="w-5 h-5"/>Krijo Fushatën Win-back</Button>
        </>
      )}
    </div>
  )
}

function PartyIcon() {
  return <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl">🎉</div>
}
