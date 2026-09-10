import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { ArrowLeft, DollarSign, RefreshCw, RotateCcw, Copy, Check } from 'lucide-react'

const GOALS = [
  { id: 'a', label: 'Rrit numrin e shitjeve', emoji: '📈', desc: 'Më shumë klientë' },
  { id: 'b', label: 'Rrit vlerën mesatare të blerjes', emoji: '💰', desc: 'Çdo klient shpenzon më shumë' },
  { id: 'c', label: 'Tërhiq klientë të rinj', emoji: '🎯', desc: 'Ofertë hyrëse' },
  { id: 'd', label: 'Mbaj klientët ekzistues', emoji: '🤝', desc: 'Lojalitet & rikthim' },
]
const CLIENT_TYPES = ['Buxhet i ulët', 'Buxhet mesatar', 'Premium / Luksoz']

const SYSTEM_PROMPT = `Ti je një konsulent i strategjisë së çmimeve dhe shitjeve, i specializuar për biznese të vogla dhe të mesme në tregun shqiptar. Detyra jote është të ndihmosh biznesin të strukturojë çmimet, krijojë paketa, dhe hartojë oferta që rrisin shitjet dhe vlerën mesatare të blerjes.

Të gjitha të dhënat e nevojshme janë dhënë. Gjenero direkt 3 strategjitë sipas formatit:

📦 STRATEGJIA A — PAKETA ÇMIMESH (Good / Better / Best)
Krijo 3 nivele paketash me emra konkretë (jo "Paketa 1/2/3"), çmime realiste për tregun shqiptar, dhe çfarë përfshin secila.
Shto: "💡 Pse funksionon:" me arsyetimin psikologjik.

🎁 STRATEGJIA B — OFERTË PROMOCIONALE
Oferta 1 — Sezonale/Kohore: emri, çfarë përfshin, afati, mesazhi marketing, ku ta publikosh.
Oferta 2 — Hyrëse: ofertë me rrezik të ulët për klientë të rinj.

🔄 STRATEGJIA C — UPSELL & CROSS-SELL
3-5 kombinime konkrete "Kur blen X → ofro Y" me çmimin e kombinimit vs individual dhe fjalinë e shitjes.

RREGULLA:
- Çmimet realiste për tregun shqiptar
- Mos rekomandon zbritje agresive që dëmtojnë marxhin — shpjego pse
- Çdo rekomandim me arsyetim konkret
- Shembuj specifike nga industria e dhënë, jo gjenerikë
- Në fund: "📌 Filloje me një strategji, testoje 2-4 javë, mat rezultatin, pastaj përshtat."`

function buildPrompt({ businessName, businessType, products, clientType, goal, competitors, previousPromos }) {
  const goalLabel = GOALS.find(g => g.id === goal)?.label || goal
  return `Biznesi: ${businessName}
Industria/Lloji: ${businessType}
Produktet/Shërbimet me çmimet aktuale:
${products}
Tipi i klientëve: ${clientType}
Qëllimi kryesor: ${goalLabel}${competitors ? `\nKonkurrentët (çmimet): ${competitors}` : ''}${previousPromos ? `\nPromo të mëparshme (çfarë funksionoi/jo): ${previousPromos}` : ''}

Gjenero 3 strategjitë e çmimeve sipas formatit të dhënë.`
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

export default function PricingStrategyPage() {
  const { profile } = useAuth()
  const [businessType, setBusinessType] = useState('')
  const [products, setProducts]         = useState('')
  const [clientType, setClientType]     = useState('Buxhet mesatar')
  const [goal, setGoal]                 = useState('b')
  const [competitors, setCompetitors]   = useState('')
  const [previousPromos, setPreviousPromos] = useState('')
  const [loading, setLoading]           = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult]             = useState(null)

  const businessName = profile?.business_name || 'Biznesi Im'

  async function generate() {
    if (!products.trim()) return
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = buildPrompt({ businessName, businessType: businessType || profile?.industry || 'Biznes i vogël', products, clientType, goal, competitors, previousPromos })
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
        <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <h1 className="font-heading text-xl font-bold text-gray-900">Strategji Çmimesh</h1>
      </div>
      <div className="card border border-amber-100 bg-amber-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center animate-pulse">
            <DollarSign className="w-5 h-5 text-white"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Duke krijuar strategjinë e çmimeve...</p>
            <p className="text-xs text-gray-400">Paketa, oferta promocionale, upsell</p>
          </div>
        </div>
        {streamingText ? (
          <div className="bg-white rounded-xl p-4 border border-amber-100 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-amber-500 ml-0.5 animate-pulse"/></pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500"/>Duke analizuar biznesin...
          </div>
        )}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Strategjia e Çmimeve</h1>
            <p className="text-xs text-gray-400">{businessName}</p>
          </div>
        </div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
        </button>
      </div>
      <CopyBlock label="Strategjia e Plotë" text={result}/>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700 font-medium">💡 Testoje fillimisht me 1 strategji për 2-4 javë, mat rezultatin, pastaj zgjero.</p>
      </div>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2">
        <RotateCcw className="w-4 h-4"/>Gjenero strategji të re
      </Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Strategji Çmimesh & Ofertash</h1>
          <p className="text-xs text-gray-400 mt-0.5">Paketa çmimesh, oferta sezonale dhe strategji upsell</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
        <DollarSign className="w-4 h-4 text-amber-500 flex-shrink-0"/>
        <p className="text-xs text-amber-700">Krijohet për: <strong>{businessName}</strong></p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Çfarë biznesi ke? <span className="text-gray-400 font-normal text-xs">(industria, lloji)</span></label>
          <Input value={businessType} onChange={e => setBusinessType(e.target.value)}
            placeholder={`p.sh. ${profile?.industry || 'Salon bukurie, Restorant, Dyqan online'}`}/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Produktet / Shërbimet me çmimet aktuale <span className="text-red-400">*</span></label>
          <Textarea value={products} onChange={e => setProducts(e.target.value)} rows={4}
            placeholder="p.sh.&#10;- Prerje flokësh: 1,500 lekë&#10;- Ngjyrosje: 4,000 lekë&#10;- Paketë complete: 6,000 lekë"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Kush janë klientët tu?</label>
          <div className="flex gap-2 flex-wrap">
            {CLIENT_TYPES.map(c => (
              <button key={c} onClick={() => setClientType(c)}
                className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${clientType === c ? 'border-amber-500 bg-amber-50 font-semibold text-amber-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Qëllimi kryesor</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setGoal(g.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${goal === g.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="text-lg flex-shrink-0">{g.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{g.label}</div>
                  <div className="text-xs text-gray-500">{g.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Konkurrentët — çmimet e tyre <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Input value={competitors} onChange={e => setCompetitors(e.target.value)}
            placeholder="p.sh. Saloni Arti: 1,200 lekë prerje; Saloni Moda: 1,800 lekë"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Promo të mëparshme <span className="text-gray-400 font-normal text-xs">(çfarë funksionoi / jo — opsionale)</span></label>
          <Input value={previousPromos} onChange={e => setPreviousPromos(e.target.value)}
            placeholder="p.sh. 20% zbritje nuk funksionoi; paketa 2+1 funksionoi mirë"/>
        </div>
      </div>

      <Button onClick={generate} disabled={!products.trim()} className="w-full gap-2 bg-amber-500 hover:bg-amber-600" size="lg">
        <DollarSign className="w-5 h-5"/>Gjenero Strategjinë
      </Button>
    </div>
  )
}
