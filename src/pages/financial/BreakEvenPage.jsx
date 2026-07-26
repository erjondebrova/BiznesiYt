import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Target, RefreshCw, Sparkles, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react'

function fmt(n) { return Math.round(n).toLocaleString('sq-AL') }

function Gauge({ percent, label, color }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-gray-700">{Math.round(clamped)}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${clamped}%` }}/>
      </div>
    </div>
  )
}

export default function BreakEvenPage() {
  const { profile } = useAuth()
  const [fixedCosts, setFixedCosts] = useState('')
  const [variableCost, setVariableCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [currentUnits, setCurrentUnits] = useState('')
  const [productName, setProductName] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [aiAdvice, setAiAdvice] = useState(null)

  const calc = useMemo(() => {
    const fc = parseFloat(fixedCosts) || 0
    const vc = parseFloat(variableCost) || 0
    const sp = parseFloat(sellingPrice) || 0
    const cu = parseFloat(currentUnits) || 0

    if (!fc || !sp || sp <= vc) return null

    const contributionMargin = sp - vc
    const contributionMarginPct = (contributionMargin / sp) * 100
    const bepUnits = fc / contributionMargin
    const bepRevenue = bepUnits * sp
    const grossMargin = ((sp - vc) / sp) * 100
    const currentRevenue = cu * sp
    const currentProfit = cu * contributionMargin - fc
    const safetyMargin = cu > 0 ? ((cu - bepUnits) / cu) * 100 : 0
    const coveragePercent = cu > 0 ? (cu / bepUnits) * 100 : 0

    return {
      contributionMargin,
      contributionMarginPct,
      bepUnits,
      bepRevenue,
      grossMargin,
      currentRevenue,
      currentProfit,
      safetyMargin,
      coveragePercent,
      aboveBreakEven: cu > 0 && cu >= bepUnits,
    }
  }, [fixedCosts, variableCost, sellingPrice, currentUnits])

  async function getAiAdvice() {
    if (!calc) return
    setLoading(true)
    setStreamingText('')
    setAiAdvice(null)

    const prompt = `Analizë break-even për biznesin "${profile?.business_name || 'imi'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Produkti/Shërbimi: ${productName || 'produkti kryesor'}
Kosto fikse/muaj: ${fmt(parseFloat(fixedCosts))} ALL
Kosto variabile/njësi: ${fmt(parseFloat(variableCost))} ALL
Çmimi i shitjes/njësi: ${fmt(parseFloat(sellingPrice))} ALL
Njësi të shitura aktualisht: ${currentUnits || 'N/A'}/muaj

REZULTATE:
- Pikëprerja (break-even): ${fmt(calc.bepUnits)} njësi/muaj
- Të ardhura break-even: ${fmt(calc.bepRevenue)} ALL/muaj
- Marzhi i kontributit: ${fmt(calc.contributionMargin)} ALL/njësi (${Math.round(calc.contributionMarginPct)}%)
${currentUnits ? `- Fitimi/humbja aktuale: ${fmt(calc.currentProfit)} ALL/muaj` : ''}
${currentUnits ? `- Marzhi i sigurisë: ${Math.round(calc.safetyMargin)}% ${calc.aboveBreakEven ? '(mbi break-even)' : '(nën break-even)'}` : ''}

## SI TI ULËSH BREAK-EVEN PIKËN
[3 strategji konkrete për të ulur numrin e njësive të nevojshme — ul kostot fikse, ul koston variabile, rrit çmimin]

## SI TI RRISËSH SHITJET
[3 hapa praktikë për të rritur njësitë e shitura çdo muaj]

## STRUKTURA E KOSTOS
[Analizo nëse kostot fikse janë shumë të larta vs variabilet — 2-3 fjali konkrete]

## REKOMANDIMI KRYESOR
[Një këshillë e vetme, e rëndësishme, specifike për situatën e tyre]

Fol shqip. Ji shumë KONKRET.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert financiar për biznese shqiptare. Analizon strukturën e kostove dhe jep rekomandime konkrete për të rritur përfitueshmërinë. Fol shqip.',
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
        setAiAdvice(fullText)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  function parseSection(text, header) {
    const regex = new RegExp(`## ${header}([\\s\\S]*?)(?:##|$)`, 'i')
    const m = text.match(regex)
    return m ? m[1].trim() : ''
  }

  const canCalc = fixedCosts && sellingPrice && variableCost && parseFloat(sellingPrice) > parseFloat(variableCost)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Analiza Break-Even</h1>
          <p className="text-xs text-gray-400 mt-0.5">Sa duhet të shesësh çdo muaj për të mbuluar kostot?</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Produkti / Shërbimi</label>
          <input type="text" value={productName} onChange={e => setProductName(e.target.value)}
            placeholder="p.sh. Kafe espresso, Orë konsultimi, Produkt X..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-gray-300" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Kostot Fikse Mujore (ALL) <span className="text-rose-400">*</span>
            <span className="font-normal text-gray-400 ml-1">— qiraja, pagat, energji, etj.</span>
          </label>
          <input type="number" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} placeholder="p.sh. 300000"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kosto Variabile/njësi (ALL) <span className="text-rose-400">*</span>
            </label>
            <input type="number" value={variableCost} onChange={e => setVariableCost(e.target.value)} placeholder="materiale, etj."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Çmimi i Shitjes/njësi (ALL) <span className="text-rose-400">*</span>
            </label>
            <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="çmimi juaj"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>

        {parseFloat(sellingPrice) > 0 && parseFloat(variableCost) >= parseFloat(sellingPrice) && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0"/>
            Çmimi i shitjes duhet të jetë MBI koston variabile!
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Njësi të Shitura Aktualisht/muaj <span className="text-gray-400 font-normal">(opsionale)</span>
          </label>
          <input type="number" value={currentUnits} onChange={e => setCurrentUnits(e.target.value)} placeholder="p.sh. 80"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
      </div>

      {calc && (
        <>
          {/* Main BEP result */}
          <div className={`rounded-xl p-5 text-center ${calc.aboveBreakEven ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {calc.aboveBreakEven
                ? <CheckCircle className="w-5 h-5 text-emerald-200"/>
                : <AlertTriangle className="w-5 h-5 text-rose-200"/>}
              <p className="text-sm font-semibold opacity-80">
                {calc.aboveBreakEven ? 'Jeni MBI pikën e break-even!' : 'Duhet të arrini break-even'}
              </p>
            </div>
            <p className="text-4xl font-bold mb-1">{fmt(calc.bepUnits)} njësi</p>
            <p className="text-sm opacity-70">= {fmt(calc.bepRevenue)} ALL/muaj për të mbuluar kostot</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Marzhi Kontributit</p>
              <p className="text-xl font-bold text-gray-900">{fmt(calc.contributionMargin)} ALL</p>
              <p className="text-xs text-gray-400">për çdo njësi të shitur ({Math.round(calc.contributionMarginPct)}%)</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Marzhi Bruto</p>
              <p className="text-xl font-bold text-gray-900">{Math.round(calc.grossMargin)}%</p>
              <p className="text-xs text-gray-400">
                {calc.grossMargin >= 40 ? '✅ Shumë mirë' : calc.grossMargin >= 20 ? '⚠️ Mesatar' : '❌ I ulët'}
              </p>
            </div>
          </div>

          {currentUnits && (
            <div className="card space-y-3">
              <p className="text-sm font-semibold text-gray-900">Pozicioni juaj aktual</p>
              <Gauge
                percent={calc.coveragePercent}
                label={`Mbulim: ${fmt(parseFloat(currentUnits))} / ${fmt(calc.bepUnits)} njësi`}
                color={calc.aboveBreakEven ? 'bg-emerald-500' : 'bg-rose-500'}
              />
              <div className={`rounded-xl p-3 text-sm ${calc.aboveBreakEven ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {calc.aboveBreakEven
                  ? <>Fitimi aktual: <strong>{fmt(calc.currentProfit)} ALL/muaj</strong> — Marzhi sigurisë: <strong>{Math.round(calc.safetyMargin)}%</strong></>
                  : <>Humbja aktuale: <strong>{fmt(Math.abs(calc.currentProfit))} ALL/muaj</strong> — Duhen <strong>{fmt(calc.bepUnits - parseFloat(currentUnits))} njësi</strong> më shumë</>
                }
              </div>
            </div>
          )}

          {!aiAdvice && !loading && (
            <Button onClick={getAiAdvice} variant="outline" className="w-full gap-2 border-rose-200 text-rose-600 hover:bg-rose-50">
              <Sparkles className="w-4 h-4"/>Merr Strategjinë AI
            </Button>
          )}
        </>
      )}

      {loading && (
        <div className="card border border-rose-100 bg-rose-50/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center animate-pulse">
              <Target className="w-4 h-4 text-white"/>
            </div>
            <p className="text-sm font-semibold text-gray-900">Duke analizuar strukturën e kostove...</p>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-3 border border-rose-100 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-rose-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-rose-500"/>Duke menduar...</div>
          )}
        </div>
      )}

      {aiAdvice && (
        <div className="space-y-3">
          {[
            { key: 'SI TI ULËSH BREAK-EVEN PIKËN', color: 'border-blue-200 bg-blue-50/40', label: 'text-blue-700' },
            { key: 'SI TI RRISËSH SHITJET',         color: 'border-emerald-200 bg-emerald-50/40', label: 'text-emerald-700' },
            { key: 'STRUKTURA E KOSTOS',             color: 'border-amber-200 bg-amber-50/40', label: 'text-amber-700' },
            { key: 'REKOMANDIMI KRYESOR',            color: 'border-rose-300 bg-rose-50', label: 'text-rose-700' },
          ].map(({ key, color, label }) => {
            const content = parseSection(aiAdvice, key)
            if (!content) return null
            return (
              <div key={key} className={`rounded-xl border-2 p-4 ${color}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${label}`}>{key}</p>
                <div className="space-y-1.5">
                  {content.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{line.replace(/^[-•\d.]\s*/, '').replace(/\*\*/g, '')}</p>
                  ))}
                </div>
              </div>
            )
          })}
          <Button variant="outline" onClick={() => { setAiAdvice(null) }} className="w-full gap-2">
            <RotateCcw className="w-4 h-4"/>Analizë e re
          </Button>
        </div>
      )}
    </div>
  )
}
