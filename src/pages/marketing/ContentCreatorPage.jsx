import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ArrowLeft, Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import { usePlanLimits } from '../../hooks/usePlanLimits'
import LimitReachedPopup from '../../components/LimitReachedPopup'

const CHANNELS = [
  { value: 'instagram', label: '📸 Instagram', desc: 'Post ose Story' },
  { value: 'facebook', label: '👍 Facebook', desc: 'Post ose Ad' },
  { value: 'google_ads', label: '🔍 Google Ads', desc: 'Reklamë tekstuale' },
  { value: 'sms', label: '💬 SMS Marketing', desc: 'Mesazh i shkurtër' },
  { value: 'tiktok', label: '🎵 TikTok', desc: 'Caption video' },
  { value: 'linkedin', label: '💼 LinkedIn', desc: 'Post profesional' },
]

function ContentVariant({ variant, index }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(variant)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Varianti {index + 1}</span>
        <Button variant="ghost" size="sm" onClick={copy} className="gap-1.5 text-xs">
          {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Kopjuar!</> : <><Copy className="w-3.5 h-3.5" /> Kopjo</>}
        </Button>
      </div>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{variant}</p>
    </div>
  )
}

export default function ContentCreatorPage() {
  const { profile } = useAuth()
  const { checkLimit, incrementUsage } = usePlanLimits()
  const [channel, setChannel] = useState('')
  const [promotion, setPromotion] = useState('')
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(false)
  const [limitPopup, setLimitPopup] = useState(null)

  async function generate() {
    if (!channel || !promotion) return

    const { allowed, used, limit } = checkLimit('content_posts')
    if (!allowed) {
      setLimitPopup({ feature: 'content_posts', used, limit })
      return
    }

    setLoading(true)
    setVariants([])

    const channelLabel = CHANNELS.find(c => c.value === channel)?.label || channel

    const prompt = `Krijo 3 variante të ndryshme të një postimi për ${channelLabel} për biznesin "${profile?.business_name || 'biznesi ynë'}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Çfarë dëshirojmë të promovojmë: ${promotion}

Rregullat:
- Fol shqip
- Çdo variant duhet të jetë i ndryshëm nga tjetri (ton, strukturë)
- ${channel === 'instagram' ? 'Përfshi 5-8 hashtag shqiptare dhe globale të lidhura' : ''}
- ${channel === 'sms' ? 'Maksimumi 160 karaktere' : ''}
- ${channel === 'google_ads' ? 'Titulli max 30 karaktere, përshkrimi max 90 karaktere' : ''}
- Përfshi një CTA (thirrje për veprim) të fortë
- Ji autentik dhe i lidhur me tregun shqiptar

Formati: Shkruani direkt 3 variantet, të ndara me "---"`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i content marketing-ut për biznese shqiptare. Fol shqip gjithmonë.',
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
        const parts = fullText.split('---').map(s => s.trim()).filter(Boolean)
        const finalVariants = parts.slice(0, 3)
        setVariants(finalVariants)
        if (finalVariants.length > 0) await incrementUsage('content_posts')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {limitPopup && <LimitReachedPopup {...limitPopup} onClose={() => setLimitPopup(null)} />}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-xl font-bold text-gray-900">Krijues Përmbajtjesh AI</h1>
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div>
            <Label>Kanali</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {CHANNELS.map(c => (
                <div key={c.value}
                  onClick={() => setChannel(c.value)}
                  className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${channel === c.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-sm font-medium text-gray-800">{c.label}</div>
                  <div className="text-xs text-gray-400">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Çfarë dëshironi të promovoni?</Label>
            <Textarea
              placeholder="p.sh. Ofertë speciale fundjavore — 20% zbritje në të gjitha pjatat, vetëm të shtunën dhe të dielën..."
              value={promotion}
              onChange={e => setPromotion(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <Button onClick={generate} disabled={!channel || !promotion || loading} className="w-full gap-2">
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />Duke gjeneruar variantet...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Gjenero 3 Variante</>
            )}
          </Button>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-gray-900">Variantet e Gjeneruara</h2>
          {variants.map((v, i) => <ContentVariant key={i} variant={v} index={i} />)}
          <Button variant="outline" onClick={generate} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" /> Ri-gjenero variante të reja
          </Button>
        </div>
      )}
    </div>
  )
}
