import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { ArrowLeft, Sparkles, Plus, X, RefreshCw, TrendingUp, AlertTriangle, Target } from 'lucide-react'

export default function CompetitorPage() {
  const { profile } = useAuth()
  const [competitors, setCompetitors] = useState(['', '', ''])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  function updateCompetitor(i, val) {
    setCompetitors(prev => prev.map((c, idx) => idx === i ? val : c))
  }

  async function analyze() {
    const validComps = competitors.filter(c => c.trim())
    if (!validComps.length) return
    setLoading(true)
    setAnalysis(null)

    const prompt = `Analizoni konkurrencën për biznesin "${profile?.business_name || 'e papërcaktuar'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Konkurrentët për t'u analizuar:
${validComps.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Bazuar në njohuritë tuaja të industrisë, kryeni një analizë SWOT dhe konkurrence duke nxjerrë:

## Pikat e Forta të Konkurrentëve
[lista]

## Dobësitë e Konkurrentëve
[lista]

## Mundësitë për Biznesin Tonë
[lista]

## Rreziqet dhe Kërcënimet
[lista]

## Rekomandimet Strategjike
[3-5 rekomandime konkrete]

Jepni përgjigje konkrete bazuar në industrinë dhe tregun shqiptar.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je analist i tregjeve shqiptare. Fol shqip. Jep analiza konkrete.',
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
              if (delta) fullText += delta
            } catch {}
          }
        }
        setAnalysis(fullText)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function renderAnalysis(text) {
    const sections = text.split(/^## /m).filter(Boolean)
    const icons = {
      'Pikat e Forta': { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      'Dobësitë': { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
      'Mundësitë': { icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      'Rreziqet': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
      'Rekomandimet': { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    }

    return sections.map((section, i) => {
      const lines = section.split('\n')
      const title = lines[0].trim()
      const content = lines.slice(1).join('\n').trim()
      const iconKey = Object.keys(icons).find(k => title.includes(k))
      const style = icons[iconKey] || { icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
      const Icon = style.icon

      return (
        <div key={i} className={`card border ${style.border} ${style.bg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className={`w-4 h-4 ${style.color}`} />
            <h3 className={`font-heading font-semibold ${style.color}`}>{title}</h3>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
        </div>
      )
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-xl font-bold text-gray-900">Analizë Konkurrence</h1>
      </div>

      <div className="card mb-6">
        <Label className="mb-3 block">Emrat e Konkurrentëve (1-3)</Label>
        <div className="space-y-3">
          {competitors.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-sm text-gray-400 w-4">{i + 1}.</span>
              <Input
                placeholder={`Konkurrenti ${i + 1} (emri ose URL)`}
                value={c}
                onChange={e => updateCompetitor(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        <Button onClick={analyze} disabled={!competitors.some(c => c.trim()) || loading}
          className="w-full mt-4 gap-2">
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" />Duke analizuar...</>
          ) : (
            <><Sparkles className="w-4 h-4" />Analizoni Konkurrencën</>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-gray-900">Rezultatet e Analizës</h2>
          {renderAnalysis(analysis)}
          <Button variant="outline" onClick={analyze} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" /> Analizoni sërish
          </Button>
        </div>
      )}
    </div>
  )
}
