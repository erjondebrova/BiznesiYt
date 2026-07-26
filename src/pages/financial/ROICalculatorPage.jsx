import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, TrendingUp, RefreshCw, Sparkles, RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const INVESTMENT_TYPES = [
  { id: 'equipment',  label: '🏭 Pajisje & Makineari' },
  { id: 'marketing',  label: '📣 Marketing & Reklama' },
  { id: 'staff',      label: '👥 Staf i ri'            },
  { id: 'premises',   label: '🏢 Hapësirë / Zgjerim'  },
  { id: 'tech',       label: '💻 Teknologji / Software' },
  { id: 'training',   label: '🎓 Trajnim & Zhvillim'   },
]

function fmt(n, dec = 0) {
  if (!n && n !== 0) return '—'
  return n.toLocaleString('sq-AL', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function Metric({ label, value, sub, highlight, positive, negative }) {
  let bg = 'bg-gray-50 border-gray-100'
  let valueColor = 'text-gray-900'
  if (highlight) { bg = 'bg-blue-600'; valueColor = 'text-white' }
  else if (positive) { bg = 'bg-emerald-50 border-emerald-100'; valueColor = 'text-emerald-700' }
  else if (negative) { bg = 'bg-rose-50 border-rose-100'; valueColor = 'text-rose-700' }

  return (
    <div className={`rounded-xl p-4 border ${bg}`}>
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

export default function ROICalculatorPage() {
  const { profile } = useAuth()
  const [investType, setInvestType] = useState('equipment')
  const [investName, setInvestName] = useState('')
  const [investAmount, setInvestAmount] = useState('')
  const [monthlyRevenue, setMonthlyRevenue] = useState('')
  const [monthlyCost, setMonthlyCost] = useState('')
  const [period, setPeriod] = useState('12')

  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState(null)

  const calc = useMemo(() => {
    const invest = parseFloat(investAmount) || 0
    const rev = parseFloat(monthlyRevenue) || 0
    const cost = parseFloat(monthlyCost) || 0
    const months = parseInt(period) || 12

    if (!invest || !rev) return null

    const netMonthly = rev - cost
    const breakEvenMonths = netMonthly > 0 ? invest / netMonthly : Infinity
    const totalReturn = netMonthly * months
    const netProfit = totalReturn - invest
    const roi = (netProfit / invest) * 100
    const annualROI = (roi / months) * 12

    return { invest, netMonthly, breakEvenMonths, totalReturn, netProfit, roi, annualROI, months }
  }, [investAmount, monthlyRevenue, monthlyCost, period])

  const verdict = useMemo(() => {
    if (!calc) return null
    if (calc.roi >= 50) return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', text: 'Investim shumë i mirë', sub: `ROI ${Math.round(calc.roi)}% — kthim shumë i lartë` }
    if (calc.roi >= 20) return { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', text: 'Investim i mirë', sub: `ROI ${Math.round(calc.roi)}% — kthim i kënaqshëm` }
    if (calc.roi >= 0)  return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', text: 'Investim mesatar', sub: `ROI ${Math.round(calc.roi)}% — shqyrtoni alternativat` }
    return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', text: 'Investim me humbje', sub: `Rishikoni numrat ose alternativat` }
  }, [calc])

  async function getAiAdvice() {
    if (!calc) return
    setLoading(true)
    setStreamingText('')
    setAiAnalysis(null)

    const typeLabel = INVESTMENT_TYPES.find(t => t.id === investType)?.label || ''

    const prompt = `Analizë investimi për biznesin "${profile?.business_name || 'imi'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Lloji: ${typeLabel}
Investimi: ${investName || 'investimi i planifikuar'}
Shuma e investimit: ${fmt(calc.invest)} ALL
Të ardhura shtesë/muaj: ${fmt(parseFloat(monthlyRevenue))} ALL
Kosto shtesë/muaj: ${fmt(parseFloat(monthlyCost) || 0)} ALL
Fitimi neto/muaj: ${fmt(calc.netMonthly)} ALL
Break-even: ${isFinite(calc.breakEvenMonths) ? Math.ceil(calc.breakEvenMonths) + ' muaj' : 'Nuk rikuperohet'}
ROI ${period} muaj: ${Math.round(calc.roi)}%
ROI vjetor: ${Math.round(calc.annualROI)}%

## A IA VLEN KY INVESTIM?
[Vlerëso nëse investimi ia vlen për këtë biznes specifik — 2-3 fjali direkte]

## FAKTORËT KRITIKË PËR SUKSES
[3 gjëra specifike që duhet të ndodhin që ky investim të japë rezultate]

## RREZIQET KRYESORE
[2-3 rreziqe konkrete dhe si t'i menaxhosh]

## ALTERNATIVAT
[1-2 alternativa për të arritur të njëjtin objektiv me kosto më të ulët ose ROI më të lartë]

## REKOMANDIMI IM
[Rekomandim i qartë: Investo / Mos Investo / Ndrysho Planin — me arsyetim 1 fjali]

Fol shqip. Ji DIREKT dhe KONKRET.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i analizës financiare dhe investimeve për biznese shqiptare të vogla dhe të mesme. Jep analiza të qarta dhe rekomandime konkrete. Fol shqip.',
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
        setAiAnalysis(fullText)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  function parseSection(text, header) {
    const regex = new RegExp(`## ${header}([\\s\\S]*?)(?:##|$)`, 'i')
    const m = text.match(regex)
    return m ? m[1].trim() : ''
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analiza ROI & Investimit</h1>
          <p className="text-xs text-gray-400 mt-0.5">Llogarit kthimin e investimit dhe merr analizën AI</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Lloji i Investimit</label>
          <div className="grid grid-cols-2 gap-2">
            {INVESTMENT_TYPES.map(t => (
              <button key={t.id} onClick={() => setInvestType(t.id)}
                className={`py-2.5 px-3 text-sm rounded-xl border-2 font-medium text-left transition-all ${investType === t.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Emri / Përshkrimi i Investimit</label>
          <input type="text" value={investName} onChange={e => setInvestName(e.target.value)}
            placeholder="p.sh. Makinë kafeje espresso profesionale, Faqe interneti, Punëmarrës shitjesh..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-gray-300" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Shuma e Investimit (ALL) <span className="text-rose-400">*</span></label>
          <input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)}
            placeholder="p.sh. 500000"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-right" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Të Ardhura Shtesë/Muaj (ALL) <span className="text-rose-400">*</span>
            </label>
            <input type="number" value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-right" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kosto Shtesë/Muaj (ALL)</label>
            <input type="number" value={monthlyCost} onChange={e => setMonthlyCost(e.target.value)}
              placeholder="0 (opsionale)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-right" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Periudha e Vlerësimit: <span className="text-violet-600 font-bold">{period} muaj</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['6','12','24','36'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`py-2 text-sm font-bold rounded-xl border-2 transition-all ${period === p ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {p}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {calc && (
        <>
          {verdict && (
            <div className={`rounded-xl border-2 p-4 flex items-start gap-3 ${verdict.bg}`}>
              <verdict.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${verdict.color}`}/>
              <div>
                <p className={`font-bold text-base ${verdict.color}`}>{verdict.text}</p>
                <p className="text-sm text-gray-600 mt-0.5">{verdict.sub}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Metric label="Fitimi Neto/Muaj" value={`${fmt(calc.netMonthly)} ALL`} positive={calc.netMonthly >= 0} negative={calc.netMonthly < 0} />
            <Metric label={`ROI ${period} Muaj`} value={`${Math.round(calc.roi)}%`} highlight />
            <Metric label="Break-Even" value={isFinite(calc.breakEvenMonths) ? `${Math.ceil(calc.breakEvenMonths)} muaj` : '∞'} sub="rikuperimi i investimit" />
            <Metric label="ROI Vjetor" value={`${Math.round(calc.annualROI)}%`} positive={calc.annualROI >= 20} />
          </div>

          <div className="card border border-violet-100 bg-violet-50/20">
            <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-3">Parashikimi për {period} muaj</p>
            <div className="space-y-2">
              {[
                ['Investimi fillestar', `-${fmt(calc.invest)} ALL`, 'text-rose-600'],
                [`Kthimi total (${period} × ${fmt(calc.netMonthly)} ALL)`, `+${fmt(calc.totalReturn)} ALL`, 'text-emerald-600'],
                ['Fitimi/Humbja neto', `${calc.netProfit >= 0 ? '+' : ''}${fmt(calc.netProfit)} ALL`, calc.netProfit >= 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'],
              ].map(([label, value, color]) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-violet-100 last:border-0">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {!aiAnalysis && !loading && (
            <Button onClick={getAiAdvice} variant="outline" className="w-full gap-2 border-violet-200 text-violet-600 hover:bg-violet-50">
              <Sparkles className="w-4 h-4"/>A ia vlen? Merr Analizën AI
            </Button>
          )}
        </>
      )}

      {loading && (
        <div className="card border border-violet-100 bg-violet-50/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center animate-pulse">
              <TrendingUp className="w-4 h-4 text-white"/>
            </div>
            <p className="text-sm font-semibold text-gray-900">Duke analizuar investimin tuaj...</p>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-3 border border-violet-100 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-violet-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-violet-500"/>Duke menduar...</div>
          )}
        </div>
      )}

      {aiAnalysis && (
        <div className="space-y-3">
          {[
            { key: 'A IA VLEN KY INVESTIM\\?', display: 'A IA VLEN KY INVESTIM?', color: 'border-blue-200 bg-blue-50/40', label: 'text-blue-700' },
            { key: 'FAKTORËT KRITIKË PËR SUKSES', display: 'FAKTORËT KRITIKË PËR SUKSES', color: 'border-emerald-200 bg-emerald-50/40', label: 'text-emerald-700' },
            { key: 'RREZIQET KRYESORE', display: 'RREZIQET KRYESORE', color: 'border-rose-200 bg-rose-50/40', label: 'text-rose-700' },
            { key: 'ALTERNATIVAT', display: 'ALTERNATIVAT', color: 'border-amber-200 bg-amber-50/40', label: 'text-amber-700' },
            { key: 'REKOMANDIMI IM', display: 'REKOMANDIMI IM', color: 'border-violet-300 bg-violet-50', label: 'text-violet-700' },
          ].map(({ key, display, color, label }) => {
            const content = parseSection(aiAnalysis, key)
            if (!content) return null
            return (
              <div key={key} className={`rounded-xl border-2 p-4 ${color}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${label}`}>{display}</p>
                <div className="space-y-1.5">
                  {content.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{line.replace(/^[-•\d.]\s*/, '').replace(/\*\*/g, '')}</p>
                  ))}
                </div>
              </div>
            )
          })}
          <Button variant="outline" onClick={() => setAiAnalysis(null)} className="w-full gap-2">
            <RotateCcw className="w-4 h-4"/>Analizë e re
          </Button>
        </div>
      )}
    </div>
  )
}
