import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, BookOpen, Wand2, Copy, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

function parseSection(text, header) {
  const match = text.match(new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`))
  return match ? match[1].trim() : ''
}

const WEEK_SECTIONS = [
  { key: 'JAVA E PARË',            label: 'Java 1',     days: 'Ditët 1–7',   color: 'from-teal-400 to-cyan-500',    bg: 'bg-teal-50',   border: 'border-teal-100',   text: 'text-teal-700' },
  { key: 'JAVA E DYTË',            label: 'Java 2',     days: 'Ditët 8–14',  color: 'from-blue-400 to-indigo-500',  bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700' },
  { key: 'JAVA E TRETË DHE KATËRT',label: 'Java 3–4',   days: 'Ditët 15–30', color: 'from-purple-400 to-violet-500',bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700' },
  { key: 'OBJEKTIVAT 3-MUJORE',    label: 'Muajt 2–3',  days: '30–90 ditë',  color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700' },
  { key: 'CHECKLIST',              label: 'Checklist',  days: '',            color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50',border: 'border-emerald-100',text: 'text-emerald-700' },
]

function WeekCard({ section, content }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`rounded-2xl border ${section.border} overflow-hidden`}>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-3.5 ${section.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
            <span className="text-white text-[10px] font-bold">{section.label.slice(0,2)}</span>
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${section.text}`}>{section.label}</p>
            {section.days && <p className="text-xs text-gray-400">{section.days}</p>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
      </button>
      {open && (
        <div className="px-5 py-4 bg-white">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  )
}

export default function OnboardingPlanPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ name: '', role: '', department: '', priorKnowledge: 'asnjë' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function update(field, val) { setForm(p => ({ ...p, [field]: val })) }

  async function generate() {
    if (!form.name || !form.role) return
    setLoading(true); setResult('')
    const prompt = `Krijo një plan orientimi 30-ditor të detajuar për punonjësin e ri.

Biznesi: ${profile?.business_name || 'Kompania jonë'}${profile?.industry ? ` — ${profile.industry}` : ''}
Emri i punonjësit: ${form.name}
Roli / Pozicioni: ${form.role}
${form.department ? `Departamenti: ${form.department}` : ''}
Njohuri paraprake për sektorin: ${form.priorKnowledge}

Gjenero planin e ndarë SAKTËSISHT në këto seksione:

## JAVA E PARË
(Ditët 1-7: takime prezantuese, orientim fizik, sistemet bazë, njohja me ekipin. Listoni aktivitete specifike çdo ditë.)

## JAVA E DYTË
(Ditët 8-14: zhytje në detyrat e rolit, hije të kolegëve, trajnim produktesh/shërbimesh. Aktivitete ditore specifike.)

## JAVA E TRETË DHE KATËRT
(Ditët 15-30: autonomi e shtuar, detyra të pavarura, takime 1:1 me menaxherin, feedback i ndërmjetëm.)

## OBJEKTIVAT 3-MUJORE
(4-5 objektiva konkretë dhe të matshëm për muajt 2-3. Secili me kriterin e suksesit.)

## CHECKLIST
(Lista kompakte e gjithçkaje që duhet bërë në 30 ditët e para — sisteme, akses, takime, trajnime, dokumenta.)

Shkruaj praktikisht, me detyra konkrete dhe të zbatueshme. Shqip.`

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

  const sections = WEEK_SECTIONS.map(s => ({ ...s, content: parseSection(result, s.key) })).filter(s => s.content)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <Link to="/hr" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4"/> HR & Ekipi
      </Link>

      <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5"/>
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Plan Orientimi</h1>
            <p className="text-purple-100 text-sm">Plan 30-ditor i personalizuar për punonjësin e ri</p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Label>Emri i Punonjësit *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} className="mt-1" placeholder="p.sh. Ardit Krasniqi"/>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Roli / Pozicioni *</Label>
            <Input value={form.role} onChange={e => update('role', e.target.value)} className="mt-1" placeholder="p.sh. Asistent Kontabiliteti"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Departamenti</Label>
            <Input value={form.department} onChange={e => update('department', e.target.value)} className="mt-1" placeholder="p.sh. Financa"/>
          </div>
          <div>
            <Label>Njohuri Paraprake</Label>
            <Select value={form.priorKnowledge} onValueChange={v => update('priorKnowledge', v)}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="asnjë">Asnjë / Fillestare</SelectItem>
                <SelectItem value="bazë">Bazë</SelectItem>
                <SelectItem value="të mira">Të mira</SelectItem>
                <SelectItem value="shumë të mira">Shumë të mira / Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={generate} disabled={loading || !form.name || !form.role} className="w-full gap-2 h-11">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Duke gjeneruar...</> : <><Wand2 className="w-4 h-4"/>Krijo Planin 30-Ditor</>}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-gray-900">Plani i Orientimit — {form.name}</h3>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo</>}
            </button>
          </div>
          {sections.length > 0
            ? sections.map(s => <WeekCard key={s.key} section={s} content={s.content}/>)
            : <div className="card"><p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p></div>
          }
        </div>
      )}
    </div>
  )
}
