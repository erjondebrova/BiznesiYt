import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { ArrowLeft, Sparkles, RefreshCw, Video, Check, Copy, RotateCcw, Play, Clock, Mic } from 'lucide-react'

const DURATIONS = [
  { id: '15', label: '15 sekonda', desc: 'Hook i shpejtë' },
  { id: '30', label: '30 sekonda', desc: 'Story kompakte' },
  { id: '60', label: '60 sekonda', desc: 'Mesazh i plotë' },
  { id: '90', label: '90 sekonda', desc: 'Tutorial i shkurtër' },
]

const STYLES = [
  { id: 'educational', label: 'Edukues',       emoji: '🎓' },
  { id: 'promotional', label: 'Promovues',      emoji: '🔥' },
  { id: 'entertaining', label: 'Argëtues',      emoji: '😄' },
  { id: 'testimonial', label: 'Testimonial',    emoji: '⭐' },
  { id: 'tutorial',    label: 'Tutorial/Si të', emoji: '📋' },
  { id: 'trending',    label: 'Trend/Viral',    emoji: '🚀' },
]

const PLATFORMS = [
  { id: 'tiktok',   label: 'TikTok'            },
  { id: 'reels',    label: 'Instagram Reels'   },
  { id: 'shorts',   label: 'YouTube Shorts'    },
  { id: 'stories',  label: 'Instagram Stories' },
]

function ScriptSection({ timing, title, color, content }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className={`rounded-xl border-2 ${color} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border">{timing}</span>
          <span className="text-sm font-bold text-gray-900">{title}</span>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          {copied ? <><Check className="w-3 h-3 text-green-500"/>Kopjuar</> : <><Copy className="w-3 h-3"/>Kopjo</>}
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

function parseScript(text) {
  const result = { hook: '', body: '', cta: '', caption: '', hashtags: '', notes: '' }
  const lines = text.split('\n')
  let current = ''
  for (const line of lines) {
    const upper = line.toUpperCase()
    if (upper.includes('HOOK') || upper.includes('FILLIMI')) { current = 'hook'; continue }
    if (upper.includes('BODY') || upper.includes('TRUP') || upper.includes('MESAZH')) { current = 'body'; continue }
    if (upper.includes('CTA') || upper.includes('THIRRJE')) { current = 'cta'; continue }
    if (upper.includes('CAPTION') || upper.includes('PËRSHKRIM')) { current = 'caption'; continue }
    if (upper.includes('HASHTAG') || upper.includes('#')) { current = 'hashtags'; continue }
    if (upper.includes('KËSHILLA') || upper.includes('SHËNIME') || upper.includes('TIP')) { current = 'notes'; continue }
    if (line.trim() && current) result[current] += (result[current] ? '\n' : '') + line.trim().replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '')
  }
  return result
}

export default function VideoScriptPage() {
  const { profile } = useAuth()
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('30')
  const [style, setStyle] = useState('promotional')
  const [platform, setPlatform] = useState('reels')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState(false)
  const [script, setScript] = useState(null)
  const [rawText, setRawText] = useState('')
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!topic.trim()) return
    setLoading(true)
    setStreamingText('')
    setScript(null)

    const styleLabel = STYLES.find(s => s.id === style)?.label
    const platformLabel = PLATFORMS.find(p => p.id === platform)?.label
    const durLabel = DURATIONS.find(d => d.id === duration)?.label

    const prompt = `Shkruaj një skript video ${durLabel} për ${platformLabel} për biznesin "${profile?.business_name || 'tonin'}" (${profile?.industry || ''}).

Tema/Produkti: ${topic}
Stili: ${styleLabel}

Shkruaj skriptin EKSAKT në këtë format:

**HOOK (0-3 sek) — Fillimi që kap vëmendjen:**
[Fjalia e parë tronditëse — pyetje, fakt befasues, ose deklaratë provokuese]

**BODY/TRUPI (${duration === '15' ? '3-12' : duration === '30' ? '3-25' : duration === '60' ? '3-50' : '3-80'} sek) — Mesazhi kryesor:**
[Skenari i plotë me instruksione veprimesh dhe fjalëve — çfarë bën dhe çfarë thua]

**CTA (${duration === '15' ? '12' : duration === '30' ? '25' : duration === '60' ? '50' : '80'}-${duration} sek) — Thirrje për veprim:**
[Tekst i fortë CTA + çfarë duhet të tregojë ekrani]

**CAPTION/PËRSHKRIM:**
[Caption e plotë për postim me emoji]

**HASHTAGS:**
[10-15 hashtag shqiptare dhe globale]

**KËSHILLA XHIRIMI:**
[2-3 këshilla praktike për xhirimin e këtij videoja]

Ji KONKRET — shkruaj fjalë për fjalë çfarë duhet thënë, jo instruksione abstrakte.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i krijimit të skripteve video virale për rrjetet sociale shqiptare. Fol shqip. Krijo skripte konkrete, tërheqëse dhe të zbatueshme menjëherë.',
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
        setScript(parseScript(fullText))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  function copyAll() {
    navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Skript Video</h1>
        </div>
        <div className="card border border-purple-100 bg-purple-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center animate-pulse">
              <Video className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke shkruar skriptin...</p>
              <p className="text-xs text-gray-400">Video {duration} sekonda · {PLATFORMS.find(p=>p.id===platform)?.label}</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-purple-100 max-h-[50vh] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-purple-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-purple-500"/>Duke menduar...</div>
          )}
        </div>
      </div>
    )
  }

  if (script) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900">Skripti juaj</h1>
              <p className="text-xs text-gray-400">{duration}s · {PLATFORMS.find(p=>p.id===platform)?.label} · {STYLES.find(s=>s.id===style)?.label}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo</>}
            </button>
            <button onClick={() => setScript(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
              <RotateCcw className="w-3.5 h-3.5"/>Ri-bëj
            </button>
          </div>
        </div>

        {script.hook && <ScriptSection timing="0–3 sek" title="HOOK" color="border-red-200 bg-red-50/40" content={script.hook} />}
        {script.body && <ScriptSection timing={`3–${parseInt(duration)-5} sek`} title="TRUPI" color="border-blue-200 bg-blue-50/40" content={script.body} />}
        {script.cta  && <ScriptSection timing={`${parseInt(duration)-5}–${duration} sek`} title="THIRRJE PËR VEPRIM" color="border-green-200 bg-green-50/40" content={script.cta} />}

        {script.caption && (
          <div className="card">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Caption / Përshkrimi</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{script.caption}</p>
          </div>
        )}

        {script.hashtags && (
          <div className="card">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Hashtags</p>
            <p className="text-sm text-primary-600 leading-relaxed">{script.hashtags}</p>
          </div>
        )}

        {script.notes && (
          <div className="card border border-amber-100 bg-amber-50/40">
            <p className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1"><Mic className="w-3 h-3"/>Këshilla Xhirimi</p>
            <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{script.notes}</p>
          </div>
        )}

        <Button variant="outline" onClick={() => setScript(null)} className="w-full gap-2">
          <RotateCcw className="w-4 h-4"/>Shkruaj skript të ri
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Skript Video</h1>
          <p className="text-xs text-gray-400 mt-0.5">TikTok · Reels · Shorts — skripta gati për xhirim</p>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Platforma</label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              className={`py-2.5 text-sm rounded-xl border-2 font-medium transition-all ${platform === p.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Kohëzgjatja</label>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map(d => (
            <button key={d.id} onClick={() => setDuration(d.id)}
              className={`py-2 text-center rounded-xl border-2 transition-all ${duration === d.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <p className="text-sm font-bold">{d.label.split(' ')[0]}</p>
              <p className="text-xs opacity-70">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Stili i Videos</label>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${style === s.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <span>{s.emoji}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Tema / Produkti / Mesazhi</label>
        <Textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="p.sh. Prezantoj restorantin tonë të ri — oferta speciale lunching 12-15h me çmim 500 ALL..."
          rows={3}
          className="mt-1"
        />
      </div>

      <Button onClick={generate} disabled={!topic.trim()} className="w-full gap-2 bg-purple-600 hover:bg-purple-700" size="lg">
        <Play className="w-5 h-5"/>Shkruaj Skriptin
      </Button>
    </div>
  )
}
