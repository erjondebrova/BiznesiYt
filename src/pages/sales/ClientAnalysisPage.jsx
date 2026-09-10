import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { ArrowLeft, BarChart3, RefreshCw, RotateCcw, Copy, Check, Loader2, Users } from 'lucide-react'

const SYSTEM_PROMPT = `Ti je një analist biznesi për ndërmarrje të vogla shqiptare. Analizon të dhënat e klientëve dhe shitjeve për të dhënë njohuri (insights) të zbatueshme.

RREGULL KRITIK: Analizo VETËM me të dhënat që janë dhënë. Mos shpik numra, mos llogarit metrika që nuk mund t'i nxjerrësh nga të dhënat e dhëna.

Gjenero analizën sipas formatit:

📊 PAMJA E PËRGJITHSHME
Totali i klientëve, ndarja sipas kategorisë, leads pa konvertuar.

📈 NGA VIJNË KLIENTËT
Ndarja sipas burimit (%), cili kanal sjell më shumë, cili sjell më të mirët. Rekomandim konkret.

🛍️ ÇFARË BLEJNË
Produktet/interesat më të kërkuara nga të dhënat.

👤 KLIENTËT E TU MË TË MIRË
Top klientët sipas vlerës (nëse ka të dhëna pipeline), çfarë kanë të përbashkët.

⚠️ SINJALE PARALAJMËRUESE
Leads në pritje shumë gjatë, kategori që tkurret.

📋 3 VEPRIME KONKRETE
1. [Veprimi] — [Pse] — [Si ta bësh]
2. [Veprimi] — [Pse] — [Si ta bësh]
3. [Veprimi] — [Pse] — [Si ta bësh]

RREGULLA:
- Përdor vetëm të dhëna reale të dhëna më poshtë
- Mos llogarit metrika të derivuara (CLV, churn rate)
- Gjuha e thjeshtë, pa zhargon — "klientët nga Instagram blejnë 2x më shumë se ata nga Google" në vend të CAC/LTV
- Çdo insight duhet të çojë në veprim
- Nëse të dhënat janë të pamjaftueshme (< 10 klientë), thuaj që rekomandon më shumë të dhëna, por analizo ç'ka mundësi me ato ekzistuese`

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

export default function ClientAnalysisPage() {
  const { user, profile } = useAuth()
  const [clients, setClients] = useState([])
  const [opps, setOpps] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoadingData(true)
    const [{ data: c }, { data: o }] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user.id),
      supabase.from('sales_opportunities').select('*').eq('user_id', user.id),
    ])
    setClients(c || [])
    setOpps(o || [])
    setLoadingData(false)
  }

  function buildDataSummary() {
    const byCategory = {}
    clients.forEach(c => { byCategory[c.category] = (byCategory[c.category] || 0) + 1 })
    const bySource = {}
    clients.forEach(c => { if (c.source) bySource[c.source] = (bySource[c.source] || 0) + 1 })
    const byInterest = {}
    clients.forEach(c => { if (c.interest) byInterest[c.interest] = (byInterest[c.interest] || 0) + 1 })
    const closedOpps = opps.filter(o => o.stage === 'closed')
    const pendingOpps = opps.filter(o => o.stage !== 'closed' && o.stage !== 'lost')

    return `Biznesi: ${profile?.business_name || 'Biznesi Im'} (${profile?.industry || ''})

TOTALI I KLIENTËVE: ${clients.length}
NDARJA SIPAS KATEGORISË: ${JSON.stringify(byCategory)}
NDARJA SIPAS BURIMIT: ${JSON.stringify(bySource)}
INTERESAT/PRODUKTET E KËRKUARA: ${JSON.stringify(byInterest)}

PIPELINE SHITJESH:
- Mundësi të mbyllura: ${closedOpps.length} (vlera totale: ${closedOpps.reduce((s, o) => s + Number(o.value || 0), 0)} lekë)
- Mundësi aktive/në pritje: ${pendingOpps.length}
- Mundësi të humbura: ${opps.filter(o => o.stage === 'lost').length}

TOP 5 KLIENTËT ME VLERË MË TË LARTË: ${JSON.stringify(closedOpps.sort((a,b) => b.value - a.value).slice(0,5).map(o => ({ klient: o.client_name, vlera: o.value })))}`
  }

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = `Analizo këto të dhëna reale të biznesit dhe gjenero raportin sipas formatit:\n\n${buildDataSummary()}`
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
      <div className="flex items-center gap-2 mb-6">
        <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <h1 className="font-heading text-xl font-bold text-gray-900">Analiza Klientësh</h1>
      </div>
      <div className="card border border-indigo-100 bg-indigo-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center animate-pulse"><BarChart3 className="w-5 h-5 text-white"/></div>
          <p className="text-sm font-semibold text-gray-900">Duke analizuar {clients.length} klientë...</p>
        </div>
        {streamingText ? (
          <div className="bg-white rounded-xl p-4 border border-indigo-100 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-indigo-500 ml-0.5 animate-pulse"/></pre>
          </div>
        ) : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-indigo-500"/>Duke procesuar...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analiza Gati!</h1>
        </div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <RotateCcw className="w-3.5 h-3.5"/>Rifresko
        </button>
      </div>
      <CopyBlock label="Analiza e Klientëve" text={result}/>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Analizo përsëri</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/sales" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analiza e Klientëve</h1>
          <p className="text-xs text-gray-400 mt-0.5">Kush janë klientët tu më të mirë? Nga vijnë? Çfarë blejnë?</p>
        </div>
      </div>

      <div className="card text-center py-6">
        <Users className="w-8 h-8 text-indigo-300 mx-auto mb-2"/>
        <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        <p className="text-xs text-gray-400">klientë të regjistruar · {opps.length} mundësi shitjeje</p>
        {clients.length < 10 && (
          <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg p-2 mx-4">
            Për analiza më të sakta, rekomandojmë të paktën 20-30 klientë. Do analizojmë me çfarë ka tani.
          </p>
        )}
      </div>

      <Button onClick={generate} disabled={clients.length === 0} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700" size="lg">
        <BarChart3 className="w-5 h-5"/>Analizo Klientët
      </Button>
      {clients.length === 0 && (
        <p className="text-center text-xs text-gray-400">
          Nuk ke ende klientë. <Link to="/sales/clients/new" className="text-indigo-600 font-semibold hover:underline">Shto klientin e parë →</Link>
        </p>
      )}
    </div>
  )
}
