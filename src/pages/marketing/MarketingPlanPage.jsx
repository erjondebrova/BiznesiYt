import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { TrendingUp, ArrowLeft, Sparkles, Check, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlanLimits } from '../../hooks/usePlanLimits'
import LimitReachedPopup from '../../components/LimitReachedPopup'

const QUESTIONS = [
  { id: 'goal', label: 'Cili është qëllimi kryesor i marketingut tuaj?', type: 'select',
    options: ['Rritja e shitjeve', 'Gjetja e klientëve të rinj', 'Ndërtimi i brandingut', 'Rritja e besnikërisë', 'Hapja e tregut të ri'] },
  { id: 'budget', label: 'Çfarë buxheti keni për marketing në muaj?', type: 'select',
    options: ['Nën 5,000 ALL', '5,000 - 20,000 ALL', '20,000 - 50,000 ALL', '50,000 - 100,000 ALL', 'Mbi 100,000 ALL'] },
  { id: 'channels', label: 'Cilat kanale komunikimi përdorni aktualisht?', type: 'text',
    placeholder: 'p.sh. Instagram, WhatsApp, fjalë e gojës...' },
  { id: 'audience', label: 'Kush është klienti juaj ideal?', type: 'textarea',
    placeholder: 'Mosha, gjinia, profesioni, interesat, ku jetojnë...' },
  { id: 'differentiator', label: 'Çfarë ju dallon nga konkurrentët?', type: 'textarea',
    placeholder: 'Çmimet, cilësia, shpejtësia, shërbimi, eksperienca...' },
]

export default function MarketingPlanPage() {
  const { profile } = useAuth()
  const { checkLimit, incrementUsage } = usePlanLimits()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkedTasks, setCheckedTasks] = useState({})
  const [limitPopup, setLimitPopup] = useState(null)

  function updateAnswer(id, val) {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  async function generatePlan() {
    const { allowed, used, limit } = checkLimit('marketing_plans')
    if (!allowed) {
      setLimitPopup({ feature: 'marketing_plans', used, limit })
      return
    }
    setLoading(true)
    try {
      const prompt = `Gjenero një plan marketingu 30-ditor për:
Biznesi: ${profile?.business_name || 'E papërcaktuar'}
Industria: ${profile?.industry || 'E papërcaktuar'}
Qyteti: ${profile?.city || 'E papërcaktuar'}
Qëllimi: ${answers.goal || ''}
Buxheti: ${answers.budget || ''}
Kanalet aktuale: ${answers.channels || ''}
Audienca target: ${answers.audience || ''}
Diferenciator: ${answers.differentiator || ''}

Gjenero një plan konkret 30-ditor me detyra javore. Formati:
## Java 1: [Titulli]
- [ ] Detyra 1
- [ ] Detyra 2
...
## Java 2: ...
(vazhdoni për javën 3 dhe 4)

Jep detyra KONKRETE dhe VEPRUESE, jo gjenerike. Çdo javë 4-6 detyra.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert marketingu për biznese shqiptare. Fol shqip. Jep plane konkrete.',
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
        setPlan(fullText)
        if (fullText) await incrementUsage('marketing_plans')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function toggleTask(key) {
    setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function renderPlan(text) {
    const lines = text.split('\n')
    let result = []
    let weekKey = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('## ')) {
        result.push(
          <h3 key={i} className="font-heading font-semibold text-gray-900 mt-5 mb-2 text-base">{line.slice(3)}</h3>
        )
        weekKey++
      } else if (line.startsWith('- [ ] ')) {
        const taskKey = `${weekKey}-${i}`
        const taskText = line.slice(6)
        result.push(
          <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
            onClick={() => toggleTask(taskKey)}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${checkedTasks[taskKey] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {checkedTasks[taskKey] && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm cursor-pointer ${checkedTasks[taskKey] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {taskText}
            </span>
          </div>
        )
      } else if (line.trim()) {
        result.push(<p key={i} className="text-sm text-gray-600 mb-1">{line}</p>)
      }
    }
    return result
  }

  if (plan) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        {limitPopup && <LimitReachedPopup {...limitPopup} onClose={() => setLimitPopup(null)} />}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setPlan(null)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-heading text-xl font-bold text-gray-900">Plani juaj i Marketingut</h1>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-gray-900">Plan 30-ditor për {profile?.business_name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPlan(null)}>
              Ri-gjenero
            </Button>
          </div>
          <div className="divide-y divide-gray-50">{renderPlan(plan)}</div>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[step]

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {limitPopup && <LimitReachedPopup {...limitPopup} onClose={() => setLimitPopup(null)} />}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-xl font-bold text-gray-900">Plan Marketingu AI</h1>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {QUESTIONS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="card">
        <div className="text-xs text-gray-400 mb-2">Pyetja {step + 1} nga {QUESTIONS.length}</div>
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-5">{q.label}</h2>

        {q.type === 'select' && (
          <div className="space-y-2">
            {q.options.map(opt => (
              <div key={opt}
                onClick={() => updateAnswer(q.id, opt)}
                className={`p-3 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium ${answers[q.id] === opt ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                {opt}
              </div>
            ))}
          </div>
        )}

        {q.type === 'text' && (
          <Input
            placeholder={q.placeholder}
            value={answers[q.id] || ''}
            onChange={e => updateAnswer(q.id, e.target.value)}
          />
        )}

        {q.type === 'textarea' && (
          <Textarea
            placeholder={q.placeholder}
            value={answers[q.id] || ''}
            onChange={e => updateAnswer(q.id, e.target.value)}
            rows={4}
          />
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>Kthehu</Button>
          )}
          {step < QUESTIONS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="ml-auto gap-2"
              disabled={!answers[q.id]}>
              Vazhdo <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={generatePlan} className="ml-auto gap-2" disabled={loading}>
              {loading ? 'Duke gjeneruar...' : 'Gjenero Planin'}
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
