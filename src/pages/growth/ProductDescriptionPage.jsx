import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, Package, RefreshCw, RotateCcw, Copy, Check } from 'lucide-react'

const BUSINESS_TYPES = [
  { id: 'ecommerce',    label: '🛒 Dyqan Online / E-commerce' },
  { id: 'restaurant',   label: '🍽️ Restorant / Bar / Kafene'  },
  { id: 'beauty',       label: '💆 Salon Bukurie / Spa'        },
  { id: 'professional', label: '💼 Shërbime Profesionale'      },
  { id: 'other',        label: '📦 Tjetër'                     },
]

const PRODUCT_COUNTS = [
  { id: 'one',   label: '1 produkt', desc: 'Përshkrim i detajuar' },
  { id: 'few',   label: '3-5 produkte', desc: 'Mesatare, gati për web' },
  { id: 'many',  label: '5+ produkte', desc: 'Format i shpejtë, katalog' },
]

const CHANNELS = [
  { id: 'web',      label: '🌐 Faqe web / dyqan online' },
  { id: 'social',   label: '📱 Instagram / Facebook'    },
  { id: 'menu',     label: '📋 Menu fizike / restorant' },
  { id: 'catalog',  label: '📄 Katalog i printuar / PDF' },
]

const TONES = [
  { id: 'professional', label: '👔 Profesional & besueshmëri' },
  { id: 'friendly',     label: '😊 Miqësor & i ngrohtë'       },
  { id: 'luxury',       label: '💎 Luksoz & eksklusiv'         },
  { id: 'energetic',    label: '⚡ Rinor & energjik'           },
]

const SYSTEM_PROMPT = `Ti je një copywriter profesionist i specializuar për biznese të vogla shqiptare. Shkruaj përshkrime produktesh/shërbimesh tërheqëse, bindëse, dhe gati për publikim.

Të gjitha të dhënat janë dhënë. Gjenero direkt përshkrimet sipas formatit:

PËR DYQAN ONLINE / E-COMMERCE: 📌 Titulli i optimizuar · 📝 Përshkrim i shkurtër (2-3 fjali) · 📄 Përshkrim i plotë (1 paragraf) · ✅ 4-5 pika benefitesh · 🏷️ Tag-e sugjeruara

PËR RESTORANT / MENU: 🍽️ Emri + 📝 Përshkrim shqisor (2-3 fjali — shijo shijet/aromat) · 🏷️ Tag-e (🌿Vegjetarian, 🌶️Pikant, ⭐Rekomandim, 🏆Bestseller) · Sugjerim çmimi

PËR SALON BUKURIE / SPA: 📌 Emri · 📝 Përshkrim (çfarë bën + si ndihesh pas) · ⏱️ Kohëzgjatja · 💆 Hapat · 💰 Çmimi

PËR SHËRBIME PROFESIONALE: 📌 Emri · 📝 Çfarë bën + rezultati · 👤 Për kë · ⏱️ Kohëzgjatja/Çfarë përfshin · ✨ Pse ne (1 fjali diferencuese)

RREGULLA ABSOLUTE:
- Shqip natyral — jo si përkthim nga anglishtja
- Benefite para karakteristikash (jo "përmban X" por "merr Y")
- Mos përdor "revolucionar", "i pashoq", "më i miri në botë"
- Çdo përshkrim me CTA të butë (provoje, porosit, rezervo)
- Përshtat gjatësinë sipas kanalit të zgjedhur
- Nëse mungojnë detaje, bëj supozime realiste dhe shëno [Plotëso]`

function buildPrompt({ businessName, businessType, productCount, products, channels, tone }) {
  const typeLabel = BUSINESS_TYPES.find(t => t.id === businessType)?.label || businessType
  const channelLabels = channels.map(c => CHANNELS.find(ch => ch.id === c)?.label || c).join(', ')
  const toneLabel = TONES.find(t => t.id === tone)?.label || tone
  return `Biznesi: ${businessName}
Lloji i biznesit: ${typeLabel}
Numri i produkteve: ${PRODUCT_COUNTS.find(p => p.id === productCount)?.label}
Kanali i publikimit: ${channelLabels}
Toni: ${toneLabel}

Produktet/Shërbimet:
${products}

Shkruaj përshkrimet sipas formatit të përshtatshëm për llojin e biznesit.`
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

export default function ProductDescriptionPage() {
  const { profile } = useAuth()
  const [businessType, setBusinessType] = useState('ecommerce')
  const [productCount, setProductCount] = useState('few')
  const [products, setProducts]         = useState('')
  const [channels, setChannels]         = useState(['web'])
  const [tone, setTone]                 = useState('friendly')
  const [loading, setLoading]           = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult]             = useState(null)

  const businessName = profile?.business_name || 'Biznesi Im'

  function toggleChannel(id) {
    setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function generate() {
    if (!products.trim()) return
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = buildPrompt({ businessName, businessType, productCount, products, channels, tone })
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
        <h1 className="font-heading text-xl font-bold text-gray-900">Përshkrim Produkti</h1>
      </div>
      <div className="card border border-teal-100 bg-teal-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center animate-pulse">
            <Package className="w-5 h-5 text-white"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Duke shkruar përshkrimet...</p>
            <p className="text-xs text-gray-400">Tituj, benefite, tag-e, CTA</p>
          </div>
        </div>
        {streamingText ? (
          <div className="bg-white rounded-xl p-4 border border-teal-100 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-teal-500 ml-0.5 animate-pulse"/></pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-500"/>Duke analizuar produktet...
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
            <h1 className="font-heading text-xl font-bold text-gray-900">Përshkrimet Gati!</h1>
            <p className="text-xs text-gray-400">{businessName}</p>
          </div>
        </div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
        </button>
      </div>
      <CopyBlock label="Të gjitha përshkrimet" text={result}/>
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
        <p className="text-xs text-teal-700 font-medium">💡 Kopjo përshkrimet dhe ngarko direkt në platformën tënde. Zëvendëso [Plotëso] me detaje reale.</p>
      </div>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2">
        <RotateCcw className="w-4 h-4"/>Gjenero përshkrime të reja
      </Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Përshkrim Produkti / Katalogu</h1>
          <p className="text-xs text-gray-400 mt-0.5">Përshkrime tërheqëse gati për publikim</p>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center gap-3">
        <Package className="w-4 h-4 text-teal-500 flex-shrink-0"/>
        <p className="text-xs text-teal-700">Krijohet për: <strong>{businessName}</strong></p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Lloji i biznesit</label>
          <div className="space-y-2">
            {BUSINESS_TYPES.map(t => (
              <button key={t.id} onClick={() => setBusinessType(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm text-left transition-all ${businessType === t.id ? 'border-teal-500 bg-teal-50 font-semibold text-teal-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Sa produkte / shërbime?</label>
          <div className="grid grid-cols-3 gap-2">
            {PRODUCT_COUNTS.map(p => (
              <button key={p.id} onClick={() => setProductCount(p.id)}
                className={`flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-xl border-2 text-center transition-all ${productCount === p.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="text-sm font-semibold text-gray-800">{p.label}</span>
                <span className="text-xs text-gray-400">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Produktet / shërbimet <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">Emri + 2-3 karakteristika (çmimi opsional)</p>
          <Textarea value={products} onChange={e => setProducts(e.target.value)} rows={5}
            placeholder="p.sh.&#10;Kafe espresso — kafo italiane, intensitet i fortë, 100 lekë&#10;Cappuccino — me qumësht me avull, kafe + lëngje qumështi, 150 lekë&#10;Cheesecake — bërë në shtëpi, me luleshtrydhe, 350 lekë"/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Ku do publikohet?</label>
          <div className="grid grid-cols-2 gap-2">
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => toggleChannel(c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm text-left transition-all ${channels.includes(c.id) ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Toni</label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(t => (
              <button key={t.id} onClick={() => setTone(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm text-left transition-all ${tone === t.id ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={!products.trim()} className="w-full gap-2 bg-teal-600 hover:bg-teal-700" size="lg">
        <Package className="w-5 h-5"/>Shkruaj Përshkrimet
      </Button>
    </div>
  )
}
