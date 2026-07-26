import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Scale, RefreshCw, Send, AlertCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

const QUICK_QUESTIONS = [
  { label: 'Si regjistrohet një SH.P.K.?', category: 'Regjistrim' },
  { label: 'Çfarë është NIPT dhe si merret?', category: 'Regjistrim' },
  { label: 'Kur duhet të regjistrohem për TVSH?', category: 'TVSH' },
  { label: 'Si llogaritet sigurim shoqëror për punëmarrësin?', category: 'Punësim' },
  { label: 'Çfarë kontrate duhet të kem me punonjësin?', category: 'Punësim' },
  { label: 'Sa është tatimi mbi fitimin për bizneset e vogla?', category: 'Tatim' },
  { label: 'Kur duhet të dorëzoj pasqyrat financiare?', category: 'Raportim' },
  { label: 'Si bëhet dërgimi i punonjësit në pushim vjetor?', category: 'Punësim' },
  { label: 'Çfarë duhet di për tatimin e thjeshtëzuar?', category: 'Tatim' },
  { label: 'A mund të punësoj të huaj në Shqipëri?', category: 'Punësim' },
  { label: 'Si bëhet ndryshimi i adresës së biznesit?', category: 'Regjistrim' },
  { label: 'Çfarë gjobash ka nëse nuk deklaroj TVSH-në në kohë?', category: 'TVSH' },
]

function AnswerCard({ qa, onRemove }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="card border border-purple-100">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-start justify-between gap-3 text-left">
        <p className="text-sm font-semibold text-gray-900 flex-1">{qa.question}</p>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
        </div>
      </button>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {qa.answer}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LegalAdvisorPage() {
  const { profile } = useAuth()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [history, setHistory] = useState([])
  const [currentQ, setCurrentQ] = useState('')

  async function ask(q) {
    const qText = (q || question).trim()
    if (!qText) return
    setCurrentQ(qText)
    setQuestion('')
    setLoading(true)
    setStreamingText('')

    const prompt = `Pyetje ligjore/fiskale nga pronari i biznesit "${profile?.business_name || ''}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}:

"${qText}"

Përgjigju si këshilltar ligjor dhe fiskal i specializuar për bizneset shqiptare. Jep:
1. Përgjigjen e drejtpërdrejtë dhe të qartë
2. Bazën ligjore (ligji, neni, rregullorja nëse e di)
3. Hapat praktikë që duhet të ndërmarrë
4. Çfarë duhet shmangur (gabime të zakonshme)

Fol shqip. Ji KONKRET dhe PRAKTIK. Mos tepro me rezervat juridike, por shto një shënim të shkurtër nëse çështja kërkon konsultim profesional.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je këshilltar ligjor dhe fiskal i specializuar për bizneset shqiptare të vogla dhe të mesme. Njeh mirë legjislacionin shqiptar: Kodin Civil, Ligjin për TVSH-në, Kodin e Punës, Ligjin për Tatimin mbi Fitimin dhe Ligjin për Sigurimet Shoqërore. Jep përgjigje praktike, konkrete dhe të kuptueshme. Fol shqip gjithmonë.',
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
        setHistory(prev => [{ question: qText, answer: fullText }, ...prev])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText(''); setCurrentQ('') }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/legal" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Këshilltar Ligjor AI</h1>
          <p className="text-xs text-gray-400 mt-0.5">Pyetje ligjore & fiskale për biznesin tuaj</p>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>
        <p className="text-xs text-amber-800">Informacioni është orientues dhe bazohet në legjislacionin shqiptar. Për çështje të rëndësishme, konsultohuni me avokat ose kontabilist të licencuar.</p>
      </div>

      {/* Question input */}
      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Pyetja juaj</label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) ask() }}
          placeholder="p.sh. Si regjistrohem për TVSH? Çfarë kontrate duhet me punonjësin? Sa është gjoba për deklarim të vonë?..."
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-300 resize-none"
        />
        <Button onClick={() => ask()} disabled={!question.trim() || loading}
          className="mt-3 w-full gap-2 bg-purple-600 hover:bg-purple-700" size="lg">
          <Send className="w-4 h-4"/>Pyet Këshilltarin
        </Button>
      </div>

      {/* Quick questions */}
      <div className="card">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Pyetje të shpeshta</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(q => (
            <button key={q.label} onClick={() => ask(q.label)} disabled={loading}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-700 rounded-full font-medium transition-all disabled:opacity-50">
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Streaming answer */}
      {(loading || streamingText) && (
        <div className="card border border-purple-100 bg-purple-50/30">
          {currentQ && <p className="text-sm font-semibold text-gray-900 mb-3">"{currentQ}"</p>}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center animate-pulse">
              <Scale className="w-4 h-4 text-white"/>
            </div>
            <p className="text-sm text-gray-600">Duke kërkuar përgjigjen...</p>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-purple-100 max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {streamingText}<span className="inline-block w-1 h-4 bg-purple-500 ml-0.5 animate-pulse"/>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-500"/>Duke menduar...
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pyetjet e mëparshme</p>
            <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-red-500">
              <RotateCcw className="w-3 h-3 inline mr-1"/>Fshi historikun
            </button>
          </div>
          {history.map((qa, i) => <AnswerCard key={i} qa={qa} />)}
        </div>
      )}
    </div>
  )
}
