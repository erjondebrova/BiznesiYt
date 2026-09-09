import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, MessageSquare, Wand2, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const FOCUS_AREAS = [
  'Aftësi teknike', 'Punë ekipore', 'Udhëheqje', 'Komunikim',
  'Zgjidhje problemesh', 'Menaxhim kohe', 'Shitje', 'Shërbim klienti',
  'Kreativitet', 'Ndryshim & presion',
]

const CATEGORIES = ['PYETJE TEKNIKE', 'PYETJE SJELLORE', 'PYETJE SITUATASH', 'PYETJE PËR KANDIDATIN']

function parseSection(text, header) {
  const match = text.match(new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`))
  return match ? match[1].trim() : ''
}

const CATEGORY_COLORS = {
  'PYETJE TEKNIKE':        { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100' },
  'PYETJE SJELLORE':       { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-100' },
  'PYETJE SITUATASH':      { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100' },
  'PYETJE PËR KANDIDATIN': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
}

export default function InterviewQuestionsPage() {
  const { profile } = useAuth()
  const [role, setRole] = useState('')
  const [level, setLevel] = useState('mid')
  const [areas, setAreas] = useState([])
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function toggleArea(a) {
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  async function generate() {
    if (!role) return
    setLoading(true); setResult('')
    const levelMap = { junior: 'Junior (0–2 vjet)', mid: 'Mesëm (2–5 vjet)', senior: 'Senior (5+ vjet)' }
    const prompt = `Gjenero pyetje interviste profesionale për pozicionin: ${role}
Industria: ${profile?.industry || 'e përgjithshme'}
Niveli: ${levelMap[level]}
${areas.length > 0 ? `Fushat prioritare: ${areas.join(', ')}` : ''}

Gjenero 20 pyetje të ndara SAKTËSISHT në këto 4 seksione:

## PYETJE TEKNIKE
(5 pyetje specifike për rolin dhe kompetencat teknike. Pas çdo pyetjeje shkruaj: 💡 *Pse e bëjmë: [arsyetimi i shkurtër]*)

## PYETJE SJELLORE
(5 pyetje STAR method — situatë, detyrë, veprim, rezultat. Pas çdo pyetjeje shkruaj: 💡 *Çfarë vlerësojmë: [arsyetimi]*)

## PYETJE SITUATASH
(5 skenarë hipotetikë konkretë për rolin. Pas çdo pyetjeje shkruaj: 💡 *Çfarë vlerësojmë: [arsyetimi]*)

## PYETJE PËR KANDIDATIN
(5 pyetje inteligjente që kandidati mund t'i bëjë kompanisë — tregon motivimin dhe seriozitetin e tyre)

Shkruaj në shqip, qartë dhe konkretisht.`

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }) })
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ')) { try { const d = JSON.parse(line.slice(6)); if (d.content) { full += d.content; setResult(full) } } catch {} }
        }
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  function copy() { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const sections = CATEGORIES.map(c => ({ title: c, content: parseSection(result, c), style: CATEGORY_COLORS[c] })).filter(s => s.content)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <Link to="/hr" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4"/> HR & Ekipi
      </Link>

      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5"/>
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Pyetje Interviste</h1>
            <p className="text-blue-100 text-sm">Teknike, sjellore dhe situatash — personalizuar me AI</p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Label>Pozicioni / Roli *</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} className="mt-1" placeholder="p.sh. Kontabilist, Shitës, Programues..."/>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Niveli</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior (0–2 vjet)</SelectItem>
                <SelectItem value="mid">Mesëm (2–5 vjet)</SelectItem>
                <SelectItem value="senior">Senior (5+ vjet)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Fushat Prioritare <span className="text-gray-400 font-normal">(opsionale — zgjidhni deri 3)</span></Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {FOCUS_AREAS.map(a => (
              <button key={a} onClick={() => toggleArea(a)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${areas.includes(a) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={loading || !role} className="w-full gap-2 h-11">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Duke gjeneruar...</> : <><Wand2 className="w-4 h-4"/>Gjenero 20 Pyetje</>}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-gray-900">Pyetjet e Intervistës</h3>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo</>}
            </button>
          </div>
          {sections.length > 0 ? sections.map(s => (
            <div key={s.title} className={`rounded-2xl border p-5 ${s.style.bg} ${s.style.border}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${s.style.text}`}>{s.title}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</p>
            </div>
          )) : (
            <div className="card">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
