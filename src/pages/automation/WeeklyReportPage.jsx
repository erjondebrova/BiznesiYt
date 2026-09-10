import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { ArrowLeft, FileBarChart, RefreshCw, RotateCcw, Copy, Check, Loader2 } from 'lucide-react'

const SYSTEM_PROMPT = `Ti je një analist biznesi automatik për biznese të vogla shqiptare. Gjenero raporte javore bazuar te të dhënat e sistemit.

RREGULL KRITIK: Raporto VETËM metrikat e dhëna. Zero metrika të derivuara. Zero numra të shpikur.

Gjenero raportin sipas formatit:

📊 RAPORTI I JAVËS

--- KLIENTË & SHITJE ---
👥 Klientë të rinj këtë javë: [numri]
🔄 Leads pa konvertuar: [numri]
🟢 Shitje të mbyllura: [numri] (vlera: [shuma])
📞 Follow-up-e për të bërë: [numri leads të vjetër]

--- PRODUKTE & STOK ---
📦 Produkte me stok kritik: [lista ose "asnjë"]
⚠️ Produkte pa lëvizje: [nëse ka të dhëna]

--- PËRMBLEDHJE ---
✅ Çfarë shkoi mirë: [2 pika bazuar te të dhënat]
⚠️ Çfarë kërkon vëmendje: [2 pika]

📋 VEPRIMET PËR JAVËN TJETËR:
1. ☐ [Veprimi] — [Pse]
2. ☐ [Veprimi] — [Pse]
3. ☐ [Veprimi] — [Pse]

RREGULLA:
- Nëse nuk ka mjaft të dhëna për një seksion, thuaj "Shto [llojin e të dhënave] për ta parë këtë seksion javën tjetër"
- Mbaje 1 faqe — pronari nuk ka kohë për raporte të gjata
- Toni: direkt, pozitiv por realist
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

export default function WeeklyReportPage() {
  const { user, profile } = useAuth()
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)
  const [dataSummary, setDataSummary] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoadingData(true)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const [{ data: newClients }, { data: allClients }, { data: opps }, { data: products }] = await Promise.all([
      supabase.from('clients').select('id').eq('user_id', user.id).gte('created_at', weekAgo),
      supabase.from('clients').select('id, category, created_at').eq('user_id', user.id),
      supabase.from('sales_opportunities').select('*').eq('user_id', user.id),
      supabase.from('products').select('*').eq('user_id', user.id),
    ])
    const leads = (allClients || []).filter(c => c.category === 'lead')
    const closedThisWeek = (opps || []).filter(o => o.stage === 'closed' && new Date(o.updated_at) >= new Date(weekAgo))
    const lowStock = (products || []).filter(p => p.stock_qty !== null && p.stock_qty <= (p.min_stock || 5))
    setDataSummary({
      newClientsCount: newClients?.length || 0,
      leadsCount: leads.length,
      closedCount: closedThisWeek.length,
      closedValue: closedThisWeek.reduce((s, o) => s + Number(o.value || 0), 0),
      lowStockProducts: lowStock.map(p => p.name),
      totalProducts: products?.length || 0,
      totalClients: allClients?.length || 0,
    })
    setLoadingData(false)
  }

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = `Biznesi: ${profile?.business_name || 'Biznesi Im'}
Periudha: java e fundit (7 ditë)

TË DHËNAT:
Klientë të rinj këtë javë: ${dataSummary.newClientsCount}
Leads gjithsej pa konvertuar: ${dataSummary.leadsCount}
Shitje të mbyllura këtë javë: ${dataSummary.closedCount} (vlera: ${dataSummary.closedValue} lekë)
Produkte me stok kritik: ${dataSummary.lowStockProducts.length > 0 ? dataSummary.lowStockProducts.join(', ') : 'asnjë'}
Total produkte të regjistruara: ${dataSummary.totalProducts}
Total klientë të regjistruar: ${dataSummary.totalClients}

Gjenero raportin javor sipas formatit, duke përdorur VETËM këto numra.`
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
      <div className="flex items-center gap-2 mb-6"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Raport Javor</h1></div>
      <div className="card border border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-slate-600 rounded-xl flex items-center justify-center animate-pulse"><FileBarChart className="w-5 h-5 text-white"/></div><p className="text-sm font-semibold text-gray-900">Duke gjeneruar raportin...</p></div>
        {streamingText ? <div className="bg-white rounded-xl p-4 border border-slate-200 max-h-64 overflow-y-auto"><pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-slate-600 ml-0.5 animate-pulse"/></pre></div> : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-slate-500"/>Duke procesuar...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Raporti Gati!</h1></div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><RotateCcw className="w-3.5 h-3.5"/>Rifresko</button>
      </div>
      <CopyBlock label="Raporti Javor" text={result}/>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Gjenero raport të ri</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/automation" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div><h1 className="font-heading text-xl font-bold text-gray-900">Raport Javor</h1><p className="text-xs text-gray-400 mt-0.5">Çdo herë që hyn, merr pamjen e javës — pa fut numra manualisht</p></div>
      </div>
      <div className="card grid grid-cols-2 gap-3 py-4">
        <div className="text-center"><p className="text-xl font-bold text-gray-900">{dataSummary.newClientsCount}</p><p className="text-[10px] text-gray-400">klientë të rinj</p></div>
        <div className="text-center"><p className="text-xl font-bold text-emerald-600">{dataSummary.closedCount}</p><p className="text-[10px] text-gray-400">shitje të mbyllura</p></div>
        <div className="text-center"><p className="text-xl font-bold text-amber-600">{dataSummary.leadsCount}</p><p className="text-[10px] text-gray-400">leads pa konvertuar</p></div>
        <div className="text-center"><p className="text-xl font-bold text-red-500">{dataSummary.lowStockProducts.length}</p><p className="text-[10px] text-gray-400">produkte stok kritik</p></div>
      </div>
      <Button onClick={generate} className="w-full gap-2 bg-slate-700 hover:bg-slate-800" size="lg"><FileBarChart className="w-5 h-5"/>Gjenero Raportin e Javës</Button>
    </div>
  )
}
