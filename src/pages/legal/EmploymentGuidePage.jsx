import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Users, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Send, RefreshCw, Circle, Briefcase, Clock, Shield, XCircle } from 'lucide-react'

const CONTRACT_TYPES = [
  {
    id: 'full',
    title: 'Kontratë me Kohë të Plotë',
    hours: '40 orë/javë',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: 'Forma standarde e punësimit. Punonjësi punon 8 orë/ditë, 5 ditë/javë.',
    rights: ['Paga minimale 40,000 ALL/muaj', 'Min. 20 ditë pushim vjetor', 'Sigurime shoqërore + shëndetësore të plota', 'Kompensim mbi natë, fundjavë, festa'],
    notice: '30 ditë paralajmërim (deri 5 vjet stazh) / 60 ditë (mbi 5 vjet)',
  },
  {
    id: 'part',
    title: 'Kontratë me Kohë të Pjesshme',
    hours: 'Nën 40 orë/javë',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Punonjësi punon orë më të pakta se standardi. Të drejtat janë proporcionale me orët.',
    rights: ['Pagë proporcionale me orët e punës', 'Pushim vjetor proporcional', 'Sigurime shoqërore e shëndetësore (proporcionale)', 'Nuk mund të detyrohet të punojë orë shtesë'],
    notice: '15–30 ditë sipas kontratës',
  },
  {
    id: 'probation',
    title: 'Periudhë Prove',
    hours: 'Max 3 muaj',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Periudhë vlerësimi që mund të pasohet nga kontratë e plotë. Duhet të specifikohet në kontratë.',
    rights: ['Të gjitha të drejtat si punëmarrës i zakonshëm', 'Mund të zgjidhet me 5 ditë paralajmërim', 'Paga minimale ligjore zbatohet', 'Sigurimet janë të detyrueshme edhe gjatë provës'],
    notice: '5 ditë (nga të dyja palët)',
  },
  {
    id: 'fixed',
    title: 'Kontratë me Afat të Caktuar',
    hours: 'Afat specifik',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Kontratë për projekt ose sezon të caktuar. Rinovohet max 2 herë, pastaj bëhet e pa-afat.',
    rights: ['Të njëjtat të drejta si kontrata e zakonshme', 'Skadon automatikisht në datën e caktuar', 'Rinovim mbi 2 herë = kontratë e pa-afat', 'Zgjidhja para afatit kërkon kompensim'],
    notice: 'Skadon automatikisht; nëse zgjidhet para afatit kërkon kompensim',
  },
]

const HIRING_STEPS = [
  {
    step: 1,
    title: 'Hartoni kontratën e punës',
    desc: 'Kontrata duhet të jetë me shkrim dhe të përmbajë: pozicionin, pagën bruto, orët e punës, datën e fillimit, periudhën e provës (nëse ka) dhe kushtet e zgjidhjes. Dy kopje origjinale — njëra mbetet te punëdhënësi, tjetra te punonjësi.',
    docs: ['Kontratë pune e nënshkruar nga të dyja palët', 'Fotokopje e kartës së identitetit të punonjësit'],
    tip: 'Përdorni modulin "Gjenerues Dokumentash" për të krijuar kontratën automatikisht.',
  },
  {
    step: 2,
    title: 'Regjistroni punonjësin në ISSH',
    desc: 'Brenda 24 orësh nga fillimi i punës, punëdhënësi duhet të regjistrojë punonjësin në Institutin e Sigurimeve Shoqërore (ISSH) nëpërmjet portalit e-albania.al.',
    docs: ['NIPT i punëdhënësit', 'ID e punonjësit', 'Data e fillimit të punës', 'Paga bruto'],
    tip: 'Gjoba: 10,000–50,000 ALL nëse punonjësi gjendet i pa-regjistruar gjatë inspektimit.',
  },
  {
    step: 3,
    title: 'Hapni dosjen e punonjësit',
    desc: 'Mbani dosje individuale për çdo punonjës me të gjithë dokumentacionin e nevojshëm.',
    docs: ['Kontratë pune', 'Kartë identiteti (kopje)', 'Certifikatë mjekësore (nëse kërkohet nga sektori)', 'CV dhe dokumentet e kualifikimit'],
    tip: 'Dosja duhet të mbahet për 5 vjet pas largimit të punonjësit.',
  },
  {
    step: 4,
    title: 'Organizoni pagën dhe kontributet',
    desc: 'Çdo muaj llogaritni pagën neto dhe kontributet. Pagesa e kontributeve deri më 20 të muajit pasardhës. Kontributet: punonjësi 11.2% + punëdhënësi 18.4% e pagës bruto.',
    docs: ['Lista e pagave (çdo muaj)', 'Urdhër-pagesa bankare', 'Deklarata mujore e kontributeve'],
    tip: 'Përdorni Llogaritësin e Pagave në modul Financiar për të llogaritur automatikisht.',
  },
  {
    step: 5,
    title: 'Siguroni kushte të sigurta pune',
    desc: 'Ligji i Punës kërkon ambient pune të sigurt dhe higjienik. Kryeni trajnimin fillestar të sigurisë në punë dhe dokumentojeni.',
    docs: ['Regjistër i sigurisë në punë', 'Trajnim fillestar i dokumentuar'],
    tip: 'Inspektorati i Punës mund të gjobisë deri 500,000 ALL për shkelje të rënda.',
  },
]

const TERMINATION_INFO = [
  { type: 'Nga punëdhënësi (me shkak)', desc: 'Shkelje e rëndë e disiplinës, keqsjellje, dëm material me dashje. Nuk kërkon paralajmërim. Duhet dokumentim i shkakut.', color: 'text-rose-600', bg: 'bg-rose-50' },
  { type: 'Nga punëdhënësi (pa shkak)', desc: 'Ristrukturim, likuidim, reduktim stafi. Kërkon paralajmërim 30–90 ditë + kompensim: 1 pagë mujore për çdo vit stazhi.', color: 'text-amber-600', bg: 'bg-amber-50' },
  { type: 'Nga punonjësi', desc: 'Dorëheqja kërkon 14–30 ditë paralajmërim me shkrim. Pa paralajmërim punëdhënësi mund të kërkojë kompensim.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { type: 'Të drejtat pas largimit', desc: 'Certifikatë pune (e detyrueshme), paga e ditëve të pushimit të papërdorura, kompensimi i stažit nëse aplikohet.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const KEY_NUMBERS = [
  { label: 'Paga minimale', value: '40,000 ALL', sublabel: 'neto ≈ 34,500 ALL', color: 'text-purple-600' },
  { label: 'Pushim vjetor', value: '20 ditë', sublabel: 'min. pune (ligjore)', color: 'text-blue-600' },
  { label: 'Kontrib. punonjës', value: '11.2%', sublabel: 'SS 9.5% + SH 1.7%', color: 'text-emerald-600' },
  { label: 'Kontrib. punëdhënës', value: '18.4%', sublabel: 'SS 16.7% + SH 1.7%', color: 'text-amber-600' },
  { label: 'Periudha e provës', value: 'Max 3 muaj', sublabel: 'me 5 ditë njoftim', color: 'text-rose-600' },
  { label: 'Regjistrimi ISSH', value: 'Brenda 24 orësh', sublabel: 'nga dita e parë e punës', color: 'text-indigo-600' },
]

const FAQ_ITEMS = [
  { q: 'A mund të paguaj punonjësin me faturë pa e regjistruar?', a: 'Jo — kjo quhet "punë e zezë" dhe dënohet me gjoba deri 100,000 ALL për çdo punonjës të pa-regjistruar. Inspektori i Punës mund të hyjë pa paralajmërim dhe gjobën e paguan punëdhënësi.' },
  { q: 'Sa mund të zgjasë periudha e provës?', a: 'Maksimumi 3 muaj sipas Kodit të Punës. Gjatë provës, secila palë mund të zgjidhë kontratën me 5 ditë njoftim të shkruar, pa pasoja ligjore.' },
  { q: 'A duhet të paguaj punën gjatë festave zyrtare?', a: 'Po — punëtorët nuk janë të detyruar të punojnë ditët e festave zyrtare. Nëse punojnë, duhet paguar dyfish (200% e pagës ditore). Ka 15 festa zyrtare në Shqipëri.' },
  { q: 'Çfarë ndodh nëse punonjësi sëmurët?', a: 'Ditët e para 14 i paguan punëdhënësi (100% e pagës). Nga dita 15-a e tutje ISSH paguan 70% të pagës mesatare. Punonjësi duhet të sjellë certifikatë mjekësore për çdo mungesë.' },
  { q: 'A mund të largohem nga punonjësi gjatë shtatzënisë?', a: 'Jo absolut — largimi i gruas shtatzënë ose gjatë lehonisë (1 vit) është i ndaluar rreptësisht. Shkelja dënohet me gjobë dhe detyrim riintegrimi ose kompensim të rëndë.' },
  { q: 'Sa orë jashtë orarit mund të kërkoj?', a: 'Maksimumi 200 orë jashtë orarit në vit. Ora shtesë duhet paguar me 25% shtesë (ditë pune) ose 50% (natë/fundjavë). Punonjësi mund ta refuzojë mbi kufirin ligjor.' },
]

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-3 text-left gap-3">
        <p className="text-sm font-semibold text-gray-800">{q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0"/> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0"/>}
      </button>
      {open && <p className="pb-3 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  )
}

function StepItem({ step, title, desc, docs, tip }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-3.5">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-indigo-600">{step}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <button onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
              {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
          </div>
          {expanded && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Dokumentet:</p>
                <ul className="space-y-0.5">
                  {docs.map((d, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0"/>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              {tip && (
                <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0"/>
                  <p className="text-xs text-amber-700">{tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EmploymentGuidePage() {
  const { profile } = useAuth()
  const [activeContract, setActiveContract] = useState('full')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [answer, setAnswer] = useState('')

  const ct = CONTRACT_TYPES.find(c => c.id === activeContract)

  async function askQuestion() {
    const q = question.trim()
    if (!q) return
    setQuestion('')
    setLoading(true)
    setStreamingText('')
    setAnswer('')

    const prompt = `Pyetje rreth punësimit dhe marrëdhënieve të punës në Shqipëri:

"${q}"

Kontekst: Biznesi "${profile?.business_name || ''}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Jep përgjigje konkrete bazuar në Kodin e Punës shqiptar. Fol shqip.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i Kodit të Punës shqiptar dhe marrëdhënieve të punës. Njeh mirë procedurat e ISSH, llojet e kontratave, të drejtat e punonjësve dhe detyrimet e punëdhënësve sipas legjislacionit shqiptar. Jep përgjigje praktike dhe konkrete. Fol shqip gjithmonë.',
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
        setAnswer(fullText)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/legal" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Guidë Punësimi</h1>
          <p className="text-xs text-gray-400 mt-0.5">Kontratat, hapat, të drejtat dhe detyrimet</p>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {KEY_NUMBERS.map(kn => (
          <div key={kn.label} className="card p-3 text-center">
            <p className={`text-base font-bold ${kn.color}`}>{kn.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{kn.sublabel}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5">{kn.label}</p>
          </div>
        ))}
      </div>

      {/* Contract types */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Llojet e Kontratës</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {CONTRACT_TYPES.map(c => (
            <button key={c.id} onClick={() => setActiveContract(c.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${activeContract === c.id ? `${c.border} ${c.bg}` : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <p className={`text-xs font-bold ${activeContract === c.id ? c.color : 'text-gray-600'}`}>{c.title.split(' (')[0]}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{c.hours}</p>
            </button>
          ))}
        </div>
        {ct && (
          <div className={`card border-2 ${ct.border} ${ct.bg}`}>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{ct.desc}</p>
            <div className="mb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Të drejtat kryesore</p>
              <div className="space-y-1">
                {ct.rights.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${ct.color}`}/>
                    <p className="text-xs text-gray-700">{r}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Njoftim zgjidhje</p>
              <p className="text-xs text-gray-700">{ct.notice}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hiring checklist */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Hapat për të Punësuar</p>
        <div className="space-y-2">
          {HIRING_STEPS.map(s => <StepItem key={s.step} {...s} />)}
        </div>
      </div>

      {/* Termination */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Zgjidhja e Marrëdhënies së Punës</p>
        <div className="space-y-2">
          {TERMINATION_INFO.map((t, i) => (
            <div key={i} className={`rounded-xl p-3.5 ${t.bg}`}>
              <p className={`text-xs font-bold ${t.color} mb-1`}>{t.type}</p>
              <p className="text-xs text-gray-700 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Pyetje të Shpeshta</p>
        {FAQ_ITEMS.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} />)}
      </div>

      {/* AI Q&A */}
      <div className="card">
        <p className="text-sm font-bold text-gray-900 mb-1">Keni pyetje specifike?</p>
        <p className="text-xs text-gray-400 mb-3">Pyesni ekspertin AI për situatën tuaj konkrete të punësimit</p>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) askQuestion() }}
          placeholder="p.sh. Si e largoj një punonjës që nuk vjen në punë? A duhet të paguaj overtimën gjatë sezonit? Si mund të zgjat periudhën e provës?"
          rows={2}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-300 resize-none"
        />
        <Button onClick={askQuestion} disabled={!question.trim() || loading}
          className="mt-2 w-full gap-2 bg-indigo-600 hover:bg-indigo-700" size="sm">
          <Send className="w-3.5 h-3.5"/>Pyet Ekspertin
        </Button>
      </div>

      {(loading || streamingText || answer) && (
        <div className="card border border-indigo-100 bg-indigo-50/30">
          {loading && !streamingText && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500"/>Duke menduar...
            </div>
          )}
          {(streamingText || answer) && (
            <div className="bg-white rounded-xl p-4 border border-indigo-100 max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {streamingText || answer}
                {loading && <span className="inline-block w-1 h-4 bg-indigo-500 ml-0.5 animate-pulse"/>}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="card bg-gray-50 border border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-gray-600">Shënim:</strong> Informacioni bazohet në Kodin e Punës të Republikës së Shqipërisë dhe legjislacionin e sigurimeve shoqërore. Për raste komplekse (largim me konflikt, ristrukturim), konsultohuni me avokat pune.
        </p>
      </div>
    </div>
  )
}
