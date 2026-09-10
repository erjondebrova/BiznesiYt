import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, UserCircle, RefreshCw, Copy, Check, RotateCcw, ArrowRight } from 'lucide-react'

const FOCUSES = [
  { id: 'general',  label: '🎯 Persona e Përgjithshme', desc: 'Profil i plotë i klientit ideal' },
  { id: 'social',   label: '📱 Social Media',            desc: 'Ku e gjen online, çfarë ndjek' },
  { id: 'purchase', label: '🛒 Vendimi i Blerjes',        desc: 'Si vendos, çfarë e ndalon' },
  { id: 'pain',     label: '😤 Problemet & Frika',       desc: 'Pikat e dhimbjes dhe nevojat' },
]

function PersonaResult({ result, onReset }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Profili i Klientit Ideal</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo</>}
          </button>
          <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
          </button>
        </div>
      </div>

      <div className="card border border-rose-100 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
        {result}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Reklamat Dixhitale', desc: 'Targetim sipas personës', href: '/marketing/ads', color: 'text-violet-600' },
          { label: 'Krijues Përmbajtjesh', desc: 'Postime për personën tënde', href: '/marketing/content', color: 'text-blue-600' },
          { label: 'Email Marketing', desc: 'Email i personalizuar', href: '/marketing/email', color: 'text-teal-600' },
        ].map(item => (
          <Link key={item.href} to={item.href} className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-gray-100 transition-colors">
            <div className={`text-xs font-bold ${item.color} mb-0.5`}>{item.label}</div>
            <div className="text-xs text-gray-500">{item.desc}</div>
            <ArrowRight className={`w-3.5 h-3.5 ${item.color} mt-1`}/>
          </Link>
        ))}
      </div>

      <Button variant="outline" onClick={onReset} className="w-full gap-2">
        <RotateCcw className="w-4 h-4"/>Gjenero persona të re
      </Button>
    </div>
  )
}

export default function BuyerPersonaPage() {
  const { profile } = useAuth()
  const [focus, setFocus] = useState('general')
  const [description, setDescription] = useState('')
  const [existing, setExisting] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult] = useState(null)

  async function generate() {
    setLoading(true)
    setStreamingText('')
    setResult(null)

    const focusLabel = FOCUSES.find(f => f.id === focus)?.label || ''

    const prompt = `Krijo profilin e Klientit Ideal (Buyer Persona) për biznesin:

Biznesi: ${profile?.business_name || 'biznesi ynë'}
Industria: ${profile?.industry || ''}
Qyteti: ${profile?.city || 'Shqipëri'}
Fokusi: ${focusLabel}
${description ? `Përshkrim shtesë: ${description}` : ''}
${existing ? `Klientë ekzistues: ${existing}` : ''}

Shkruaj SAKTËSISHT sipas kësaj strukture:

## 👤 PROFILI DEMOGRAFIK
Emri i personës: [Emër shqiptar]
Mosha: [Rangë moshe]
Gjinia: [Mashkull / Femër / të dyja]
Vendbanimi: [Qytet + zonat)
Profesioni: [Titull pune]
Arsimi: [Niveli]
Të ardhurat mujore: [Rangë në lekë]
Statusi familjar: [Beqar/Martuar/me fëmijë]

## 🎯 QËLLIMET & ASPIRATAT
[3-4 pika — çfarë dëshiron të arrijë ky person]

## 😤 PROBLEMET & FRIKA
[4-5 pika — dhimbjet kryesore, frika, pengesa]

## 📱 SJELLJA ONLINE
Platformat: [Ku kalon kohë]
Çfarë ndjek: [Llojet e përmbajtjes]
Kur është aktiv: [Oraret]
Si bën kërkim: [Google, Instagram, etj.]

## 🛒 PROCESI I BLERJES
Si zbulon produktet/shërbimet: [...]
Çfarë e bind: [Prova sociale, çmimi, cilësia, etj.]
Çfarë e ndalon: [Dyshimet, frika]
Koha e vendimit: [Shpejtë / E menduar / Kërkon opinione]

## 💬 MESAZHI QË I FLET
Fjalët kyçe që rezonojnë: [5-6 fjalë/fraza]
Toni i komunikimit: [...]
CTA që funksionon: [...]

## 📍 KU E GJEJMË
[Kanalet dhe vendet konkrete ku gjejmë këtë person]

Fol shqip, ji shumë specifik për ${profile?.industry || 'industrinë'} dhe ${profile?.city || 'Shqipërinë'}.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert marketing dhe psikologji konsumatori për tregun shqiptar. Krijo persona realiste dhe të zbatueshme. Fol shqip gjithmonë.',
        }),
      })
      if (res.ok) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ''
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
              if (delta) { fullText += delta; setStreamingText(fullText) }
            } catch {}
          }
        }
        setResult(fullText.trim())
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analizë Klientit Ideal</h1>
        </div>
        <div className="card border border-rose-100 bg-rose-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center animate-pulse">
              <UserCircle className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke ndërtuar profilin...</p>
              <p className="text-xs text-gray-400">Demografikat, sjellja, motivimet</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-rose-100 max-h-[50vh] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-rose-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-rose-500"/>Duke analizuar...</div>
          )}
        </div>
      </div>
    )
  }

  if (result) return <PersonaResult result={result} onReset={() => setResult(null)} />

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analizë Klientit Ideal</h1>
          <p className="text-xs text-gray-400 mt-0.5">Buyer Persona — profil i strukturuar i klientit tënd</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Fokusi i Analizës</label>
        <div className="grid grid-cols-2 gap-2">
          {FOCUSES.map(f => (
            <button key={f.id} onClick={() => setFocus(f.id)}
              className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${focus === f.id ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-sm font-semibold text-gray-900">{f.label}</span>
              <span className="text-xs text-gray-400">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Çfarë shesësh / ofron? <span className="text-gray-400 font-normal">(opsionale)</span></label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="p.sh. Shërbim pastrimi shtëpie, 2x në javë, 3,500 lekë/seancë, zona Tiranë..."
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Klientët ekzistues <span className="text-gray-400 font-normal">(opsionale)</span></label>
          <Textarea
            value={existing}
            onChange={e => setExisting(e.target.value)}
            placeholder="p.sh. Kryesisht gra 30-50 vjeç, familje me 2+ fëmijë, zona Bllok dhe Kombinat..."
            rows={2}
          />
        </div>
      </div>

      <Button onClick={generate} className="w-full gap-2 bg-rose-600 hover:bg-rose-700" size="lg">
        <UserCircle className="w-5 h-5"/>Krijo Buyer Persona
      </Button>
    </div>
  )
}
