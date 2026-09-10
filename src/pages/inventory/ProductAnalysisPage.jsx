import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { ArrowLeft, TrendingUp, RefreshCw, RotateCcw, Copy, Check, Loader2, Package } from 'lucide-react'

const SYSTEM_PROMPT = `Ti je një analist biznesi për ndërmarrje të vogla shqiptare. Analizon performancën e produkteve/shërbimeve bazuar te të dhënat e disponueshme.

RREGULL KRITIK: Përdor VETËM të dhënat e dhëna. Mos shpik numra shitjesh nëse nuk janë dhënë.

Gjenero analizën sipas formatit:

⭐ PAMJA E PRODUKTEVE
Sa produkte gjithsej, ndarja sipas kategorive/llojit.

💰 ANALIZA E ÇMIMEVE DHE MARXHIT (vetëm nëse ka kosto + çmim)
Produktet me marxhin më të lartë (çmim - kosto). Rekomandim se cilat të promovohen.

📦 STOKU (vetëm për produkte fizike)
Produkte me stok kritik ose 0. Produkte me shumë stok (mund të nevojiten oferta).

🔄 SUGJERIME KONKRETE
1. [Veprimi] — [Pse]
2. [Veprimi] — [Pse]
3. [Veprimi] — [Pse]

RREGULLA:
- Nëse nuk ka të dhëna shitjesh, analizo vetëm stokun, çmimet dhe kostot e disponueshme
- Mos llogarit ROI apo turnover rate — mbaje thjeshtë
- Çdo insight = veprim konkret
- Toni: si këshilltar biznesi, jo akademik
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

export default function ProductAnalysisPage() {
  const { user, profile } = useAuth()
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*').eq('user_id', user.id)
      setProducts(data || [])
      setLoadingData(false)
    })()
  }, [])

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const summary = products.map(p => {
      const margin = p.cost ? p.price - p.cost : null
      return `${p.name} (${p.business_type}${p.category ? `, ${p.category}` : ''}) — çmim: ${p.price}L${p.cost ? `, kosto: ${p.cost}L, marzhi: ${margin}L` : ''}${p.stock_qty !== null && p.stock_qty !== undefined ? `, stok: ${p.stock_qty} copë (min: ${p.min_stock})` : ''}`
    }).join('\n')
    const prompt = `Biznesi: ${profile?.business_name || 'Biznesi Im'} (${profile?.industry || ''})

Produktet/Shërbimet (${products.length} total):
${summary}

Analizo dhe gjenero raportin sipas formatit.`
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
      <div className="flex items-center gap-2 mb-6"><Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Analiza Produktesh</h1></div>
      <div className="card border border-cyan-100 bg-cyan-50/30">
        <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center animate-pulse"><TrendingUp className="w-5 h-5 text-white"/></div><p className="text-sm font-semibold text-gray-900">Duke analizuar {products.length} produkte...</p></div>
        {streamingText ? <div className="bg-white rounded-xl p-4 border border-cyan-100 max-h-64 overflow-y-auto"><pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-cyan-500 ml-0.5 animate-pulse"/></pre></div> : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-cyan-500"/>Duke procesuar...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Analiza Gati!</h1></div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><RotateCcw className="w-3.5 h-3.5"/>Rifresko</button>
      </div>
      <CopyBlock label="Analiza e Produkteve" text={result}/>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Analizo përsëri</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div><h1 className="font-heading text-xl font-bold text-gray-900">Analiza e Produkteve</h1><p className="text-xs text-gray-400 mt-0.5">Çfarë shitet, çfarë fiton, çfarë nuk lëviz</p></div>
      </div>
      <div className="card text-center py-6">
        <Package className="w-8 h-8 text-cyan-300 mx-auto mb-2"/>
        <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        <p className="text-xs text-gray-400">produkte/shërbime të regjistruara</p>
      </div>
      <Button onClick={generate} disabled={products.length === 0} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700" size="lg"><TrendingUp className="w-5 h-5"/>Analizo Produktet</Button>
      {products.length === 0 && <p className="text-center text-xs text-gray-400">Nuk ke ende produkte. <Link to="/inventory/products/new" className="text-cyan-600 font-semibold hover:underline">Shto produktin e parë →</Link></p>}
    </div>
  )
}
