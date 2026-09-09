import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, FileText, Sparkles, RefreshCw, Copy, Check } from 'lucide-react'

const CONTRACT_TYPES = ['Kohë e plotë', 'Kohë e pjesshme', 'Me afat të caktuar', 'Freelance / Konsulent', 'Praktikë']
const LEVELS = ['Juniori (0-2 vite)', 'Mesatar (2-5 vite)', 'Senior (5+ vite)', 'Manager / Drejtues', 'Drejtor / C-Level']
const SECTIONS = [
  { key: 'TITULLI DHE HYRJA', color: 'border-teal-200 bg-teal-50', label: 'Titulli & Hyrja' },
  { key: 'RRETH KOMPANISË', color: 'border-cyan-200 bg-cyan-50', label: 'Rreth Kompanisë' },
  { key: 'DETYRAT DHE PËRGJEGJËSITË', color: 'border-sky-200 bg-sky-50', label: 'Detyrat & Përgjegjësitë' },
  { key: 'KUALIFIKIMET E KËRKUARA', color: 'border-blue-200 bg-blue-50', label: 'Kualifikimet e Kërkuara' },
  { key: 'ÇKA OFROJMË', color: 'border-indigo-200 bg-indigo-50', label: 'Çka Ofrojmë' },
  { key: 'SI TË APLIKONI', color: 'border-violet-200 bg-violet-50', label: 'Si të Aplikoni' },
]

function parseSection(text, header) {
  const regex = new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`, 'i')
  const m = text.match(regex)
  return m ? m[1].trim() : ''
}

export default function JobDescriptionPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ title: '', dept: '', contract: '', level: '', duties: '', skills: '', benefits: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [streaming, setStreaming] = useState('')
  const [copied, setCopied] = useState(false)

  function upd(f, v) { setForm(p => ({ ...p, [f]: v })) }

  async function generate() {
    if (!form.title.trim()) return
    setLoading(true); setResult(''); setStreaming('')

    const prompt = `Gjenero një përshkrim profesional pozicioni pune për:
Biznesi: ${profile?.business_name || 'kompania jonë'} (${profile?.industry || ''}) — ${profile?.city || 'Shqipëri'}
Pozicioni: ${form.title}${form.dept ? ` — Departamenti: ${form.dept}` : ''}
Lloji i kontratës: ${form.contract || 'Kohë e plotë'}
Niveli: ${form.level || 'Mesatar'}
${form.duties ? `Detyrat kryesore: ${form.duties}` : ''}
${form.skills ? `Kualifikimet e dëshiruara: ${form.skills}` : ''}
${form.benefits ? `Përfitimet: ${form.benefits}` : ''}

Struktura e kërkuar (përdor këto tituj seksionesh SAKTËSISHT):
## TITULLI DHE HYRJA
## RRETH KOMPANISË
## DETYRAT DHE PËRGJEGJËSITË
## KUALIFIKIMET E KËRKUARA
## ÇKA OFROJMË
## SI TË APLIKONI

Shkruaj shqip. Ji profesional, tërheqës dhe i qartë. Çdo seksion duhet të jetë i plotë dhe të kishte kuptim i veçuar.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i HR dhe rekrutimit për biznese shqiptare. Gjenero përshkrime punë profesionale dhe tërheqëse. Fol shqip.',
        }),
      })
      if (!res.ok) return
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
            const p = JSON.parse(data)
            const delta = p.delta?.text || p.choices?.[0]?.delta?.content || ''
            if (delta) { full += delta; setStreaming(full) }
          } catch {}
        }
      }
      setResult(full)
    } catch (e) { console.error(e) }
    finally { setLoading(false); setStreaming('') }
  }

  function copyAll() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayText = result || streaming

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <Link to="/hr" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> HR & Ekipi
      </Link>

      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-5 sm:p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold mb-1">Gjenerues Përshkrimesh Pune</h1>
            <p className="text-teal-100 text-sm">Krijo përshkrime profesionale me AI — gati për LinkedIn, website dhe portale pune.</p>
          </div>
        </div>
      </div>

      <div className="card mb-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Titulli i Pozicionit <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => upd('title', e.target.value)}
              placeholder="p.sh. Account Manager, Kuzhinier, Programues React..."
              className="input-field" />
          </div>
          <div>
            <label className="label">Departamenti</label>
            <input value={form.dept} onChange={e => upd('dept', e.target.value)}
              placeholder="p.sh. Marketing, Financë, IT..."
              className="input-field" />
          </div>
          <div>
            <label className="label">Lloji i Kontratës</label>
            <select value={form.contract} onChange={e => upd('contract', e.target.value)} className="input-field">
              <option value="">Zgjidhni...</option>
              {CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Niveli i Eksperiencës</label>
            <select value={form.level} onChange={e => upd('level', e.target.value)} className="input-field">
              <option value="">Zgjidhni...</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Detyrat Kryesore</label>
            <textarea value={form.duties} onChange={e => upd('duties', e.target.value)}
              placeholder="p.sh. Menaxhim klientësh, raporte mujore..."
              rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="label">Kualifikimet e Dëshiruara</label>
            <textarea value={form.skills} onChange={e => upd('skills', e.target.value)}
              placeholder="p.sh. Excel, komunikim, leje drejtimi..."
              rows={2} className="input-field resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Përfitimet & Kushtet</label>
            <input value={form.benefits} onChange={e => upd('benefits', e.target.value)}
              placeholder="p.sh. Paga sipas marrëveshjes, sigurim shëndetësor, orari fleksibël..."
              className="input-field" />
          </div>
        </div>
        <Button onClick={generate} disabled={loading || !form.title.trim()} className="w-full gap-2">
          {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Duke gjeneruar...</> : <><Sparkles className="w-4 h-4" />Gjenero Përshkrimin</>}
        </Button>
      </div>

      {(displayText) && (
        <div className="space-y-3">
          {result && (
            <div className="flex justify-end mb-2">
              <button onClick={copyAll} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                {copied ? <><Check className="w-4 h-4 text-emerald-500" />Kopjuar!</> : <><Copy className="w-4 h-4" />Kopjo të gjitha</>}
              </button>
            </div>
          )}
          {result ? SECTIONS.map(s => {
            const content = parseSection(result, s.key)
            if (!content) return null
            return (
              <div key={s.key} className={`rounded-2xl border p-4 ${s.color}`}>
                <h3 className="font-heading font-semibold text-gray-800 text-sm mb-2">{s.label}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
              </div>
            )
          }) : (
            <div className="card border-teal-100">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{streaming}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
