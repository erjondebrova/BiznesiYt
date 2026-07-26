import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, CheckCircle, Circle, AlertCircle, Building2, User, Landmark, Send, RefreshCw } from 'lucide-react'

const BUSINESS_TYPES = [
  {
    id: 'pf',
    icon: User,
    title: 'Person Fizik (P.F.)',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    capital: 'Pa minimum',
    partners: '1 person',
    liability: 'E pakufizuar',
    tax: '0% deri 23% (PIT progresiv)',
    pros: ['Regjistrim i thjeshtë dhe i shpejtë', 'Kosto e ulët fillestare', 'Pa kapital minimal', 'Kontabilitet i thjeshtëzuar'],
    cons: ['Përgjegjësi personale e pakufizuar', 'Vështirësi marrje kredie', 'Nuk mund të shesë aksione', 'Imazh më pak profesional'],
    bestFor: 'Profesionistë të lirë, artizanë, tregtarë të vegjël me rrezik të ulët.',
  },
  {
    id: 'shpk',
    icon: Building2,
    title: 'Shoqëri me Përgjegjësi të Kufizuar (SH.P.K.)',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    capital: 'Min. 100 ALL (simbolik)',
    partners: '1–50 ortakë',
    liability: 'E kufizuar (kapital)',
    tax: '15% tatim fitimi (mbi 14M ALL)',
    pros: ['Mbrojtje e aseteve personale', 'Kredibilitet me klientë & banka', 'Mund të ketë ortakë', 'Lehtë të transferosh pronësinë'],
    cons: ['Kosto dhe procedura regjistrimi', 'Kontabilitet i detyrueshëm', 'Pasqyra financiare publike', 'Taksa noteriale'],
    bestFor: 'Bizneset me potencial rritjeje, shumë ortakë ose kontrata me kompani të mëdha.',
  },
  {
    id: 'sha',
    icon: Landmark,
    title: 'Shoqëri Aksionare (Sh.A.)',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    capital: 'Min. 3,500,000 ALL',
    partners: 'Min. 1 aksionar',
    liability: 'E kufizuar (aksione)',
    tax: '15% tatim fitimi',
    pros: ['Mund të listohet në bursë', 'Aksione lehtë transferuese', 'Tërheq investitorë', 'Jetë e pakufizuar juridike'],
    cons: ['Kapital minimal i lartë', 'Procedura komplekse regjistrim', 'Mbikëqyrje e shtuar (ASC)', 'Kosto operative të larta'],
    bestFor: 'Korporata të mëdha, startupet që duan investitorë institucionalë ose listim në bursë.',
  },
]

const REGISTRATION_STEPS = {
  shpk: [
    { step: 1, title: 'Zgjidhni emrin e shoqërisë', desc: 'Kontrolloni disponueshmërinë e emrit në QKB (qkb.gov.al). Emri duhet të jetë unik dhe të mos jetë i rezervuar.', docs: ['Propozim emri (3 alternativa)'] },
    { step: 2, title: 'Hartimi i Aktit të Themelimit', desc: 'Nota noteriale me aktin e themelimit dhe statutin e shoqërisë. Çmimi: ~5,000–15,000 ALL.', docs: ['Akt themelimi', 'Statut', 'Certifikata e pronësisë ose qira për adresën'] },
    { step: 3, title: 'Depozitimi i kapitalit fillestar', desc: 'Hapni llogari bankare dhe depozitoni kapitalin minimal (minimum 100 ALL simbolikisht).', docs: ['Konfirmim bankar i depozitimit'] },
    { step: 4, title: 'Regjistrimi në QKB', desc: 'Dorëzoni dokumentet në QKB (Qendrën Kombëtare të Biznesit) ose online. Kohë pritjeje: 1 ditë pune.', docs: ['Kërkesë regjistrimi', 'Akt themelimi + statut noterial', 'ID e ortakëve', 'Konfirmim bankar', 'Kontratë qiraje ose pronë (adresa)'] },
    { step: 5, title: 'Marrja e NIPT', desc: 'Pas aprovimit nga QKB, merret NIPT (Numri i Identifikimit të Personit Tatimpagues) automatikisht.', docs: ['Ekstrakt QKB me NIPT'] },
    { step: 6, title: 'Hapja e llogarisë bankare të biznesit', desc: 'Me NIPT-in dhe ekstraktin QKB, hapni llogari biznesi.', docs: ['Ekstrakt QKB', 'NIPT', 'ID e administratorit'] },
    { step: 7, title: 'Regjistrimi fiskal & kasë fiskale', desc: 'Aktivizoni sistemin fiskal me Drejtorinë Rajonale Tatimore. Instaloni kasë fiskale nëse keni shitje me pakicë.', docs: ['NIPT', 'Formulari i aktivizimit fiskal'] },
  ],
  pf: [
    { step: 1, title: 'Zgjidhni emrin tregtar', desc: 'Emri mund të jetë emri juaj personal ose një emër tregtar. Kontrolloni disponueshmërinë në QKB.', docs: ['Propozim emri'] },
    { step: 2, title: 'Dorëzoni kërkesën në QKB', desc: 'Plotësoni formularin e regjistrimit si Person Fizik. Procesimi: 1 ditë pune.', docs: ['Formulari i regjistrimit PF', 'Kartë identiteti ose pasaportë', 'Kontratë qiraje ose vërtetim pronë (adresa e biznesit)'] },
    { step: 3, title: 'Marrja e NIPT', desc: 'NIPT-i lëshohet automatikisht pas aprovimit. Format: K + 8 shifra + 1 shkronjë.', docs: ['Ekstrakt QKB me NIPT'] },
    { step: 4, title: 'Aktivizimi fiskal', desc: 'Regjistrohuni tek Drejtoria Rajonale Tatimore dhe instaloni kasën fiskale nëse nevojitet.', docs: ['NIPT', 'Formulari fiskal'] },
  ],
}

const FAQ_ITEMS = [
  { q: 'Sa kushton regjistrimi i një SH.P.K.?', a: 'Taksa QKB: ~100 ALL. Noteri: 5,000–15,000 ALL. Kasë fiskale: 30,000–80,000 ALL. Gjithsej fillimi: ~100,000–200,000 ALL duke përfshirë llogaritarë.' },
  { q: 'A mund të kem SH.P.K. vetë pa ortakë?', a: 'Po. Ligji shqiptar lejon SH.P.K. me një ortak të vetëm (shoqëri me ortak të vetëm). Ky është rasti më i shpeshtë për sipërmarrës të vegjël dhe të mesëm.' },
  { q: 'Çfarë është NIPT dhe kur e marr?', a: 'NIPT është Numri i Identifikimit të Personit Tatimpagues — ID-ja tatimore e biznesit tuaj. Lëshohet automatikisht nga QKB pas regjistrimit, brenda 1–2 ditësh pune. Format: K12345678A.' },
  { q: 'Kur duhet të regjistrohem për TVSH?', a: 'Kur qarkullimi vjetor kalon 10,000,000 ALL (10 milion lekë), regjistrimi për TVSH bëhet i detyrueshëm. Mund të regjistroheni vullnetarisht edhe para kësaj kufie nëse dëshironi të merrni kthim TVSH-je.' },
  { q: 'Cili është ndryshimi mes P.F. dhe SH.P.K.?', a: 'Kryesorja: Personit Fizik i janë rrezikuar asetet personale nëse biznesi bën borxhe. Tek SH.P.K., pronari është i mbrojtur — detyrimet e shoqërisë nuk kalojnë mbi pronarin personalisht (përveç rasteve të mashtrimit).' },
  { q: 'A mund të ndryshoj nga P.F. në SH.P.K. më vonë?', a: 'Po, por nuk është konvertim direkt — duhet të mbyllni aktivitetin si P.F. dhe të regjistroni një SH.P.K. të re. Mund ta bëni këtë në çdo moment.' },
  { q: 'Sa kohë zgjat regjistrimi?', a: 'QKB procesim: 1 ditë pune. Nëse dokumentet janë të plota dhe korrekte, NIPT-in mund ta keni brenda 24–48 orësh nga dorëzimi.' },
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

function StepItem({ step, title, desc, docs, done, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`rounded-xl border-2 p-3.5 transition-all ${done ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="shrink-0 mt-0.5">
          {done
            ? <CheckCircle className="w-5 h-5 text-emerald-500"/>
            : <Circle className="w-5 h-5 text-gray-300"/>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold ${done ? 'text-emerald-700 line-through decoration-emerald-400' : 'text-gray-900'}`}>
              {step}. {title}
            </p>
            <button onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
              {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
          </div>
          {expanded && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              {docs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Dokumentet e nevojshme:</p>
                  <ul className="space-y-0.5">
                    {docs.map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0"/>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NIPTGuidePage() {
  const { profile } = useAuth()
  const [selectedType, setSelectedType] = useState('shpk')
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [answer, setAnswer] = useState('')

  const steps = REGISTRATION_STEPS[selectedType] || []

  function toggleStep(step) {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(step)) next.delete(step)
      else next.add(step)
      return next
    })
  }

  const progress = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0

  async function askQuestion() {
    const q = question.trim()
    if (!q) return
    setQuestion('')
    setLoading(true)
    setStreamingText('')
    setAnswer('')

    const prompt = `Pyetje rreth regjistrimit të biznesit në Shqipëri:

"${q}"

Kontekst: Biznesi "${profile?.business_name || ''}" (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}.

Përgjigju konkretisht dhe praktikisht, me hapat specifikë nëse nevojitet. Fol shqip.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i regjistrimit të bizneseve dhe legjislacionit tregtar shqiptar. Njeh mirë procedurat e QKB, sistemin fiskal shqiptar, llojet e shoqërive tregtare (SH.P.K., P.F., Sh.A.) dhe detyrimet ligjore. Jep përgjigje praktike dhe konkrete. Fol shqip gjithmonë.',
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
          <h1 className="font-heading text-xl font-bold text-gray-900">Guidë NIPT & Regjistrim Biznesi</h1>
          <p className="text-xs text-gray-400 mt-0.5">Hapat, dokumentet dhe llojet e biznesit</p>
        </div>
      </div>

      {/* Business type selector */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Zgjidhni llojin e biznesit</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUSINESS_TYPES.map(bt => {
            const Icon = bt.icon
            const active = selectedType === bt.id
            return (
              <button key={bt.id} onClick={() => { setSelectedType(bt.id); setCompletedSteps(new Set()) }}
                className={`rounded-xl border-2 p-3.5 text-left transition-all ${active ? `${bt.border} ${bt.bg}` : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className={`w-8 h-8 ${active ? bt.bg : 'bg-gray-50'} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${active ? bt.color : 'text-gray-400'}`}/>
                </div>
                <p className={`text-xs font-bold ${active ? bt.color : 'text-gray-700'}`}>{bt.title.split(' (')[0]}</p>
                <p className={`text-[10px] mt-0.5 ${active ? 'text-gray-600' : 'text-gray-400'}`}>({bt.title.match(/\(([^)]+)\)/)?.[1]})</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected type details */}
      {(() => {
        const bt = BUSINESS_TYPES.find(b => b.id === selectedType)
        if (!bt) return null
        return (
          <div className={`card border-2 ${bt.border} ${bt.bg}`}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Kapitali minimal', val: bt.capital },
                { label: 'Ortakët', val: bt.partners },
                { label: 'Përgjegjësia', val: bt.liability },
                { label: 'Tatimi', val: bt.tax },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${bt.color}`}>{item.val}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Avantazhet</p>
                {bt.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0"/>
                    <p className="text-xs text-gray-600">{p}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Disavantazhet</p>
                {bt.cons.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-0.5">
                    <span className="w-3 h-3 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"/>
                    </span>
                    <p className="text-xs text-gray-600">{c}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-lg p-2.5 bg-white/60`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Ideale për:</p>
              <p className="text-xs text-gray-700">{bt.bestFor}</p>
            </div>
          </div>
        )
      })()}

      {/* Registration checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Hapat e regjistrimit</p>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }}/>
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
        </div>
        <div className="space-y-2">
          {steps.map(s => (
            <StepItem
              key={s.step}
              {...s}
              done={completedSteps.has(s.step)}
              onToggle={() => toggleStep(s.step)}
            />
          ))}
        </div>
        {completedSteps.size === steps.length && steps.length > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/>
            <p className="text-sm font-semibold text-emerald-700">Urime! Keni plotësuar të gjithë hapat e regjistrimit.</p>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="card">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Pyetje të shpeshta</p>
        <div>
          {FAQ_ITEMS.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} />)}
        </div>
      </div>

      {/* AI Q&A */}
      <div className="card">
        <p className="text-sm font-bold text-gray-900 mb-1">Keni pyetje specifike?</p>
        <p className="text-xs text-gray-400 mb-3">Pyesni ekspertin AI për situatën tuaj konkrete</p>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) askQuestion() }}
          placeholder="p.sh. A mund të regjistrohem si P.F. dhe të kem punonjës? Çfarë nevojitet për adresën e biznesit?"
          rows={2}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-300 resize-none"
        />
        <Button onClick={askQuestion} disabled={!question.trim() || loading}
          className="mt-2 w-full gap-2 bg-orange-500 hover:bg-orange-600" size="sm">
          <Send className="w-3.5 h-3.5"/>Pyet Ekspertin
        </Button>
      </div>

      {(loading || streamingText || answer) && (
        <div className="card border border-orange-100 bg-orange-50/30">
          {loading && !streamingText && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-orange-500"/>Duke menduar...
            </div>
          )}
          {(streamingText || answer) && (
            <div className="bg-white rounded-xl p-4 border border-orange-100 max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {streamingText || answer}
                {loading && <span className="inline-block w-1 h-4 bg-orange-500 ml-0.5 animate-pulse"/>}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="card bg-gray-50 border border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-gray-600">Shënim:</strong> Informacioni është orientues. Procedurat mund të ndryshojnë. Për situata komplekse, konsultohuni me noter ose avokat tregtar. Website zyrtar: <strong className="text-gray-600">qkb.gov.al</strong>
        </p>
      </div>
    </div>
  )
}
