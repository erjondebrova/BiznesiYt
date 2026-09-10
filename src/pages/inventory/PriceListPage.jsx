import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ArrowLeft, ListOrdered, RefreshCw, RotateCcw, Copy, Check, Loader2, Package } from 'lucide-react'

const FORMATS = [
  { id: 'restaurant', label: '🍽️ Menu Restorant/Bar' },
  { id: 'services',   label: '💼 Lista Shërbimesh'    },
  { id: 'catalog',    label: '📦 Katalog Produktesh'   },
  { id: 'b2b',        label: '🏢 Çmime B2B (me zbritje)' },
]
const LANGUAGES = ['Shqip', 'Shqip + Anglisht', 'Anglisht']

const SYSTEM_PROMPT = `Ti je një dizajner i listave të çmimeve për biznese të vogla shqiptare. Krijo lista çmimesh profesionale nga produktet e dhëna.

Gjenero listë profesionale me:
- Header: emri i biznesit + slogan placeholder
- Kategori të ndara qartë (nëse produktet kanë kategori)
- Çdo artikull: emri + përshkrim i shkurtër (nëse kërkohet) + çmimi
- Oferta speciale të theksuara (nëse ka)
- Footer: kontakte placeholder, orari, social media placeholder

RREGULLA:
- Design i pastër si tekst i strukturuar, gati për copy-paste
- Çmimet si numra të rrumbullakuar (nëse origjinali është i çrregullt, thuaje ashtu si është)
- Nëse produkti s'ka çmim, shëno "Sipas kërkesës"
- Në fund shto: "💡 Azhurnoje këtë listë çdo herë që ndryshon çmimet."
- Fol shqip (përveç nëse kërkohet dygjuhëshe/anglisht)`

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

export default function PriceListPage() {
  const { user, profile } = useAuth()
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [format, setFormat] = useState('catalog')
  const [logo, setLogo] = useState('')
  const [slogan, setSlogan] = useState('')
  const [highlight, setHighlight] = useState('')
  const [language, setLanguage] = useState('Shqip')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('category')
      setProducts(data || [])
      setLoadingData(false)
    })()
  }, [])

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const productList = products.map(p => `${p.name}${p.category ? ` (${p.category})` : ''} — ${p.price} Lekë${p.description ? ` — ${p.description}` : ''}`).join('\n')
    const prompt = `Biznesi: ${profile?.business_name || 'Biznesi Im'}
Formati: ${FORMATS.find(f => f.id === format)?.label}
Valuta: Lekë
${logo ? `Slogan/Logo tekst: ${logo}` : ''}
Gjuha: ${language}
${highlight ? `Oferta speciale për theksim: ${highlight}` : ''}

Produktet:
${productList}

Gjenero listën e çmimeve sipas formatit.`
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
      <div className="flex items-center gap-2 mb-6"><Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Lista e Çmimeve</h1></div>
      <div className="card border border-teal-100 bg-teal-50/30">
        <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center animate-pulse"><ListOrdered className="w-5 h-5 text-white"/></div><p className="text-sm font-semibold text-gray-900">Duke krijuar listën...</p></div>
        {streamingText ? <div className="bg-white rounded-xl p-4 border border-teal-100 max-h-64 overflow-y-auto"><pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-teal-500 ml-0.5 animate-pulse"/></pre></div> : <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-teal-500"/>Duke organizuar produktet...</div>}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link><h1 className="font-heading text-xl font-bold text-gray-900">Lista Gati!</h1></div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero</button>
      </div>
      <CopyBlock label="Lista e Çmimeve" text={result}/>
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3"><p className="text-xs text-teal-700 font-medium">💡 Kopjo tekstin dhe formatoje në Canva/Word për print, ose ngjite direkt në faqen tënde web.</p></div>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2"><RotateCcw className="w-4 h-4"/>Gjenero listë të re</Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div><h1 className="font-heading text-xl font-bold text-gray-900">Lista e Çmimeve</h1><p className="text-xs text-gray-400 mt-0.5">Gati për print, faqen web, ose klientët</p></div>
      </div>

      <div className="card text-center py-4">
        <Package className="w-6 h-6 text-teal-300 mx-auto mb-1"/>
        <p className="text-lg font-bold text-gray-900">{products.length} produkte</p>
        <p className="text-xs text-gray-400">do përfshihen në listë</p>
        {products.length === 0 && <Link to="/inventory/products/new" className="text-teal-600 text-xs font-semibold hover:underline mt-1 inline-block">Shto produkte fillimisht →</Link>}
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Formati</label>
          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map(f => <button key={f.id} onClick={() => setFormat(f.id)} className={`px-3 py-2 rounded-xl border-2 text-sm text-left ${format === f.id ? 'border-teal-500 bg-teal-50 font-semibold text-teal-700' : 'border-gray-200 text-gray-600'}`}>{f.label}</button>)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Slogan <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Input value={logo} onChange={e => setLogo(e.target.value)} placeholder="p.sh. Cilësi që besohet që 2015"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Oferta speciale për theksim <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Input value={highlight} onChange={e => setHighlight(e.target.value)} placeholder="p.sh. 2+1 falas te kategoria X"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Gjuha</label>
          <div className="flex gap-2">{LANGUAGES.map(l => <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-1.5 rounded-lg text-xs border-2 ${language === l ? 'border-teal-500 bg-teal-50 font-semibold text-teal-700' : 'border-gray-200 text-gray-500'}`}>{l}</button>)}</div>
        </div>
      </div>

      <Button onClick={generate} disabled={products.length === 0} className="w-full gap-2 bg-teal-600 hover:bg-teal-700" size="lg"><ListOrdered className="w-5 h-5"/>Krijo Listën</Button>
    </div>
  )
}
