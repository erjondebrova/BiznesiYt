import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { ArrowLeft, UserCircle, RefreshCw, Printer, RotateCcw, ArrowRight } from 'lucide-react'

const GENDER_OPTIONS = ['Kryesisht Meshkuj', 'Kryesisht Femra', 'Të dyja barabartë']
const FIND_OPTIONS   = ['Instagram/Facebook', 'Google/Kërkim', 'Gojë-më-gojë', 'TikTok', 'Referime', 'Dyqan fizik']

function PersonaCard({ data }) {
  return (
    <div className="persona-card space-y-5 p-6 bg-white rounded-2xl border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-3xl flex-shrink-0">
          {data.avatar}
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-gray-900">{data.name}</h2>
          <p className="text-sm text-gray-500">{data.role} · {data.age} vjeç · {data.location}</p>
          <p className="text-xs text-gray-400 mt-0.5">{data.income} lekë/muaj · {data.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Goals */}
        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">🎯 Qëllimet</h3>
          <ul className="space-y-1.5">
            {data.goals?.map((g, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-green-500 flex-shrink-0">✓</span>{g}</li>)}
          </ul>
        </div>

        {/* Pain points */}
        <div className="bg-red-50 rounded-xl p-4">
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">😤 Problemet & Frika</h3>
          <ul className="space-y-1.5">
            {data.pains?.map((p, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-red-400 flex-shrink-0">✕</span>{p}</li>)}
          </ul>
        </div>

        {/* Online behavior */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">📱 Sjellja Online</h3>
          <div className="space-y-1.5">
            {data.online?.map((o, i) => <p key={i} className="text-sm text-gray-700">{o}</p>)}
          </div>
        </div>

        {/* Purchase behavior */}
        <div className="bg-amber-50 rounded-xl p-4">
          <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">🛒 Sjellja e Blerjes</h3>
          <div className="space-y-1.5">
            {data.purchase?.map((p, i) => <p key={i} className="text-sm text-gray-700">{p}</p>)}
          </div>
        </div>
      </div>

      {/* Message box */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-4 text-white">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2 text-rose-100">💬 Mesazhi që i Flet</h3>
        <p className="text-sm font-semibold leading-relaxed">"{data.message}"</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {data.keywords?.map((k, i) => (
            <span key={i} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{k}</span>
          ))}
        </div>
      </div>

      {/* Where to find */}
      <div className="bg-indigo-50 rounded-xl p-4">
        <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">📍 Ku e Gjejmë</h3>
        <div className="flex flex-wrap gap-2">
          {data.where?.map((w, i) => (
            <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-medium">{w}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function parsePersona(text) {
  function extract(label) {
    const rx = new RegExp(`${label}[:\\s]*([^\\n]+)`, 'i')
    return text.match(rx)?.[1]?.replace(/\*\*/g, '').trim() || ''
  }
  function extractList(label) {
    const rx = new RegExp(`${label}[^\\n]*\\n((?:[\\s\\S]*?))(?=\\n##|\\n\\*\\*|$)`, 'i')
    const block = text.match(rx)?.[1] || ''
    return block.split('\n')
      .map(l => l.replace(/^[-*•✓✕\d.]+\s*/, '').replace(/\*\*/g, '').trim())
      .filter(l => l.length > 5)
      .slice(0, 5)
  }

  const avatars = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧔', '👱', '👩‍🦱']
  return {
    avatar:   avatars[Math.floor(Math.random() * avatars.length)],
    name:     extract('Emri'),
    role:     extract('Profesion|Punë|Titull'),
    age:      extract('Mosha'),
    location: extract('Vendbanim|Zona|Qyteti'),
    income:   extract('Të ardhura|Income'),
    status:   extract('Statusi familjar|Statusi'),
    goals:    extractList('Qëllimet|Goals|Aspiratat'),
    pains:    extractList('Problem|Frika|Pain|Vështirësi'),
    online:   extractList('Online|Social|Platformat|Sjellja online'),
    purchase: extractList('Blerje|Purchase|Vendim|Proces'),
    message:  extract('Mesazhi|CTA|Flet|Thirrja'),
    keywords: text.match(/fjalët?\s*kyç[^:]*:\s*([^\n]+)/i)?.[1]
                ?.split(/[,;]/).map(k => k.replace(/\*\*/g, '').trim()).filter(Boolean).slice(0, 6) || [],
    where:    extractList('Ku e gjejmë|Ku gjendet|Kanalet'),
  }
}

export default function BuyerPersonaPage() {
  const { profile } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    industry: profile?.industry || '',
    service: '',
    gender: '',
    ageRange: '',
    zone: profile?.city || '',
    problem: '',
    findChannel: [],
    objections: '',
  })
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [rawText, setRawText] = useState(null)
  const [persona, setPersona] = useState(null)

  function update(field, val) { setForm(prev => ({ ...prev, [field]: val })) }
  function toggleChannel(ch) {
    setForm(prev => ({
      ...prev,
      findChannel: prev.findChannel.includes(ch)
        ? prev.findChannel.filter(c => c !== ch)
        : [...prev.findChannel, ch]
    }))
  }

  async function generate() {
    setLoading(true)
    setStreamingText('')
    setRawText(null)
    setPersona(null)

    const prompt = `Krijo një Buyer Persona të detajuar dhe realiste për biznesin e mëposhtëm.

BIZNESI: ${profile?.business_name || 'biznesi ynë'} (${form.industry || profile?.industry || ''})
PRODUKTI/SHËRBIMI: ${form.service}
GJINIA E KLIENTËVE: ${form.gender || 'të dyja'}
MOSHA: ${form.ageRange || 'e panjohur'}
ZONA: ${form.zone || profile?.city || 'Shqipëri'}
PROBLEMI QE ZGJIDH: ${form.problem}
KU GJEJNË KLIENTËT: ${form.findChannel.join(', ') || 'mënyra të ndryshme'}
KUNDËRSHTIMET PARA BLERJES: ${form.objections || 'të panjohura'}

Shkruaj profilin SAKTËSISHT në këtë format:

## IDENTITETI
Emri: [Emër shqiptar mashkull ose femër sipas gjinisë]
Profesioni: [Titull pune real]
Mosha: [Numër specifik brenda rangut]
Vendbanimi: [Lagje/zonë specifike]
Të ardhurat mujore: [Shifër specifike në lekë]
Statusi familjar: [Specifik]

## QËLLIMET DHE ASPIRATAT
- [Qëllim 1 — shumë specifik]
- [Qëllim 2]
- [Qëllim 3]
- [Qëllim 4]

## PROBLEMET DHE FRIKA
- [Problem 1 — direkt lidhur me produktin]
- [Problem 2]
- [Problem 3]
- [Problem 4]
- [Frika kryesore para blerjes]

## SJELLJA ONLINE
- Platformat: [specifike]
- Çfarë ndjek: [llojet e përmbajtjes]
- Kur është aktiv: [oraret]
- Si bën kërkim: [si e gjen informacionin]

## PROCESI I BLERJES
- Si zbulon produktet: [specifik]
- Çfarë e bind: [faktorët vendimtar]
- Çfarë e ndalon: [pengesat dhe dyshimet]
- Koha e vendimit: [sa shpejt vendos]

## MESAZHI QË I FLET
Mesazhi: [Frazë e shkurtër bindëse, max 15 fjalë, që rezonon me këtë person]
Fjalët kyçe: [fjala1, fjala2, fjala3, fjala4, fjala5]

## KU E GJEJMË
- [Vendi 1 — specifik]
- [Vendi 2]
- [Vendi 3]
- [Vendi 4]

Fol shqip, ji shumë specifik dhe real — jo gjenerik. Bazoju te konteksti shqiptar.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i psikologjisë së konsumatorit dhe marketingut për tregun shqiptar. Krijo persona reale, specifike dhe të zbatueshme. Fol shqip gjithmonë.',
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
        setRawText(fullText)
        setPersona(parsePersona(fullText))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  function handlePrint() { window.print() }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Buyer Persona</h1>
        </div>
        <div className="card border border-rose-100 bg-rose-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center animate-pulse">
              <UserCircle className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke ndërtuar profilin...</p>
              <p className="text-xs text-gray-400">Demografikat, motivimet, sjellja, mesazhet</p>
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

  if (persona) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
        <div className="flex items-center justify-between no-print flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <h1 className="font-heading text-xl font-bold text-gray-900">Klienti Ideal</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setPersona(null); setStep(1) }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
              <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
            </button>
            <Button onClick={handlePrint} size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700">
              <Printer className="w-4 h-4"/>Printo / PDF
            </Button>
          </div>
        </div>

        <PersonaCard data={persona} />

        <div className="grid grid-cols-3 gap-3 no-print">
          {[
            { label: 'Reklamat', href: '/marketing/ads', color: 'text-violet-600', desc: 'Targetim sipas personës' },
            { label: 'Përmbajtje', href: '/marketing/content', color: 'text-blue-600', desc: 'Postime të personalizuara' },
            { label: 'Email', href: '/marketing/email', color: 'text-teal-600', desc: 'Email për këtë person' },
          ].map(item => (
            <Link key={item.href} to={item.href}
              className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-gray-100 transition-colors">
              <div className={`text-xs font-bold ${item.color} mb-0.5`}>{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
              <ArrowRight className={`w-3.5 h-3.5 ${item.color} mt-1`}/>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Klienti Ideal — Buyer Persona</h1>
          <p className="text-xs text-gray-400 mt-0.5">Plotëso pyetjet — AI krijon kartën e klientit tënd ideal</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Çfarë shesësh / ofron? <span className="text-red-400">*</span></label>
          <Textarea value={form.service} onChange={e => update('service', e.target.value)}
            placeholder="p.sh. Shërbim pastrimi shtëpie — 2 herë në javë, 3,500 lekë/seancë" rows={2}/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Kush blen më shumë?</label>
            <div className="space-y-1.5">
              {GENDER_OPTIONS.map(g => (
                <button key={g} onClick={() => update('gender', g)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${form.gender === g ? 'border-rose-400 bg-rose-50 text-rose-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Mosha e tyre</label>
            <div className="space-y-1.5">
              {['18-25 vjeç', '25-35 vjeç', '35-50 vjeç', '50+ vjeç'].map(a => (
                <button key={a} onClick={() => update('ageRange', a)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${form.ageRange === a ? 'border-rose-400 bg-rose-50 text-rose-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Çfarë problemi zgjidh për ta? <span className="text-red-400">*</span></label>
          <Textarea value={form.problem} onChange={e => update('problem', e.target.value)}
            placeholder="p.sh. Nuk kanë kohë për pastrim, fëmijë të vegjël, punojnë me orar të plotë..." rows={2}/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Si të gjejnë klientët? <span className="text-gray-400 font-normal text-xs">(zgjidh të gjitha)</span></label>
          <div className="flex flex-wrap gap-2">
            {FIND_OPTIONS.map(ch => (
              <button key={ch} onClick={() => toggleChannel(ch)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${form.findChannel.includes(ch) ? 'border-rose-400 bg-rose-50 text-rose-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Kundërshtimet para blerjes <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Textarea value={form.objections} onChange={e => update('objections', e.target.value)}
            placeholder="p.sh. Çmimi duket i lartë, nuk besojnë cilësinë, kanë pasur përvoja të këqija..." rows={2}/>
        </div>
      </div>

      <Button onClick={generate} disabled={!form.service.trim() || !form.problem.trim()}
        className="w-full gap-2 bg-rose-600 hover:bg-rose-700" size="lg">
        <UserCircle className="w-5 h-5"/>Krijo Buyer Persona
      </Button>
    </div>
  )
}
