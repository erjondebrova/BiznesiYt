import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, FileText, Wand2, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

function parseSection(text, header) {
  const match = text.match(new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`))
  return match ? match[1].trim() : ''
}

const SECTIONS = [
  'TITULLI I POZICIONIT',
  'RRETH KOMPANISË',
  'DETYRAT DHE PËRGJEGJËSITË',
  'KUALIFIKIMET E KËRKUARA',
  'ÇKA OFROJMË',
  'SI TË APLIKONI',
]

export default function JobDescriptionPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({
    title: '',
    department: '',
    contractType: 'kohë e plotë',
    level: 'mid',
    duties: '',
    skills: '',
    benefits: '',
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function update(field, val) { setForm(p => ({ ...p, [field]: val })) }

  async function generate() {
    if (!form.title || !form.duties) return
    setLoading(true); setResult('')
    const levelMap = { junior: 'Junior (0–2 vjet eksperiencë)', mid: 'Mesëm (2–5 vjet eksperiencë)', senior: 'Senior (5+ vjet eksperiencë)' }
    const prompt = `Gjenero një përshkrim profesional dhe tërheqës pozicioni për një biznes shqiptar.

Biznesi: ${profile?.business_name || 'Kompania jonë'}${profile?.industry ? ` — ${profile.industry}` : ''}
Titulli i pozicionit: ${form.title}
${form.department ? `Departamenti: ${form.department}` : ''}
Lloji i kontratës: ${form.contractType}
Niveli: ${levelMap[form.level]}

Detyrat kryesore:
${form.duties}

Aftësitë e kërkuara:
${form.skills || 'Sipas pozicionit'}

${form.benefits ? `Çfarë ofrojmë:\n${form.benefits}` : ''}

Gjenero një përshkrim të plotë duke u ndarë SAKTËSISHT në këto seksione:
## TITULLI I POZICIONIT
## RRETH KOMPANISË
## DETYRAT DHE PËRGJEGJËSITË
## KUALIFIKIMET E KËRKUARA
## ÇKA OFROJMË
## SI TË APLIKONI

Shkruaj në shqip, profesionalisht dhe me gjuhë tërheqëse që motivon kandidatët e duhur.`

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

  const sections = SECTIONS.map(s => ({ title: s, content: parseSection(result, s) })).filter(s => s.content)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <Link to="/hr" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4"/> HR & Ekipi
      </Link>

      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5"/>
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Krijues Pozicionesh</h1>
            <p className="text-teal-100 text-sm">Gjenero përshkrime profesionale pozicioni me AI</p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Label>Titulli i Pozicionit *</Label>
            <Input value={form.title} onChange={e => update('title', e.target.value)} className="mt-1" placeholder="p.sh. Menaxher Shitjesh"/>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Departamenti</Label>
            <Input value={form.department} onChange={e => update('department', e.target.value)} className="mt-1" placeholder="p.sh. Shitje & Marketing"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Lloji i Kontratës</Label>
            <Select value={form.contractType} onValueChange={v => update('contractType', v)}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                {['kohë e plotë','kohë e pjesshme','kontratë shërbimi','periudhë prove','afat i caktuar'].map(v =>
                  <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Niveli</Label>
            <Select value={form.level} onValueChange={v => update('level', v)}>
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
          <Label>Detyrat Kryesore *</Label>
          <Textarea value={form.duties} onChange={e => update('duties', e.target.value)} rows={4} className="mt-1"
            placeholder="Çfarë do të bëjë ky punonjës çdo ditë? Listoni detyrat kryesore..."/>
        </div>
        <div>
          <Label>Aftësitë e Kërkuara</Label>
          <Textarea value={form.skills} onChange={e => update('skills', e.target.value)} rows={3} className="mt-1"
            placeholder="Aftësi teknike, certifikata, gjuhë, softuerë specifik..."/>
        </div>
        <div>
          <Label>Çfarë Ofron Kompania <span className="text-gray-400 font-normal">(opsionale)</span></Label>
          <Textarea value={form.benefits} onChange={e => update('benefits', e.target.value)} rows={2} className="mt-1"
            placeholder="Pagë konkurruese, siguracion, orë fleksible, mundësi zhvillimi..."/>
        </div>
        <Button onClick={generate} disabled={loading || !form.title || !form.duties} className="w-full gap-2 h-11">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Duke gjeneruar...</> : <><Wand2 className="w-4 h-4"/>Gjenero Përshkrimin</>}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-gray-900">Përshkrimi i Pozicionit</h3>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo të gjitha</>}
            </button>
          </div>
          {sections.length > 0 ? sections.map(s => (
            <div key={s.title} className="card">
              <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">{s.title}</h4>
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
