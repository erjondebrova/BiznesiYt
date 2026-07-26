import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Calculator, RefreshCw, Check, RotateCcw, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'

const SEGMENTS = [
  { id: 'budget',    label: '💰 Ekonomik',  desc: 'Çmim i ulët, volum i lartë' },
  { id: 'mid',      label: '⚖️ Mesatar',   desc: 'Raport i mirë çmim-cilësi' },
  { id: 'premium',  label: '💎 Premium',   desc: 'Cilësi e lartë, marzh i lartë' },
]

function StatCard({ label, value, sub, color, highlight }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-50 border border-gray-100'}`}>
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

function formatAll(n) {
  return Math.round(n).toLocaleString('sq-AL') + ' ALL'
}

export default function PricingCalculatorPage() {
  const { profile } = useAuth()
  const [product, setProduct] = useState('')
  const [cost, setCost] = useState('')
  const [overhead, setOverhead] = useState('')
  const [units, setUnits] = useState('')
  const [margin, setMargin] = useState('30')
  const [competitorPrice, setCompetitorPrice] = useState('')
  const [segment, setSegment] = useState('mid')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [aiAdvice, setAiAdvice] = useState(null)
  const [calculated, setCalculated] = useState(null)

  function calculate() {
    const costNum = parseFloat(cost) || 0
    const overheadNum = parseFloat(overhead) || 0
    const unitsNum = parseFloat(units) || 1
    const marginNum = parseFloat(margin) || 30
    const compNum = parseFloat(competitorPrice) || 0

    const totalCostPerUnit = costNum + (overheadNum / unitsNum)
    const marginDecimal = marginNum / 100
    const recommendedPrice = totalCostPerUnit / (1 - marginDecimal)
    const minPrice = totalCostPerUnit * 1.05
    const premiumPrice = recommendedPrice * (segment === 'premium' ? 1.4 : segment === 'mid' ? 1.2 : 1.1)
    const actualMargin = ((recommendedPrice - totalCostPerUnit) / recommendedPrice) * 100
    const profitPerUnit = recommendedPrice - totalCostPerUnit

    setCalculated({
      totalCostPerUnit,
      recommendedPrice,
      minPrice,
      premiumPrice,
      actualMargin,
      profitPerUnit,
      competitorDiff: compNum ? ((recommendedPrice - compNum) / compNum) * 100 : null,
    })
    setAiAdvice(null)
  }

  async function getAiAdvice() {
    if (!calculated) return
    setLoading(true)
    setStreamingText('')
    setAiAdvice(null)

    const prompt = `Jam pronar i një biznesi "${profile?.business_name || ''}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Produkti/Shërbimi: ${product || 'produkti im'}
Kosto totale për njësi: ${Math.round(calculated.totalCostPerUnit)} ALL
Çmimi i rekomanduar (marzhi ${margin}%): ${Math.round(calculated.recommendedPrice)} ALL
Çmimi minimal: ${Math.round(calculated.minPrice)} ALL
Segmenti i tregut: ${SEGMENTS.find(s => s.id === segment)?.label}
${competitorPrice ? `Çmimi i konkurrentit: ${competitorPrice} ALL (ndryshimi: ${calculated.competitorDiff > 0 ? '+' : ''}${Math.round(calculated.competitorDiff)}%)` : ''}

Jep analizë të shkurtër strategjike:

## POZICIONIMI
[Si të pozicionohet ky çmim në treg — 2-3 fjali]

## ÇMIME PSIKOLOGJIKE
[2-3 sugjerime konkrete për çmime psikologjike — p.sh. 1,990 ALL vs 2,000 ALL, paketat, bundles]

## STRATEGJI ÇMIMESH
[3 pika konkrete: kur të ulësh, kur të rrisësh, si të diferenciohesh]

## PARALAJMËRIME
[1-2 rreziqe specifike të çmimit të zgjedhur dhe si t'i shmangësh]

Fol shqip. Ji KONKRET dhe PRAKTIK.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i strategjisë financiare dhe çmimeve për biznese shqiptare. Jep këshilla praktike dhe konkrete. Fol shqip.',
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

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Llogaritës Çmimesh</h1>
          <p className="text-xs text-gray-400 mt-0.5">Gjej çmimin optimal dhe analizën strategjike</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Produkti / Shërbimi</label>
          <input type="text" value={product} onChange={e => setProduct(e.target.value)}
            placeholder="p.sh. Kurs gatimi online, Bluza me logo, Shërbim pastrim..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-300" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kosto për njësi (ALL) <span className="text-red-400">*</span></label>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Shpenzime fikse/muaj (ALL)</label>
            <input type="number" value={overhead} onChange={e => setOverhead(e.target.value)} placeholder="0"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        {overhead && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Njësi të shitura / muaj (est.)</label>
            <input type="number" value={units} onChange={e => setUnits(e.target.value)} placeholder="p.sh. 50"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Marzhi i dëshiruar: <span className="text-blue-600 font-bold">{margin}%</span>
          </label>
          <input type="range" min="5" max="80" value={margin} onChange={e => setMargin(e.target.value)} className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5%</span><span>80%</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Çmimi i konkurrentit (ALL)</label>
            <input type="number" value={competitorPrice} onChange={e => setCompetitorPrice(e.target.value)} placeholder="opsionale"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Segmenti</label>
            <select value={segment} onChange={e => setSegment(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
              {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <Button onClick={calculate} disabled={!cost} className="w-full gap-2 bg-blue-600 hover:bg-blue-700" size="lg">
          <Calculator className="w-5 h-5"/>Llogarit Çmimin
        </Button>
      </div>

      {calculated && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Çmimi Minimal" value={formatAll(calculated.minPrice)} sub="+5% mbi kosto" />
            <StatCard label="Çmimi i Rekomanduar" value={formatAll(calculated.recommendedPrice)} sub={`Marzhi ${Math.round(calculated.actualMargin)}%`} highlight />
            <StatCard label="Fitimi për Njësi" value={formatAll(calculated.profitPerUnit)} sub="pas kostos" />
            <StatCard label="Çmimi Premium" value={formatAll(calculated.premiumPrice)} sub="nëse ka vlerë shtuar" />
          </div>

          {calculated.competitorDiff !== null && (
            <div className={`rounded-xl p-3 flex items-center gap-3 ${Math.abs(calculated.competitorDiff) < 5 ? 'bg-green-50 border border-green-100' : calculated.competitorDiff > 15 ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50 border border-blue-100'}`}>
              <AlertCircle className={`w-4 h-4 flex-shrink-0 ${Math.abs(calculated.competitorDiff) < 5 ? 'text-green-500' : calculated.competitorDiff > 15 ? 'text-amber-500' : 'text-blue-500'}`}/>
              <p className="text-sm text-gray-700">
                Çmimi yt është <strong>{calculated.competitorDiff > 0 ? '+' : ''}{Math.round(calculated.competitorDiff)}%</strong> {calculated.competitorDiff > 0 ? 'mbi' : 'nën'} çmimin e konkurrentit.
                {Math.abs(calculated.competitorDiff) < 5 && ' Jeni të krahasueshëm — mirë!'}
                {calculated.competitorDiff > 20 && ' Sigurohuni që klientët njohin vlerën shtesë.'}
                {calculated.competitorDiff < -20 && ' Rrezikoni të perceptoheni si produkt i cilësisë së ulët.'}
              </p>
            </div>
          )}

          {!aiAdvice && !loading && (
            <Button onClick={getAiAdvice} variant="outline" className="w-full gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
              <Sparkles className="w-4 h-4"/>Merr Analizën Strategjike AI
            </Button>
          )}

          {loading && (
            <div className="card border border-blue-100 bg-blue-50/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                  <Calculator className="w-4 h-4 text-white"/>
                </div>
                <p className="text-sm font-semibold text-gray-900">Duke analizuar strategjinë e çmimeve...</p>
              </div>
              {streamingText ? (
                <div className="bg-white rounded-xl p-3 border border-blue-100 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {streamingText}<span className="inline-block w-1 h-4 bg-blue-500 ml-0.5 animate-pulse"/>
                  </pre>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-blue-500"/>Duke menduar...</div>
              )}
            </div>
          )}

          {aiAdvice && (
            <div className="space-y-3">
              {['POZICIONIMI','ÇMIME PSIKOLOGJIKE','STRATEGJI ÇMIMESH','PARALAJMËRIME'].map((header, i) => {
                const content = parseSection(aiAdvice, header)
                if (!content) return null
                const colors = [
                  'border-blue-200 bg-blue-50/40',
                  'border-violet-200 bg-violet-50/40',
                  'border-emerald-200 bg-emerald-50/40',
                  'border-amber-200 bg-amber-50/40',
                ]
                const labelColors = ['text-blue-700','text-violet-700','text-emerald-700','text-amber-700']
                return (
                  <div key={header} className={`rounded-xl border-2 p-4 ${colors[i]}`}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${labelColors[i]}`}>{header}</p>
                    <div className="space-y-1.5">
                      {content.split('\n').filter(l => l.trim()).map((line, j) => (
                        <p key={j} className="text-sm text-gray-700 leading-relaxed">{line.replace(/^[-•]\s*/, '').replace(/\*\*/g, '')}</p>
                      ))}
                    </div>
                  </div>
                )
              })}
              <Button variant="outline" onClick={() => { setAiAdvice(null); setCalculated(null) }} className="w-full gap-2">
                <RotateCcw className="w-4 h-4"/>Llogarit Produkt tjetër
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
