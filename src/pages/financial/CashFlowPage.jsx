import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, BarChart3, Plus, Trash2, RefreshCw, Sparkles, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MONTHS = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']

const INCOME_CATS = ['Shitje Produktesh','Shërbime','Qira e Pronës','Komisione','Subvencione','Të tjera']
const EXPENSE_CATS = ['Qiraja','Pagat & Sigurimet','Mallra & Furnizime','Energji & Ujë','Marketing & Reklama','Tatimi & TVSH','Transport','Shërbime bankare','Shpenzime të tjera']

function fmt(n) { return Math.round(n).toLocaleString('sq-AL') }

function Row({ item, onChange, onDelete, categories }) {
  return (
    <div className="flex items-center gap-2">
      <select value={item.category} onChange={e => onChange({ ...item, category: e.target.value })}
        className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
        {categories.map(c => <option key={c}>{c}</option>)}
      </select>
      <div className="relative w-36">
        <input type="number" value={item.amount} onChange={e => onChange({ ...item, amount: e.target.value })}
          placeholder="0"
          className="w-full px-2 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-right" />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">ALL</span>
      </div>
      <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`}/>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      </div>
      <p className={`text-xl font-bold ${color}`}>{fmt(value)} ALL</p>
    </div>
  )
}

export default function CashFlowPage() {
  const { profile } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [incomes, setIncomes] = useState([{ id: 1, category: 'Shitje Produktesh', amount: '' }])
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Qiraja', amount: '' },
    { id: 2, category: 'Pagat & Sigurimet', amount: '' },
    { id: 3, category: 'Mallra & Furnizime', amount: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState(null)

  let nextId = 100

  const totalIncome = useMemo(() => incomes.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0), [incomes])
  const totalExpense = useMemo(() => expenses.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0), [expenses])
  const netProfit = totalIncome - totalExpense
  const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

  function addIncome() {
    setIncomes(prev => [...prev, { id: Date.now(), category: 'Të tjera', amount: '' }])
  }
  function addExpense() {
    setExpenses(prev => [...prev, { id: Date.now(), category: 'Shpenzime të tjera', amount: '' }])
  }

  async function analyze() {
    setLoading(true)
    setStreamingText('')
    setAiAnalysis(null)

    const incomeLines = incomes.filter(r => r.amount).map(r => `- ${r.category}: ${fmt(parseFloat(r.amount))} ALL`).join('\n')
    const expenseLines = expenses.filter(r => r.amount).map(r => `- ${r.category}: ${fmt(parseFloat(r.amount))} ALL`).join('\n')

    const prompt = `Analizë financiare për ${MONTHS[month]} ${year} — biznes "${profile?.business_name || 'imi'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

TË ARDHURA (Total: ${fmt(totalIncome)} ALL):
${incomeLines || '- Asnjë e dhënë'}

SHPENZIME (Total: ${fmt(totalExpense)} ALL):
${expenseLines || '- Asnjë e dhënë'}

FITIMI NETO: ${fmt(netProfit)} ALL
MARZHI: ${Math.round(margin)}%

Analizë financiare:

## VLERËSIMI I GJENDJES
[Vlerëso gjendjen financiare — a është e shëndetshme, mesatare ose shqetësuese? 2-3 fjali konkrete]

## PIKAT POZITIVE
[2-3 gjëra pozitive nga numrat e lartpërmendur]

## SHQETËSIMET
[2-3 shqetësime ose rreziqe financiare specifike]

## 3 VEPRIME TË MENJËHERSHME
[3 hapa konkretë me ndikim të lartë që mund të bësh brenda 30 ditëve për të përmirësuar gjendjen]

## KRAHASIM ME INDUSTRINË
[Si krahasohen këto numra me biznese të ngjashme në ${profile?.city || 'Shqipëri'}?]

Fol shqip. Ji KONKRET — numra, përqindje, hapa praktikë.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert financiar për biznese shqiptare të vogla dhe të mesme. Analizon të dhënat financiare dhe jep rekomandime konkrete dhe të zbatueshme. Fol shqip.',
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

  const hasData = totalIncome > 0 || totalExpense > 0

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Pasqyrë Financiare</h1>
          <p className="text-xs text-gray-400 mt-0.5">Regjistro të ardhura & shpenzime — merr analizën AI</p>
        </div>
      </div>

      {/* Month selector */}
      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Muaji</label>
        <div className="grid grid-cols-6 gap-1.5">
          {MONTHS.map((m, i) => (
            <button key={i} onClick={() => setMonth(i)}
              className={`py-1.5 text-xs rounded-lg border-2 font-medium transition-all ${month === i ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {m.slice(0,3)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards — always visible */}
      {hasData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Të Ardhura" value={totalIncome} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
          <SummaryCard label="Shpenzime" value={totalExpense} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50" />
          <div className={`rounded-xl p-4 ${netProfit >= 0 ? 'bg-blue-600' : 'bg-red-600'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Minus className="w-4 h-4 text-white/70"/>
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">Fitim Neto</p>
            </div>
            <p className="text-xl font-bold text-white">{fmt(netProfit)} ALL</p>
          </div>
          <div className="rounded-xl p-4 bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Marzhi</p>
            <p className={`text-xl font-bold ${margin >= 20 ? 'text-emerald-600' : margin >= 10 ? 'text-amber-600' : 'text-rose-600'}`}>{Math.round(margin)}%</p>
          </div>
        </div>
      )}

      {/* Income section */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900">Të Ardhura</label>
            <p className="text-xs text-gray-400">Burimet e të ardhurave këtë muaj</p>
          </div>
          <span className="text-sm font-bold text-emerald-600">{fmt(totalIncome)} ALL</span>
        </div>
        <div className="space-y-2">
          {incomes.map(row => (
            <Row key={row.id} item={row} categories={INCOME_CATS}
              onChange={updated => setIncomes(prev => prev.map(r => r.id === row.id ? updated : r))}
              onDelete={() => setIncomes(prev => prev.filter(r => r.id !== row.id))} />
          ))}
        </div>
        <button onClick={addIncome} className="mt-3 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium">
          <Plus className="w-3.5 h-3.5"/>Shto burim të ardhurash
        </button>
      </div>

      {/* Expense section */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900">Shpenzime</label>
            <p className="text-xs text-gray-400">Shpenzimet e muajit</p>
          </div>
          <span className="text-sm font-bold text-rose-600">{fmt(totalExpense)} ALL</span>
        </div>
        <div className="space-y-2">
          {expenses.map(row => (
            <Row key={row.id} item={row} categories={EXPENSE_CATS}
              onChange={updated => setExpenses(prev => prev.map(r => r.id === row.id ? updated : r))}
              onDelete={() => setExpenses(prev => prev.filter(r => r.id !== row.id))} />
          ))}
        </div>
        <button onClick={addExpense} className="mt-3 flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 font-medium">
          <Plus className="w-3.5 h-3.5"/>Shto shpenzim
        </button>
      </div>

      {hasData && !aiAnalysis && !loading && (
        <Button onClick={analyze} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" size="lg">
          <Sparkles className="w-5 h-5"/>Analizoje me AI
        </Button>
      )}

      {loading && (
        <div className="card border border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center animate-pulse">
              <BarChart3 className="w-4 h-4 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke analizuar financat tuaja...</p>
              <p className="text-xs text-gray-400">{MONTHS[month]} {year}</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-3 border border-emerald-100 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-emerald-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-emerald-500"/>Duke menduar...</div>
          )}
        </div>
      )}

      {aiAnalysis && (
        <div className="space-y-3">
          {[
            { key: 'VLERËSIMI I GJENDJES', color: 'border-blue-200 bg-blue-50/40', label: 'text-blue-700' },
            { key: 'PIKAT POZITIVE',        color: 'border-emerald-200 bg-emerald-50/40', label: 'text-emerald-700' },
            { key: 'SHQETËSIMET',           color: 'border-rose-200 bg-rose-50/40', label: 'text-rose-700' },
            { key: '3 VEPRIME TË MENJËHERSHME', color: 'border-violet-200 bg-violet-50/40', label: 'text-violet-700' },
            { key: 'KRAHASIM ME INDUSTRINË', color: 'border-amber-200 bg-amber-50/40', label: 'text-amber-700' },
          ].map(({ key, color, label }) => {
            const content = parseSection(aiAnalysis, key)
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
          <Button variant="outline" onClick={() => setAiAnalysis(null)} className="w-full gap-2">
            <RotateCcw className="w-4 h-4"/>Analizë e re
          </Button>
        </div>
      )}
    </div>
  )
}
