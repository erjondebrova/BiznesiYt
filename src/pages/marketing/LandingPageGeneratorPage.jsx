import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { ArrowLeft, Globe, RefreshCw, Download, Eye, RotateCcw, Maximize2, X } from 'lucide-react'

const TONES = [
  { id: 'professional', label: '👔 Profesional' },
  { id: 'friendly',     label: '😊 Miqësor'     },
  { id: 'urgent',       label: '🔥 Urgjent'      },
  { id: 'luxury',       label: '💎 Premium'      },
  { id: 'simple',       label: '✨ Minimal'      },
]

function buildHtmlPrompt({ businessName, industry, city, service, audience, offer, tone }) {
  return `Gjenero një Landing Page të plotë në HTML dhe CSS për biznesin e mëposhtëm. Kthe VETËM kodin HTML — asgjë tjetër.

BIZNESI: ${businessName} (${industry}, ${city})
PRODUKTI/SHËRBIMI: ${service}
AUDIENCA: ${audience || 'klientë të interesuar'}
OFERTA KRYESORE: ${offer || service}
TONI: ${tone}

KËRKESAT TEKNIKE:
- Dokument HTML i vetëmbajtur (gjithçka inline — CSS brenda <style> në <head>)
- Mobile responsive (meta viewport, flexbox/grid)
- Pa JavaScript të jashtëm, pa CDN — punon offline
- Font: system-ui ose sans-serif
- Ngjyrat: moderne, kontrastuese, profesionale

STRUKTURA E DETYRUESHME (të gjitha seksionet):

1. HERO SECTION
   - Navbar e thjeshtë me emrin e biznesit + CTA button
   - Headline kryesor i fuqishëm (max 10 fjalë)
   - Subheadline shpjeguese (1-2 fjali)
   - Dy butona CTA (kryesor + dytësor)
   - Visual element (gradient background ose shape)

2. BENEFITET (3 kolona)
   - Emoji + titull + shpjegim 2-3 fjali për secilën

3. SI FUNKSIONON (3 hapa)
   - Hapi 1, 2, 3 me ikonë numri + titull + shpjegim

4. TESTIMONIALE (3 karta)
   - Foto placeholder (emoji avatar), emër, pozicion, citat

5. CTA SEKSIONI I MESËM
   - Background ngjyrë e fortë
   - Headline bindës + buton i madh

6. FAQ (4 pyetje/përgjigje)
   - Accordion vizual (CSS-only, pa JS)

7. FOOTER CTA FINAL
   - Headline + buton + garanci/trust signal

8. FOOTER
   - Emri biznesi + kontakt placeholder + copyright

NGJYRAT: Zgjidh një paletë moderne që i shkon ${industry}. Shmang gri boring.
GJUHA: Shqip — tekste reale, jo placeholder si "Lorem ipsum"
CILËSIA: Si një faqe profesionale $500+ — jo template i thjeshtë`
}

function downloadHTML(html, businessName) {
  const readme = `<!--
UDHËZIME PËR PUBLIKIM
======================
Faqja juaj u krijua nga BiznesiYt.al

SI TA NGARKONI:
1. Hapni skedarin index.html në browser për ta parë
2. Ngarkojeni në hosting (Hostinger, cPanel, FTP)
3. Ose ngarkojeni falas në: netlify.com/drop (drag & drop)

PERSONALIZIMI:
- Hapeni me Notepad++ ose VS Code
- Ndryshoni tekstet, ngjyrat dhe imazhet
- Zëvendësoni "PLACEHOLDER" me informacionin tuaj real

Krijuar: ${new Date().toLocaleDateString('sq-AL')}
Biznesi: ${businessName}
-->`

  const fullHtml = readme + '\n' + html
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `landing-${businessName.toLowerCase().replace(/\s+/g, '-')}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function LandingPageGeneratorPage() {
  const { profile } = useAuth()
  const [tone, setTone] = useState('professional')
  const [service, setService] = useState('')
  const [audience, setAudience] = useState('')
  const [offer, setOffer] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [generatedHtml, setGeneratedHtml] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)

  const businessName = profile?.business_name || 'Biznesi Im'
  const industry = profile?.industry || ''
  const city = profile?.city || 'Shqipëri'

  async function generate() {
    if (!service.trim()) return
    setLoading(true)
    setStreamingText('')
    setGeneratedHtml(null)

    const prompt = buildHtmlPrompt({ businessName, industry, city, service, audience, offer, tone: TONES.find(t => t.id === tone)?.label || tone })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je një ekspert i web dizajnit dhe copywriting-ut për biznese të vogla shqiptare. Të gjitha të dhënat janë dhënë — gjenero VETËM kodin HTML të plotë dhe të pastër, asgjë tjetër, asnjë shpjegim, asnjë markdown. Kodi duhet të fillojë me <!DOCTYPE html> dhe të mbarojë me </html>. Respekto strukturën e detyrueshme: Hero → Benefite → Si Funksionon → Testimoniale → CTA i Mesëm → FAQ → Footer CTA → Footer. Font nga Google Fonts (Poppins ose Inter). Ngjyra moderne sipas industrisë. Gjuhë shqip — tekste reale, jo Lorem ipsum. Cilësi si faqe profesionale $500+.',
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
          for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.delta?.text || parsed.choices?.[0]?.delta?.content || ''
              if (delta) { fullText += delta; setStreamingText(fullText) }
            } catch {}
          }
        }
        // Clean code fences if AI added them
        const cleaned = fullText
          .replace(/^```html\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```\s*$/i, '')
          .trim()
        setGeneratedHtml(cleaned)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">Landing Page Generator</h1>
        </div>
        <div className="card border border-violet-100 bg-violet-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center animate-pulse">
              <Globe className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke ndërtuar faqen HTML...</p>
              <p className="text-xs text-gray-400">Hero, benefite, testimoniale, CTA, FAQ</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-violet-100 max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                {streamingText.slice(-800)}<span className="inline-block w-1 h-3 bg-violet-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-violet-500"/>Duke shkruar HTML...
            </div>
          )}
        </div>
      </div>
    )
  }

  if (generatedHtml) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900">Landing Page Gati!</h1>
              <p className="text-xs text-gray-400">{businessName} · shiko preview-n dhe shkarko</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGeneratedHtml(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              <RotateCcw className="w-3.5 h-3.5"/>Ri-gjenero
            </button>
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              <Maximize2 className="w-3.5 h-3.5"/>Zmadhо
            </button>
            <Button
              onClick={() => downloadHTML(generatedHtml, businessName)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
              size="sm"
            >
              <Download className="w-4 h-4"/>Shkarko HTML
            </Button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
          <Eye className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"/>
          <div>
            <p className="text-sm font-semibold text-green-800">Preview Live — si do duket faqja realisht</p>
            <p className="text-xs text-green-600 mt-0.5">Shkarko HTML-in dhe ngarkoje falas në <strong>netlify.com/drop</strong> ose te hostingu yt. Punon menjëherë pa njohuri teknike.</p>
          </div>
        </div>

        {/* Preview iframe */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-md bg-white">
          {/* Browser bar mockup */}
          <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"/>
              <div className="w-3 h-3 rounded-full bg-yellow-400"/>
              <div className="w-3 h-3 rounded-full bg-green-400"/>
            </div>
            <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 font-mono truncate border border-gray-200">
              {businessName.toLowerCase().replace(/\s+/g, '')}.com
            </div>
          </div>
          <iframe
            srcDoc={generatedHtml}
            title="Landing Page Preview"
            className="w-full"
            style={{ height: '600px', border: 'none' }}
            sandbox="allow-same-origin"
          />
        </div>

        {/* Download instructions */}
        <div className="card border border-violet-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-violet-500"/>Si ta publikosh faqen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: '1', title: 'Shkarko HTML', desc: 'Kliko "Shkarko HTML" lart. Merr skedarin .html në kompjuterin tënd.' },
              { step: '2', title: 'Ngarko falas', desc: 'Shko te netlify.com/drop dhe hidhe skedarin. Online në 10 sekonda.' },
              { step: '3', title: 'Personalizo', desc: 'Hap me Notepad dhe ndrysho tekstet, ngjyrat, numrin e telefonit.' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 font-bold text-sm flex items-center justify-center flex-shrink-0">{s.step}</div>
                <div>
                  <div className="text-xs font-semibold text-gray-800">{s.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={() => setGeneratedHtml(null)} className="w-full gap-2">
          <RotateCcw className="w-4 h-4"/>Gjenero faqe të re
        </Button>

        {/* Fullscreen modal */}
        {fullscreen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
              <span className="text-white text-sm font-medium">Preview — {businessName}</span>
              <div className="flex items-center gap-3">
                <Button onClick={() => downloadHTML(generatedHtml, businessName)} size="sm" className="bg-violet-600 hover:bg-violet-700 gap-2">
                  <Download className="w-4 h-4"/>Shkarko HTML
                </Button>
                <button onClick={() => setFullscreen(false)} className="text-gray-300 hover:text-white">
                  <X className="w-5 h-5"/>
                </button>
              </div>
            </div>
            <iframe
              srcDoc={generatedHtml}
              title="Landing Page Fullscreen"
              className="flex-1 w-full bg-white"
              style={{ border: 'none' }}
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/marketing" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Landing Page Generator</h1>
          <p className="text-xs text-gray-400 mt-0.5">Faqe shitjeje e plotë — preview live + shkarkim HTML</p>
        </div>
      </div>

      {/* Business info preview */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-center gap-3">
        <Globe className="w-4 h-4 text-violet-500 flex-shrink-0"/>
        <div className="text-xs text-violet-700">
          Krijohet për: <strong>{businessName}</strong> · {industry} · {city}
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Produkti / Shërbimi <span className="text-red-400">*</span></label>
          <Textarea
            value={service}
            onChange={e => setService(e.target.value)}
            placeholder="p.sh. Kurs gatimi italian online — 8 javë, 40 video mësimore, certifikatë, 4,900 lekë"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Audienca Target <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Input
            value={audience}
            onChange={e => setAudience(e.target.value)}
            placeholder="p.sh. Gra 25-45 vjeç, familje me fëmijë, zona Tiranë"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Oferta Kryesore / USP <span className="text-gray-400 font-normal text-xs">(opsionale)</span></label>
          <Input
            value={offer}
            onChange={e => setOffer(e.target.value)}
            placeholder="p.sh. 30% zbritje për 48 orë + konsultë falas"
          />
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Toni i Faqes</label>
        <div className="grid grid-cols-5 gap-2">
          {TONES.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-center transition-all ${tone === t.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-lg">{t.label.split(' ')[0]}</span>
              <span className="text-xs font-medium text-gray-700">{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={generate} disabled={!service.trim()} className="w-full gap-2 bg-violet-600 hover:bg-violet-700" size="lg">
        <Globe className="w-5 h-5"/>Gjenero Landing Page
      </Button>
    </div>
  )
}
