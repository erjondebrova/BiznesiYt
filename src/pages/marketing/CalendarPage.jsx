import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Sparkles, RefreshCw, Calendar, Check, Copy, RotateCcw, Instagram, Radio } from 'lucide-react'

const CHANNELS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook',  label: 'Facebook'  },
  { id: 'tiktok',    label: 'TikTok'    },
  { id: 'whatsapp',  label: 'WhatsApp'  },
  { id: 'linkedin',  label: 'LinkedIn'  },
]

const FREQUENCIES = [
  { id: '3x',    label: '3x në javë'   },
  { id: '5x',    label: '5x në javë'   },
  { id: 'daily', label: 'Çdo ditë'     },
]

const MONTHS = [
  'Janar','Shkurt','Mars','Prill','Maj','Qershor',
  'Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor',
]

function WeekCard({ week, content }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const lines = content.split('\n').filter(l => l.trim())
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-gray-900 text-sm">{week}</h3>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
          {copied ? <><Check className="w-3 h-3 text-green-500"/>Kopjuar</> : <><Copy className="w-3 h-3"/>Kopjo</>}
        </button>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith('**') || line.startsWith('###') || line.startsWith('##')) {
            return <p key={i} className="text-xs font-bold text-primary-600 mt-2">{line.replace(/\*\*/g,'').replace(/^#+\s*/,'')}</p>
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-xs text-gray-700 leading-relaxed">{line.slice(2)}</span>
              </div>
            )
          }
          return <p key={i} className="text-xs text-gray-600">{line}</p>
        })}
      </div>
    </div>
  )
}

function parseWeeks(text) {
  const parts = text.split(/^## /m).filter(Boolean)
  return parts.map(p => {
    const lines = p.split('\n')
    return { title: lines[0].trim(), content: lines.slice(1).join('\n').trim() }
  }).filter(w => w.title && w.content)
}

export default function CalendarPage() {
  const { profile } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [channels, setChannels] = useState(['instagram', 'facebook'])
  const [frequency, setFrequency] = useState('3x')
  const [theme, setTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [weeks, setWeeks] = useState(null)
  const [rawText, setRawText] = useState('')
  const [copied, setCopied] = useState(false)

  function toggleChannel(id) {
    setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function generate() {
    if (!channels.length) return
    setLoading(true)
    setStreamingText('')
    setWeeks(null)

    const chanList = channels.map(c => CHANNELS.find(x => x.id === c)?.label).join(', ')
    const freqLabel = FREQUENCIES.find(f => f.id === frequency)?.label

    const prompt = `Gjenero një kalendar të detajuar të përmbajtjeve të mediave sociale për muajin ${MONTHS[month]} për biznesin "${profile?.business_name || 'tonin'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Kanalet: ${chanList}
Frekuenca: ${freqLabel}
${theme ? `Tema/Promovimi i muajit: ${theme}` : ''}

Krijoni kalendarit EKSAKT në këtë format:

## Java 1 (1-7 ${MONTHS[month]})
- **[Dita & Kanali]:** [Ideja e postimit — çfarë të postosh dhe si]
- **[Dita & Kanali]:** [Ideja e postimit]
(${frequency === 'daily' ? '7' : frequency === '5x' ? '5' : '3'} postime)

## Java 2 (8-14 ${MONTHS[month]})
(e njëjta strukturë)

## Java 3 (15-21 ${MONTHS[month]})
(e njëjta strukturë)

## Java 4 (22-31 ${MONTHS[month]})
(e njëjta strukturë)

Për çdo postim jep: ditën, kanalin, idenë e plotë të përmbajtjes dhe formatin (foto/video/story/reel/carousel). Ji KONKRET dhe SPECIFIK për industrinë dhe biznesin. Për çdo postim shtoj edhe orën e sugjeruar.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i social media marketing për biznese shqiptare. Fol shqip. Jep ide konkrete, të zbatueshme dhe tërheqëse për audiencën shqiptare.',
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
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
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
        setWeeks(parseWeeks(fullText))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setStreamingText('')
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Kalendar Përmbajtjesh</h1>
        </div>
        <div className="card border border-primary-100 bg-primary-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center animate-pulse">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke gjeneruar kalendarin...</p>
              <p className="text-xs text-gray-400">Po planifikohen postimet për {MONTHS[month]}</p>
            </div>
          </div>
          {streamingText && (
            <div className="bg-white rounded-xl p-4 border border-primary-100 max-h-[50vh] overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-primary-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          )}
          {!streamingText && <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-primary-500"/>Duke menduar...</div>}
        </div>
      </div>
    )
  }

  if (weeks?.length > 0) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900">Kalendar — {MONTHS[month]}</h1>
              <p className="text-xs text-gray-400">{channels.map(c => CHANNELS.find(x => x.id === c)?.label).join(' · ')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo</>}
            </button>
            <button onClick={() => setWeeks(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
              <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {weeks.map((w, i) => <WeekCard key={i} week={w.title} content={w.content} />)}
        </div>
        <Button variant="outline" onClick={() => setWeeks(null)} className="w-full gap-2">
          <RotateCcw className="w-4 h-4"/>Gjenero kalendar të ri
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Kalendar Përmbajtjesh</h1>
          <p className="text-xs text-gray-400 mt-0.5">Plan mujor i postimeve për rrjetet sociale</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-500"/>Muaji
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((m, i) => (
            <button key={i} onClick={() => setMonth(i)}
              className={`py-2 text-xs rounded-lg border-2 font-medium transition-all ${month === i ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Kanalet</label>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map(c => (
            <button key={c.id} onClick={() => toggleChannel(c.id)}
              className={`px-3 py-1.5 text-xs rounded-full border-2 font-medium transition-all ${channels.includes(c.id) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {channels.includes(c.id) && <Check className="w-3 h-3 inline mr-1"/>}{c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Frekuenca e postimit</label>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENCIES.map(f => (
            <button key={f.id} onClick={() => setFrequency(f.id)}
              className={`py-2.5 text-sm rounded-xl border-2 font-medium transition-all ${frequency === f.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Tema ose Promovimi i Muajit <span className="text-gray-400 font-normal">(opsionale)</span>
        </label>
        <input type="text"
          value={theme}
          onChange={e => setTheme(e.target.value)}
          placeholder="p.sh. Sezon veror, Zbritje 20%, Lansim produkti të ri..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder:text-gray-300"
        />
      </div>

      <Button onClick={generate} disabled={!channels.length} className="w-full gap-2" size="lg">
        <Calendar className="w-5 h-5"/>Gjenero Kalendarin e {MONTHS[month]}
      </Button>
    </div>
  )
}
