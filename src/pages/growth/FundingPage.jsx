import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, DollarSign, ExternalLink, ChevronDown, ChevronUp, Send, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const FUNDING_OPTIONS = [
  {
    id: 'aida',
    category: 'Grant Qeveritar',
    title: 'AIDA — Grante për Biznese',
    org: 'Agjencia Shqiptare e Zhvillimit të Investimeve',
    amount: '500,000 – 5,000,000 ALL',
    type: 'Grant (s\'kthehet)',
    difficulty: 'Mesatare',
    diffColor: 'text-amber-600 bg-amber-50',
    desc: 'AIDA ofron grante për biznese të vogla dhe të mesme, me fokus sektorët prioritarë: turizëm, agro-industri, teknologji, prodhim.',
    requirements: ['Biznes i regjistruar min. 1 vit', 'Plani i biznesit detajues', 'Kontribut i vet min. 20–30%', 'Jo borxhe tatimore'],
    steps: ['Aplikoni online në aida.gov.al', 'Përgatitni planin e biznesit', 'Intervistë me komitetin', 'Nënshkruani marrëveshjen', 'Raportim periodik'],
    website: 'aida.gov.al',
  },
  {
    id: 'eu-ipa',
    category: 'Fond Europian',
    title: 'Fondet IPA / IPARD — BE',
    org: 'Bashkimi Europian (nëpërmjet AIDA/MBZHR)',
    amount: '1,000,000 – 20,000,000 ALL',
    type: 'Grant (s\'kthehet)',
    difficulty: 'E vështirë',
    diffColor: 'text-rose-600 bg-rose-50',
    desc: 'Fondet IPA të BE-së financojnë projekte agro-ushqimore, rurale dhe biznese që operojnë në sektorë prioritarë sipas programeve IPA III.',
    requirements: ['Sektori: bujqësi, agro-prodhim, rural', 'Plani i biznesit i audituar', 'Kontribut i vet 50%+', 'Kapacitete administrative'],
    steps: ['Ndiqni thirrjet publike në mbzhr.gov.al', 'Angazhoni konsulent aplikimi', 'Dorëzoni dosjen e plotë', 'Pritni vlerësimin (3–6 muaj)', 'Zbatimi i projektit'],
    website: 'mbzhr.gov.al',
  },
  {
    id: 'ebrd',
    category: 'Financim Ndërkombëtar',
    title: 'EBRD — Kredi për NVM',
    org: 'Banka Europiane për Rindërtim dhe Zhvillim',
    amount: '5,000 – 500,000 EUR',
    type: 'Kredi me interes preferencial',
    difficulty: 'Mesatare',
    diffColor: 'text-amber-600 bg-amber-50',
    desc: 'EBRD financon NVM-të shqiptare nëpërmjet bankave partnere (Credins, BKT, Raiffeisen) me kushte më të favorshme se kredinë tregtare.',
    requirements: ['Biznes i regjistruar min. 2 vjet', 'Qarkullim i dokumentuar', 'Kolateral ose garanci', 'Plan biznesi'],
    steps: ['Kontaktoni bankën partnere (BKT/Credins/Raiffeisen)', 'Plotësoni aplikimet bankare', 'Dorëzoni dokumentet financiare', 'Vlerësimi i kreditit', 'Disbursimi'],
    website: 'ebrd.com/albania',
  },
  {
    id: 'bkt',
    category: 'Kredi Bankare',
    title: 'Kredi Biznesi — Bankat Lokale',
    org: 'BKT, Credins, Raiffeisen, OTP, Intesa',
    amount: '100,000 – 50,000,000 ALL',
    type: 'Kredi tregtare',
    difficulty: 'E lehtë – Mesatare',
    diffColor: 'text-green-600 bg-green-50',
    desc: 'Bankat shqiptare ofrojnë kredi biznesi me interes 6–12% në vit. Procesi është relativisht i shpejtë nëse keni dokumentacionin e duhur.',
    requirements: ['NIPT aktiv', 'Pasqyra financiare 2 vjet', 'Kolateral (pronë, automjet)', 'Ekstraktet bankare 6 muaj'],
    steps: ['Krahasoni ofertat e bankave', 'Përgatitni dosjen: bilanc + P&L', 'Aplikoni pranë bankës', 'Vlerësim 2–4 javë', 'Nënshkruani kontratën'],
    website: 'bkt.com.al',
  },
  {
    id: 'microfinance',
    category: 'Mikrofinancë',
    title: 'Mikrokredi — NOA / FAF / BESA',
    org: 'Institucione Financiare Jo-Bankare',
    amount: '50,000 – 3,000,000 ALL',
    type: 'Mikrokredi',
    difficulty: 'E lehtë',
    diffColor: 'text-green-600 bg-green-50',
    desc: 'Institucionet e mikrofinancës japin kredi të vogla me procedura shumë më të thjeshta se bankat. Ideale për biznese shumë të vogla ose startup.',
    requirements: ['NIPT ose biznes informal', 'Garanci personale', 'Plani i thjeshtë i biznesit', 'Historia e kredisë (jo e detyrueshme)'],
    steps: ['Vizitoni degën (NOA, FAF, BESA, MFI Shqipëri)', 'Plotësoni formularin e thjeshtë', 'Intervistë me oficerin', 'Aprovim brenda 1–2 javësh', 'Disbursim'],
    website: 'noa.al / faf.com.al',
  },
  {
    id: 'angel',
    category: 'Investitor Privat',
    title: 'Angel Investors & Startup Albania',
    org: 'StartupAL, ICTSmedia, Investitorë Privatë',
    amount: 'Variabël — 5,000–200,000 EUR',
    type: 'Ekuitet (kapital kundrejt aksioneve)',
    difficulty: 'E vështirë',
    diffColor: 'text-rose-600 bg-rose-50',
    desc: 'Investitorët privatë (angel) financojnë startupe me potencial skalimi të lartë. Japin kapital në këmbim të aksioneve të shoqërisë.',
    requirements: ['Produkt/shërbim i shkallëzueshëm', 'Ekip i fortë themelues', 'Traction (klientë, të ardhura)', 'Pitch deck profesionale'],
    steps: ['Përgatitni pitch deck', 'Aplikoni në startupalbania.com ose ICTSmedia', 'Networking në eventet e ekosistemit', 'Due diligence nga investitori', 'Negocioni termat e investimit'],
    website: 'startupalbania.com',
  },
]

const CATEGORIES = ['Të gjitha', 'Grant Qeveritar', 'Fond Europian', 'Financim Ndërkombëtar', 'Kredi Bankare', 'Mikrofinancë', 'Investitor Privat']

function FundingCard({ f }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{f.category}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${f.diffColor}`}>{f.difficulty}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900">{f.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{f.org}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{f.amount}</span>
            <span className="text-xs text-gray-500">{f.type}</span>
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} className="p-1 text-gray-400 hover:text-gray-600 shrink-0 mt-1">
          {open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
        </button>
      </div>
      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Kërkesat</p>
              <ul className="space-y-1">
                {f.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0"/>
                    <span className="text-xs text-gray-600">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Hapat</p>
              <ul className="space-y-1">
                {f.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i+1}</span>
                    <span className="text-xs text-gray-600">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <ExternalLink className="w-3.5 h-3.5"/>
            <span>{f.website}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FundingPage() {
  const { profile } = useAuth()
  const [category, setCategory] = useState('Të gjitha')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [streaming, setStreaming] = useState('')

  const filtered = category === 'Të gjitha' ? FUNDING_OPTIONS : FUNDING_OPTIONS.filter(f => f.category === category)

  async function askAI() {
    const q = question.trim()
    if (!q) return
    setQuestion('')
    setLoading(true)
    setAnswer('')
    setStreaming('')

    const prompt = `Pyetje rreth financimit të biznesit shqiptar:

"${q}"

Biznesi: "${profile?.business_name || ''}" (${profile?.industry || ''}) — ${profile?.city || 'Shqipëri'}

Jep informacion specifik dhe praktik për mundësitë e financimit disponibël në Shqipëri. Fol shqip.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je ekspert i financimit të bizneseve shqiptare. Njeh programet e granteve të AIDA-s, fondet IPA të BE-së, instrumentet e EBRD-it, kreditë bankare dhe mikrofinanciaren. Jep rekomandime konkrete bazuar në profilin e biznesit. Fol shqip gjithmonë.',
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
              if (delta) { fullText += delta; setStreaming(fullText) }
            } catch {}
          }
        }
        setAnswer(fullText)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreaming('') }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/growth" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Mundësi Financimi</h1>
          <p className="text-xs text-gray-400 mt-0.5">Grante, kredi, investitorë — Shqipëri & BE</p>
        </div>
      </div>

      <div className="card bg-blue-50/50 border border-blue-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"/>
          <p className="text-xs text-blue-800">Mundësitë e financimit ndryshojnë sipas thirrjeve aktive. Kontrolloni gjithmonë faqet zyrtare ose pyesni AI-në për situatën aktuale.</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all ${category === c ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Funding cards */}
      <div className="space-y-3">
        {filtered.map(f => <FundingCard key={f.id} f={f}/>)}
      </div>

      {/* AI helper */}
      <div className="card">
        <p className="text-sm font-bold text-gray-900 mb-1">Cila mundësi më përshtatet?</p>
        <p className="text-xs text-gray-400 mb-3">Pyesni AI-në për situatën tuaj specifike</p>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) askAI() }}
          placeholder="p.sh. Jam dyqan ushqimor me 3 punonjës, dua 2 milion lekë për zgjerim. Çfarë mundësish kam?"
          rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300 resize-none"/>
        <Button onClick={askAI} disabled={!question.trim() || loading}
          className="mt-2 w-full gap-2 bg-green-600 hover:bg-green-700" size="sm">
          <Send className="w-3.5 h-3.5"/>Gjej Mundësitë e Mia
        </Button>
      </div>

      {(loading || streaming || answer) && (
        <div className="card border border-green-100 bg-green-50/30">
          {loading && !streaming && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-green-500"/>Po kërkon mundësitë...
            </div>
          )}
          {(streaming || answer) && (
            <div className="bg-white rounded-xl p-4 border border-green-100 max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {streaming || answer}
                {loading && <span className="inline-block w-1 h-4 bg-green-500 ml-0.5 animate-pulse"/>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
