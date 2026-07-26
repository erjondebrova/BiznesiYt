import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, FileText, RefreshCw, Copy, Check, Printer, RotateCcw, ChevronLeft } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'employment',
    emoji: '👔',
    title: 'Kontratë Punësimi',
    desc: 'Marrëdhënie pune me kohë të plotë ose të pjesshme',
    color: 'border-blue-200 bg-blue-50',
    fields: [
      { id: 'employer', label: 'Emri i Punëdhënësit (biznesit)', placeholder: 'SH.P.K. "Debrova"' },
      { id: 'employer_nipt', label: 'NIPT i Punëdhënësit', placeholder: 'L12345678A' },
      { id: 'employer_address', label: 'Adresa e Punëdhënësit', placeholder: 'Rruga e Dibrës, Nr. 5, Tiranë' },
      { id: 'employee', label: 'Emri i Plotë i Punëmarrësit', placeholder: 'Arta Beqiri' },
      { id: 'employee_id', label: 'Numri i Kartës së Identitetit', placeholder: 'A12345678' },
      { id: 'position', label: 'Pozicioni / Titulli i Punës', placeholder: 'Shitës/e, Kontabilist/e, Menaxher/e...' },
      { id: 'salary', label: 'Paga Bruto Mujore (ALL)', placeholder: '80,000' },
      { id: 'hours', label: 'Orë Pune në Javë', placeholder: '40 orë' },
      { id: 'start_date', label: 'Data e Fillimit të Punës', placeholder: 'dd/mm/yyyy' },
      { id: 'duration', label: 'Kohëzgjatja', placeholder: 'Pa afat / 12 muaj / 6 muaj...' },
      { id: 'trial_period', label: 'Periudha Prove', placeholder: '3 muaj' },
    ],
  },
  {
    id: 'service',
    emoji: '🤝',
    title: 'Kontratë Shërbimi',
    desc: 'Shërbime profesionale mes dy palëve',
    color: 'border-emerald-200 bg-emerald-50',
    fields: [
      { id: 'provider', label: 'Ofruesi i Shërbimit (emri/biznesi)', placeholder: 'SH.P.K. "TechSolutions"' },
      { id: 'provider_nipt', label: 'NIPT i Ofruesit', placeholder: 'opsionale' },
      { id: 'client', label: 'Klienti (emri/biznesi)', placeholder: 'SH.P.K. "Debrova"' },
      { id: 'client_nipt', label: 'NIPT i Klientit', placeholder: 'opsionale' },
      { id: 'service_desc', label: 'Përshkrimi i Shërbimit', placeholder: 'Zhvillim faqeje interneti, konsulencë marketingu...' },
      { id: 'price', label: 'Çmimi Total (ALL)', placeholder: '500,000' },
      { id: 'payment_terms', label: 'Kushtet e Pagesës', placeholder: '50% paradhënie, 50% pas dorëzimit' },
      { id: 'deadline', label: 'Afati i Dorëzimit', placeholder: '30 ditë nga nënshkrimi / dd/mm/yyyy' },
      { id: 'city', label: 'Qyteti i Nënshkrimit', placeholder: 'Tiranë' },
      { id: 'date', label: 'Data e Kontratës', placeholder: 'dd/mm/yyyy' },
    ],
  },
  {
    id: 'nda',
    emoji: '🔒',
    title: 'Marrëveshje Konfidencialiteti (NDA)',
    desc: 'Mbrojtja e informacionit konfidencial mes palëve',
    color: 'border-gray-200 bg-gray-50',
    fields: [
      { id: 'party1', label: 'Pala e Parë (biznesi/personi)', placeholder: 'SH.P.K. "Debrova"' },
      { id: 'party1_nipt', label: 'NIPT/ID i Palës së Parë', placeholder: 'opsionale' },
      { id: 'party2', label: 'Pala e Dytë (biznesi/personi)', placeholder: 'Arta Beqiri / SH.P.K. "Partner"' },
      { id: 'party2_nipt', label: 'NIPT/ID i Palës së Dytë', placeholder: 'opsionale' },
      { id: 'purpose', label: 'Qëllimi i Bashkëpunimit', placeholder: 'Diskutim për partneritet biznesi / kontratë furnizimi...' },
      { id: 'info_type', label: 'Lloji i Informacionit Konfidencial', placeholder: 'Plane biznesi, çmime, listë klientësh, procese teknike...' },
      { id: 'duration', label: 'Kohëzgjatja e Konfidencialitetit', placeholder: '2 vjet / 5 vjet / Pa afat' },
      { id: 'city', label: 'Qyteti', placeholder: 'Tiranë' },
      { id: 'date', label: 'Data', placeholder: 'dd/mm/yyyy' },
    ],
  },
  {
    id: 'rental',
    emoji: '🏢',
    title: 'Kontratë Qiraje',
    desc: 'Qiraja e hapësirës për biznes ose zyrë',
    color: 'border-amber-200 bg-amber-50',
    fields: [
      { id: 'landlord', label: 'Qiradhënësi (pronari)', placeholder: 'Agron Hoxha' },
      { id: 'landlord_id', label: 'Karta e Identitetit / NIPT', placeholder: 'A12345678' },
      { id: 'tenant', label: 'Qiramarrësi (biznesi)', placeholder: 'SH.P.K. "Debrova"' },
      { id: 'tenant_nipt', label: 'NIPT i Qiramarrësit', placeholder: 'L12345678A' },
      { id: 'property_address', label: 'Adresa e Pronës', placeholder: 'Rruga Myslym Shyri, Nr. 10, Tiranë' },
      { id: 'property_area', label: 'Sipërfaqja (m²)', placeholder: '85' },
      { id: 'monthly_rent', label: 'Qiraja Mujore (ALL ose EUR)', placeholder: '50,000 ALL' },
      { id: 'deposit', label: 'Depozita', placeholder: '2 muaj qira' },
      { id: 'start_date', label: 'Data e Fillimit', placeholder: 'dd/mm/yyyy' },
      { id: 'duration', label: 'Kohëzgjatja', placeholder: '1 vit / 2 vjet' },
      { id: 'payment_day', label: 'Dita e Pagesës', placeholder: '1 i çdo muaji' },
    ],
  },
  {
    id: 'authorization',
    emoji: '✉️',
    title: 'Letër Autorizimi',
    desc: 'Autorizim për të vepruar në emër të personit/biznesit',
    color: 'border-violet-200 bg-violet-50',
    fields: [
      { id: 'authorizer', label: 'Autorizuesi (emri i plotë / biznesi)', placeholder: 'Erjon Debrova / SH.P.K. "Debrova"' },
      { id: 'authorizer_id', label: 'ID / NIPT i Autorizuesit', placeholder: 'A12345678' },
      { id: 'authorized', label: 'Personi i Autorizuar', placeholder: 'Arta Beqiri' },
      { id: 'authorized_id', label: 'ID i Personit të Autorizuar', placeholder: 'B98765432' },
      { id: 'purpose', label: 'Për çfarë qëllimi autorizohet', placeholder: 'Tërheqje dokumentash nga QKB / Nënshkrim kontrate / Bankë...' },
      { id: 'validity', label: 'Periudha e Vlefshmërisë', placeholder: '30 ditë / deri më dd/mm/yyyy' },
      { id: 'city', label: 'Qyteti', placeholder: 'Tiranë' },
      { id: 'date', label: 'Data', placeholder: 'dd/mm/yyyy' },
    ],
  },
  {
    id: 'supply',
    emoji: '📦',
    title: 'Kontratë Furnizimi',
    desc: 'Blerje mallrash ose lëndësh të para nga furnizuesi',
    color: 'border-rose-200 bg-rose-50',
    fields: [
      { id: 'supplier', label: 'Furnizuesi (biznesi/personi)', placeholder: 'SH.P.K. "Supplier X"' },
      { id: 'supplier_nipt', label: 'NIPT i Furnizuesit', placeholder: 'L12345678A' },
      { id: 'buyer', label: 'Blerësi', placeholder: 'SH.P.K. "Debrova"' },
      { id: 'buyer_nipt', label: 'NIPT i Blerësit', placeholder: 'L87654321A' },
      { id: 'goods', label: 'Mallrat / Produktet', placeholder: 'Kafe e bluar, Lëndë të para druri, Veshje sportive...' },
      { id: 'quantity', label: 'Sasia dhe Njësia', placeholder: '500 kg / 100 copë / 1000 litra' },
      { id: 'unit_price', label: 'Çmimi për Njësi (ALL)', placeholder: '250 ALL/kg' },
      { id: 'total_price', label: 'Çmimi Total (ALL)', placeholder: '125,000' },
      { id: 'delivery_date', label: 'Data e Dorëzimit', placeholder: 'dd/mm/yyyy / brenda 15 ditëve' },
      { id: 'delivery_address', label: 'Adresa e Dorëzimit', placeholder: 'Rruga e Kavajës, Tiranë' },
      { id: 'payment_terms', label: 'Kushtet e Pagesës', placeholder: '30 ditë pas faturës' },
    ],
  },
]

export default function DocumentTemplatesPage() {
  const { profile } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [document, setDocument] = useState(null)
  const [copied, setCopied] = useState(false)

  function selectTemplate(tmpl) {
    setSelectedTemplate(tmpl)
    setFormData({})
    setDocument(null)
  }

  async function generate() {
    if (!selectedTemplate) return
    setLoading(true)
    setStreamingText('')
    setDocument(null)

    const fieldsSummary = selectedTemplate.fields
      .map(f => `${f.label}: ${formData[f.id] || '—'}`)
      .join('\n')

    const templateNames = {
      employment: 'KONTRATË PUNËSIMI',
      service: 'KONTRATË SHËRBIMI',
      nda: 'MARRËVESHJE KONFIDENCIALITETI (NDA)',
      rental: 'KONTRATË QIRAJE',
      authorization: 'LETËR AUTORIZIMI',
      supply: 'KONTRATË FURNIZIMI',
    }

    const prompt = `Gjenero një ${templateNames[selectedTemplate.id]} profesionale dhe ligjërisht të saktë sipas legjislacionit shqiptar.

Të dhënat e palëve:
${fieldsSummary}

Biznesi i klientit: ${profile?.business_name || ''} (${profile?.industry || ''}) në ${profile?.city || 'Shqipëri'}

Kërkesat:
- Shkruaj dokumentin e plotë dhe formal në shqip
- Përfshi të gjitha klauzolat standarde për këtë lloj kontrate
- Nëse ndonjë e dhënë mungon, vendos [_____________] si vend rezervë
- Përfshi nenin mbi zgjidhjen e mosmarrëveshjeve (gjykata shqiptare)
- Përfshi nenin mbi ndryshimet e kontratës (me shkrim)
- Format profesional: titull, palët, nenet e numëruara, nënshkrimet
- Fol shqip ligjor por të kuptueshëm

Shkruaj VETËM dokumentin, jo shpjegime shtesë.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'Ti je avokat i specializuar në të drejtën tregtare dhe civile shqiptare. Generon kontrata dhe dokumente ligjore profesionale, të sakta dhe sipas legjislacionit shqiptar në fuqi. Shkruaj vetëm dokumentin e kërkuar, pa komente shtesë.',
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
        setDocument(fullText)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false); setStreamingText('') }
  }

  function copyDocument() {
    navigator.clipboard.writeText(document)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Template list
  if (!selectedTemplate) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/legal" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Gjenerues Dokumentash</h1>
            <p className="text-xs text-gray-400 mt-0.5">Zgjidhni llojin e dokumentit që dëshironi të gjeneroni</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => selectTemplate(t)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${t.color}`}>
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Form
  if (!document && !loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">{selectedTemplate.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Plotësoni të dhënat — AI gjeneron dokumentin e plotë</p>
          </div>
        </div>

        <div className="card space-y-3">
          {selectedTemplate.fields.map(field => (
            <div key={field.id}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
              <input type="text" value={formData[field.id] || ''} onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-300" />
            </div>
          ))}
        </div>

        <Button onClick={generate} className="w-full gap-2 bg-purple-600 hover:bg-purple-700" size="lg">
          <FileText className="w-5 h-5"/>Gjenero {selectedTemplate.title}
        </Button>
        <p className="text-xs text-center text-gray-400">Fushat bosh do të shfaqen si vend rezervë [ ___ ] në dokument.</p>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/legal" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-heading text-xl font-bold text-gray-900">{selectedTemplate.title}</h1>
        </div>
        <div className="card border border-purple-100 bg-purple-50/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center animate-pulse">
              <FileText className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Duke gjeneruar dokumentin ligjor...</p>
              <p className="text-xs text-gray-400">{selectedTemplate.title}</p>
            </div>
          </div>
          {streamingText ? (
            <div className="bg-white rounded-xl p-4 border border-purple-100 max-h-[55vh] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-4 bg-purple-500 ml-0.5 animate-pulse"/>
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-500"/>Duke hartuar kontratën...
            </div>
          )}
        </div>
      </div>
    )
  }

  // Result
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/legal" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">{selectedTemplate.title}</h1>
            <p className="text-xs text-gray-400">Dokumenti juaj ligjor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={copyDocument} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">
            {copied ? <><Check className="w-3.5 h-3.5 text-green-500"/>Kopjuar</> : <><Copy className="w-3.5 h-3.5"/>Kopjo</>}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">
            <Printer className="w-3.5 h-3.5"/>Printo
          </button>
        </div>
      </div>

      <div className="card border border-gray-200 bg-white">
        <div className="bg-gray-50 rounded-xl p-5 font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-[65vh] overflow-y-auto">
          {document}
        </div>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
        <FileText className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>
        <p className="text-xs text-amber-800">Ky dokument është gjeneruar nga AI si shabllon orientues. Rishikojeni me avokat të licencuar para nënshkrimit, sidomos për kontrata me vlerë të lartë.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => { setDocument(null) }} className="gap-2">
          <RotateCcw className="w-4 h-4"/>Ndrysho të dhënat
        </Button>
        <Button variant="outline" onClick={() => selectTemplate(null)} className="gap-2">
          <FileText className="w-4 h-4"/>Dokument i ri
        </Button>
      </div>
    </div>
  )
}
