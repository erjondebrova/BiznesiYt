import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, MessageSquare, Sparkles, RefreshCw } from 'lucide-react'

const LEVELS = ['Juniori', 'Mesatar', 'Senior', 'Manager', 'C-Level']
const FOCUS_AREAS = [
  { id: 'tech', label: 'Teknike' },
  { id: 'behavior', label: 'Sjelljeje' },
  { id: 'culture', label: 'Kulturë' },
  { id: 'leadership', label: 'Lidershipi' },
  { id: 'problem', label: 'Problem-Solving' },
  { id: 'communication', label: 'Komunikim' },
  { id: 'stress', label: 'Stres & Presion' },
  { id: 'motivation', label: 'Motivim' },
  { id: 'team', label: 'Punë Ekipi' },
  { id: 'experience', label: 'Eksperiencë e Kaluar' },
]
const SECTION_COLORS = {
  'PYETJE TEKNIKE': 'border-blue-200 bg-blue-50',
  'PYETJE SJELLJEJE': 'border-purple-200 bg-purple-50',
  'PYETJE MOTIVIMI DHE KULTURË': 'border-amber-200 bg-amber-50',
  'PYETJE SITUACIONALE': 'border-emerald-200 bg-emerald-50',
}

function parseSection(text, header) {
  const regex = new RegExp(`## ${header}([\\s\\S]*?)(?=##|$)`, 'i')
  const m = text.match(regex)
  return m ? m[1].trim() : ''
}

export default function InterviewQuestionsPage() {
  const { profile } = useAuth()
  const [role, setRole] = useState('')
  const [level, setLevel] = useState('')
  const [focus, setFocus] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [streaming, setStreaming] = useState('')

  function toggleFocus(id) {
    setFocus(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  async function generate() {
    if (!role.trim()) return
    setLoading(true); setResult(''); setStreaming('')
    const focusLabels = focus.map(id => FOCUS_AREAS.find(f => f.id === id)?.label).filter(Boolean).join(', ')
    const prompt = `Gjenero pyetje interviste profesionale për pozicionin:
Biznesi: ${profile?.business_name || 'kompania'} (${profile?.industry || ''})
Roli: ${role}
Niveli: ${level || 'Mesatar'}
${focusLabels ? `Fokusi: ${focusLabels}` : ''}

Kthe saktësisht këto seksione:
## PYETJE TEKNIKE
[8-10 pyetje specifike teknike/profesionale për rolin]

## PYETJE SJELLJEJE
[6-8 pyetje bazuar në metodën STAR (Situatë, Task, Aksion, Rezultat)]

## PYETJE MOTIVIMI DHE KULTURË
[5-6 pyetje për motivimin, vlerët dhe kulturën e kompanisë]

## PYETJE SITUACIONALE
[5-6 skenarë hipotetikë specifike për industrinë]

Për çdo pyetje, shto (nëse relevant): 🎯 Çfarë vlerësoni me këtë pyetje
Fol shqip. Pyetjet duhet të jenë konkrete, specifike dhe të dobishme.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert HR dhe rekrutimi. Gjenero pyetje interviste profesionale dhe efektive. Fol shqip.',
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

  const displayText = result || streaming

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <Link to="/hr" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> HR & Ekipi
      </Link>

      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 sm:p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold mb-1">Pyetje Interviste</h1>
            <p className="text-blue-100 text-sm">Pyetje të personalizuara sipas rolit dhe nivelit — gjenero me AI.</p>
          </div>
        </div>
      </div>

      <div className="card mb-4 space-y-4">
        <div>
          <label className="label">Roli i Kandidatit <span className="text-red-500">*</span></label>
          <input value={role} onChange={e => setRole(e.target.value)}
            placeholder="p.sh. Kontabilist, Shitës, Developer, Manager..."
            className="input-field" />
        </div>
        <div>
          <label className="label">Niveli i Eksperiencës</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(level === l ? '' : l)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  level === l ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Fokusi i Pyetjeve <span className="text-gray-400 font-normal">(zgjidhni disa)</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {FOCUS_AREAS.map(f => (
              <button key={f.id} onClick={() => toggleFocus(f.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  focus.includes(f.id) ? 'bg-indigo-500 text-white border-indigo-500' : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={generate} disabled={loading || !role.trim()} className="w-full gap-2">
          {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Duke gjeneruar...</> : <><Sparkles className="w-4 h-4" />Gjenero Pyetjet</>}
        </Button>
      </div>

      {displayText && (
        <div className="space-y-3">
          {result ? Object.entries(SECTION_COLORS).map(([key, color]) => {
            const content = parseSection(result, key)
            if (!content) return null
            return (
              <div key={key} className={`rounded-2xl border p-4 ${color}`}>
                <h3 className="font-heading font-semibold text-gray-800 text-sm mb-3">{key}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
              </div>
            )
          }) : (
            <div className="card">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{streaming}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
