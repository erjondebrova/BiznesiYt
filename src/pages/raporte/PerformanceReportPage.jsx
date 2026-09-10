import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { ArrowLeft, BarChart3, RefreshCw, RotateCcw, Copy, Check, Plus, Minus } from 'lucide-react'

const PERIODS = [
  { id: 'week',    label: '📅 Java e fundit'      },
  { id: 'month',   label: '📆 Muaji i fundit'     },
  { id: 'quarter', label: '🗓️ Tremujori i fundit' },
  { id: 'custom',  label: '✏️ Tjetër (specifikoje)' },
]

const CHANNELS_LIST = [
  { id: 'instagram', label: '📸 Instagram'   },
  { id: 'facebook',  label: '👍 Facebook'    },
  { id: 'google',    label: '🔍 Google Ads'  },
  { id: 'tiktok',    label: '🎵 TikTok'      },
  { id: 'shop',      label: '🏪 Dyqan fizik' },
  { id: 'website',   label: '🌐 Faqe web'    },
]

const METRIC_LABELS = [
  'Shitje / të ardhura (lekë)',
  'Ndjekës të rinj',
  'Leads / kontakte të reja',
  'Buxheti i shpenzuar në reklama (lekë)',
  'Numri i porosive / klientëve',
  'Numri i postimeve / reklamave',
]

const SYSTEM_PROMPT = `Ti je një analist marketingu për biznese të vogla dhe të mesme shqiptare. Analizon të dhënat e performancës dhe jep raport të qartë me rekomandime veprimi.

RREGULL KRITIK ABSOLUT: Përdor VETËM metrikat që janë dhënë. NUK llogarit metrika të derivuara (CPC, CTR, ROAS, CPL, Conversion Rate) NËSE përdoruesi NUK i ka dhënë ato si numra. Kjo rregull është absolute dhe pa përjashtime.

Gjenero raportin sipas këtij formati:

📊 SEKSIONI 1 — PËRMBLEDHJE EKZEKUTIVE
2-3 fjali: numrat kryesorë (vetëm ato të dhëna), tendenca, ndryshimi nga periudha e mëparshme (nëse ka).

📈 SEKSIONI 2 — ANALIZA SIPAS KANALIT
Për secilin kanal: numrat e dhëna qartë · vëzhgim 1-2 fjali · trendi (↑↓→) me % nëse ka krahasim.
⚠️ Mos llogarit metrika mungëse — raporto vetëm ato të dhëna.

✅ SEKSIONI 3 — ÇFARË SHKON MIRË
3 pika pozitive bazuar VETËM te numrat e dhëna.

⚠️ SEKSIONI 4 — ÇFARË DUHET NDRYSHUAR
3 rekomandime konkrete. JO "përmirëso përmbajtjen" — konkretisht: "posto 4 herë/javë me video, krahaso rezultatet pas 2 javësh".

📋 SEKSIONI 5 — PLANI I VEPRIMIT
3-5 hapa me: ☐ Veprimi · 📅 Kur · 📊 Si e mat.

RREGULLA FINALE:
- Shqip i thjeshtë, pa zhargon — si konsulent me pronarin e dyqanit
- Çdo rekomandim i zbatueshëm brenda javës
- Anglicizma me shpjegim: "leads (kontakte/interesime të reja)"
- Nëse mungojnë metrika: "Herën tjetër shto edhe [metrikën] për analizë më të plotë"`

function buildPrompt({ businessName, period, customPeriod, channels, metrics, previousMetrics, hasComparison }) {
  const periodLabel = period === 'custom' ? customPeriod : PERIODS.find(p => p.id === period)?.label?.replace(/^[^\s]+ /, '') || period
  const channelLabels = channels.map(c => CHANNELS_LIST.find(ch => ch.id === c)?.label?.replace(/^[^\s]+ /, '') || c)

  let metricsText = ''
  channels.forEach(ch => {
    const chLabel = CHANNELS_LIST.find(c => c.id === ch)?.label || ch
    const chMetrics = metrics[ch]
    if (chMetrics) {
      const lines = METRIC_LABELS.map((label, i) => chMetrics[i]?.trim() ? `  - ${label}: ${chMetrics[i]}` : '').filter(Boolean)
      if (lines.length) metricsText += `\n${chLabel}:\n${lines.join('\n')}`
    }
  })

  let prevText = ''
  if (hasComparison) {
    channels.forEach(ch => {
      const chLabel = CHANNELS_LIST.find(c => c.id === ch)?.label || ch
      const chPrev = previousMetrics[ch]
      if (chPrev) {
        const lines = METRIC_LABELS.map((label, i) => chPrev[i]?.trim() ? `  - ${label}: ${chPrev[i]}` : '').filter(Boolean)
        if (lines.length) prevText += `\n${chLabel}:\n${lines.join('\n')}`
      }
    })
  }

  return `Biznesi: ${businessName}
Periudha e raportit: ${periodLabel}
Kanalet: ${channelLabels.join(', ')}

METRIKAT AKTUALE:${metricsText || ' (nuk janë dhënë)'}${hasComparison && prevText ? `\n\nMETRIKAT E PERIUDHËS SË MËPARSHME (për krahasim):${prevText}` : ''}

Gjenero raportin e performancës sipas formatit të dhënë. Përdor VETËM metrikat e listuara.`
}

function MetricsForm({ channelId, channelLabel, values, onChange }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-700">{channelLabel}</span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {METRIC_LABELS.map((label, i) => (
          <div key={i}>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <Input
              value={values?.[i] || ''}
              onChange={e => {
                const newVals = [...(values || Array(METRIC_LABELS.length).fill(''))]
                newVals[i] = e.target.value
                onChange(newVals)
              }}
              placeholder="opsionale"
              className="text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  )
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

export default function PerformanceReportPage() {
  const { profile } = useAuth()
  const [period, setPeriod]           = useState('month')
  const [customPeriod, setCustomPeriod] = useState('')
  const [channels, setChannels]       = useState(['instagram'])
  const [metrics, setMetrics]         = useState({})
  const [hasComparison, setHasComparison] = useState(false)
  const [previousMetrics, setPreviousMetrics] = useState({})
  const [loading, setLoading]         = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [result, setResult]           = useState(null)

  const businessName = profile?.business_name || 'Biznesi Im'

  function toggleChannel(id) {
    setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  function setChannelMetrics(ch, vals) {
    setMetrics(prev => ({ ...prev, [ch]: vals }))
  }

  function setPrevChannelMetrics(ch, vals) {
    setPreviousMetrics(prev => ({ ...prev, [ch]: vals }))
  }

  async function generate() {
    setLoading(true); setStreamingText(''); setResult(null)
    const prompt = buildPrompt({ businessName, period, customPeriod, channels, metrics, previousMetrics, hasComparison })
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
        <Link to="/raporte" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <h1 className="font-heading text-xl font-bold text-gray-900">Raport Performance</h1>
      </div>
      <div className="card border border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-slate-600 rounded-xl flex items-center justify-center animate-pulse">
            <BarChart3 className="w-5 h-5 text-white"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Duke analizuar performancën...</p>
            <p className="text-xs text-gray-400">Përmbledhje, analiza, rekomandime, plan veprimi</p>
          </div>
        </div>
        {streamingText ? (
          <div className="bg-white rounded-xl p-4 border border-slate-200 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-slate-600 ml-0.5 animate-pulse"/></pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-500"/>Duke procesuar të dhënat...
          </div>
        )}
      </div>
    </div>
  )

  if (result) return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link to="/raporte" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Raporti Gati!</h1>
            <p className="text-xs text-gray-400">{businessName} · {PERIODS.find(p => p.id === period)?.label || customPeriod}</p>
          </div>
        </div>
        <button onClick={() => setResult(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
        </button>
      </div>
      <CopyBlock label="Raporti i Performancës" text={result}/>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700 font-medium">💡 Zbato rekomandimet brenda kësaj jave — secila ka hap konkret dhe metrikë matjeje.</p>
      </div>
      <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2">
        <RotateCcw className="w-4 h-4"/>Gjenero raport të ri
      </Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/raporte" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Raport Performance Marketingu</h1>
          <p className="text-xs text-gray-400 mt-0.5">Fut numrat — merr analizë me rekomandime konkrete</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
        <BarChart3 className="w-4 h-4 text-slate-500 flex-shrink-0"/>
        <p className="text-xs text-slate-600">Krijohet për: <strong>{businessName}</strong> · fut vetëm numrat që i ke disponueshëm</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Periudha e raportit</label>
          <div className="grid grid-cols-2 gap-2">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className={`px-3 py-2 rounded-xl border-2 text-sm text-left transition-all ${period === p.id ? 'border-slate-600 bg-slate-50 font-semibold text-slate-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                {p.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <Input className="mt-2" value={customPeriod} onChange={e => setCustomPeriod(e.target.value)}
              placeholder="p.sh. Marsi 2025, Q1 2025"/>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Kanalet që do raportosh</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CHANNELS_LIST.map(c => (
              <button key={c.id} onClick={() => toggleChannel(c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all ${channels.includes(c.id) ? 'border-slate-600 bg-slate-50 text-slate-700 font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {channels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Metrikat aktuale</h2>
            <span className="text-xs text-gray-400">(fut vetëm ato që i ke)</span>
          </div>
          {channels.map(ch => {
            const chDef = CHANNELS_LIST.find(c => c.id === ch)
            return (
              <MetricsForm key={ch} channelId={ch} channelLabel={chDef?.label || ch}
                values={metrics[ch]} onChange={vals => setChannelMetrics(ch, vals)}/>
            )
          })}
        </div>
      )}

      <div className="card">
        <button onClick={() => setHasComparison(!hasComparison)}
          className="flex items-center gap-2 w-full text-sm font-semibold text-gray-700 hover:text-gray-900">
          {hasComparison ? <Minus className="w-4 h-4 text-slate-500"/> : <Plus className="w-4 h-4 text-slate-500"/>}
          {hasComparison ? 'Fshij krahasimin' : 'Shto të dhëna nga periudha e mëparshme (krahasim)'}
        </button>
        {hasComparison && (
          <div className="space-y-3 mt-4">
            <p className="text-xs text-gray-500">Metrikat e periudhës së mëparshme (për krahasim % ndryshimi):</p>
            {channels.map(ch => {
              const chDef = CHANNELS_LIST.find(c => c.id === ch)
              return (
                <MetricsForm key={ch} channelId={ch} channelLabel={`${chDef?.label || ch} (periudha e mëparshme)`}
                  values={previousMetrics[ch]} onChange={vals => setPrevChannelMetrics(ch, vals)}/>
              )
            })}
          </div>
        )}
      </div>

      <Button onClick={generate} disabled={channels.length === 0} className="w-full gap-2 bg-slate-700 hover:bg-slate-800" size="lg">
        <BarChart3 className="w-5 h-5"/>Gjenero Raportin
      </Button>
    </div>
  )
}
