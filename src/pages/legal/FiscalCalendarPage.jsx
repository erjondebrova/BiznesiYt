import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react'

const MONTHS_AL = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']

function generateDeadlines(year) {
  const deadlines = []

  // TVSH Quarterly — 14 Jan, Apr, Jul, Oct
  const qtvshMonths = [0, 3, 6, 9]
  const qtvshLabels = ['Q4 i vitit paraardhës', 'Q1', 'Q2', 'Q3']
  qtvshMonths.forEach((m, i) => {
    deadlines.push({
      id: `qtvsh-${year}-${m}`,
      date: new Date(year, m, 14),
      title: `Deklarim TVSH Tremujor (${qtvshLabels[i]})`,
      type: 'tvsh',
      desc: 'Dorëzimi i deklaratës tremujore të TVSH-së pranë Drejtorisë Rajonale Tatimore. Afati: 14 ditor pas mbarimit të tremujorit.',
      who: 'Biznese të regjistruar për TVSH me qarkullim vjetor 10–14 milion ALL.',
      howto: 'Plotëso formularin e TVSH-së në E-Filing (e-albania.al) ose nëpërmjet programit fiskal dhe paguaj nëse ka detyrim.',
    })
  })

  // TVSH Monthly — 14th each month (for large taxpayers)
  for (let m = 0; m < 12; m++) {
    deadlines.push({
      id: `mtvsh-${year}-${m}`,
      date: new Date(year, m, 14),
      title: `Deklarim TVSH Mujor — ${MONTHS_AL[m]}`,
      type: 'tvsh-monthly',
      desc: 'Dorëzimi i deklaratës mujore të TVSH-së (tatimpagues të mëdhenj ose me qarkullim mbi 14 milion ALL).',
      who: 'Tatimpagues të mëdhenj ose me qarkullim vjetor mbi 14 milion ALL.',
      howto: 'Plotëso dhe dorëzo deklaratën mujore në portalin e-albania.al ose nëpërmjet kontabilistit.',
    })
  }

  // Social Insurance — 20th each month
  for (let m = 0; m < 12; m++) {
    deadlines.push({
      id: `ss-${year}-${m}`,
      date: new Date(year, m, 20),
      title: `Sigurime Shoqërore & Shëndetësore — ${MONTHS_AL[m]}`,
      type: 'sigurime',
      desc: 'Pagesa e kontributeve të sigurimeve shoqërore dhe shëndetësore (punëmarrës + punëdhënës) për muajin paraardhës.',
      who: 'Të gjitha bizneset me punonjës.',
      howto: 'Paguaj nëpërmjet sistemit bankar ose portalit e-albania.al. Kontributet: punëmarrës 11.2% + punëdhënës 18.4% i pagës bruto.',
    })
  }

  // Annual income tax — March 31
  deadlines.push({
    id: `fit-${year}`,
    date: new Date(year, 2, 31),
    title: 'Tatimi mbi Fitimin Vjetor',
    type: 'tatim',
    desc: 'Dorëzimi i deklaratës vjetore të tatimit mbi fitimin për vitin paraardhës.',
    who: 'Biznese me qarkullim vjetor mbi 14 milion ALL (norma 15%).',
    howto: 'Plotëso deklaratën vjetore të tatimit mbi fitimin dhe dërgo në Drejtorinë Rajonale Tatimore deri më 31 Mars.',
  })

  // Financial statements — April 30
  deadlines.push({
    id: `pasqyra-${year}`,
    date: new Date(year, 3, 30),
    title: 'Pasqyrat Financiare Vjetore',
    type: 'raportim',
    desc: 'Dorëzimi i pasqyrave financiare vjetore (bilanci, pasqyra e fitimit/humbjes) në QKB.',
    who: 'Të gjitha shoqëritë tregtare (SH.P.K., Sh.A.).',
    howto: 'Harton kontabilisti dhe dorëzohen nëpërmjet QKB online ose fizikisht. Gjoba deri 300,000 ALL nëse nuk dorëzohen.',
  })

  // Personal income tax — April 30
  deadlines.push({
    id: `pit-${year}`,
    date: new Date(year, 3, 30),
    title: 'Tatimi mbi të Ardhurat Personale (PF)',
    type: 'tatim',
    desc: 'Deklarimi vjetor i tatimit mbi të ardhurat personale për personat fizikë dhe ortakët e bizneseve.',
    who: 'Persona fizikë me biznes, ortakë SH.P.K., me të ardhura nga burime të shumta.',
    howto: 'Plotëso formularin DKA-II dhe dorëzoje në zyrën tatimore ose nëpërmjet e-albania.al.',
  })

  // Simplified tax quarterly — for small businesses 10-14M
  const simpleTaxMonths = [0, 3, 6, 9]
  const simpleTaxLabels = ['Q4 i vitit paraardhës', 'Q1', 'Q2', 'Q3']
  simpleTaxMonths.forEach((m, i) => {
    deadlines.push({
      id: `simple-tax-${year}-${m}`,
      date: new Date(year, m, 20),
      title: `Tatimi i Thjeshtëzuar Tremujor (${simpleTaxLabels[i]})`,
      type: 'tatim',
      desc: 'Pagesa tremujore e tatimit të thjeshtëzuar (7.5% mbi qarkullimin) për bizneset me qarkullim 10–14 milion ALL/vit.',
      who: 'Biznese me qarkullim vjetor 10–14 milion ALL.',
      howto: 'Llogarit 7.5% mbi qarkullimin e tremujorit dhe paguaj brenda datës 20 të muajit pas mbarimit të tremujorit.',
    })
  })

  return deadlines.sort((a, b) => a.date - b.date)
}

const TYPE_COLORS = {
  'tvsh':         { bg: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',    label: 'TVSH Tremujore' },
  'tvsh-monthly': { bg: 'bg-sky-100 text-sky-700',       dot: 'bg-sky-500',     label: 'TVSH Mujore' },
  'sigurime':     { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Sigurime' },
  'tatim':        { bg: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500',  label: 'Tatim' },
  'raportim':     { bg: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500',   label: 'Raportim' },
}

function getUrgency(date, today) {
  const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: 'Kaluar', color: 'text-gray-400', bg: 'bg-gray-50 border-gray-100' }
  if (diff === 0) return { label: 'Sot!', color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
  if (diff <= 7)  return { label: `${diff} ditë`, color: 'text-red-500', bg: 'bg-red-50 border-red-100' }
  if (diff <= 30) return { label: `${diff} ditë`, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' }
  return { label: `${diff} ditë`, color: 'text-gray-500', bg: 'bg-white border-gray-100' }
}

function DeadlineCard({ dl, today }) {
  const [expanded, setExpanded] = useState(false)
  const urgency = getUrgency(dl.date, today)
  const tc = TYPE_COLORS[dl.type] || TYPE_COLORS['tatim']
  const isPast = dl.date < today
  const dateStr = `${dl.date.getDate()} ${MONTHS_AL[dl.date.getMonth()]} ${dl.date.getFullYear()}`

  return (
    <div className={`rounded-xl border-2 p-3.5 ${urgency.bg} ${isPast ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${tc.dot}`}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${isPast ? 'text-gray-400' : 'text-gray-900'} leading-tight`}>{dl.title}</p>
            <span className={`text-xs font-bold shrink-0 ${urgency.color}`}>{urgency.label}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{dateStr}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tc.bg}`}>{tc.label}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 ml-5 space-y-2 border-t border-current/10 pt-3">
          <p className="text-xs text-gray-600 leading-relaxed">{dl.desc}</p>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Kush?</p>
            <p className="text-xs text-gray-600">{dl.who}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Si të bëhet?</p>
            <p className="text-xs text-gray-600">{dl.howto}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const ALL_FILTER_TYPES = [
  { id: 'all', label: 'Të gjitha' },
  { id: 'tvsh', label: 'TVSH' },
  { id: 'tvsh-monthly', label: 'TVSH Mujore' },
  { id: 'sigurime', label: 'Sigurime' },
  { id: 'tatim', label: 'Tatim' },
  { id: 'raportim', label: 'Raportim' },
]

export default function FiscalCalendarPage() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const year = today.getFullYear()
  const allDeadlines = useMemo(() => generateDeadlines(year), [year])

  const [filter, setFilter] = useState('all')
  const [showPast, setShowPast] = useState(false)

  const filtered = useMemo(() => {
    return allDeadlines.filter(dl => {
      if (!showPast && dl.date < today) return false
      if (filter === 'all') return true
      return dl.type === filter
    })
  }, [allDeadlines, filter, showPast, today])

  const upcoming7 = allDeadlines.filter(dl => {
    const diff = Math.ceil((dl.date - today) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 30
  })

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/legal" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Kalendarë Fiskal {year}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Të gjitha afatet e rëndësishme tatimore dhe ligjore</p>
        </div>
      </div>

      {/* Upcoming alert */}
      {upcoming7.length > 0 && (
        <div className="card border border-amber-200 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600"/>
            <p className="text-sm font-bold text-amber-800">{upcoming7.length} afat brenda 30 ditëve!</p>
          </div>
          <div className="space-y-1.5">
            {upcoming7.slice(0, 3).map(dl => {
              const diff = Math.ceil((dl.date - today) / (1000 * 60 * 60 * 24))
              const dateStr = `${dl.date.getDate()} ${MONTHS_AL[dl.date.getMonth()]}`
              return (
                <div key={dl.id} className="flex items-center gap-2 text-xs">
                  <span className={`font-bold w-16 ${diff <= 7 ? 'text-red-600' : 'text-amber-700'}`}>{diff === 0 ? 'Sot' : `${diff} ditë`}</span>
                  <span className="text-gray-600 flex-1 truncate">{dl.title}</span>
                  <span className="text-gray-400 shrink-0">{dateStr}</span>
                </div>
              )
            })}
            {upcoming7.length > 3 && <p className="text-xs text-amber-600">+{upcoming7.length - 3} afate të tjera...</p>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {ALL_FILTER_TYPES.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all ${filter === f.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Toggle past */}
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)} className="w-4 h-4 accent-purple-600"/>
        Shfaq edhe afatet e kaluara
      </label>

      {/* Deadline list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">Nuk ka afate për filtrin e zgjedhur.</div>
        )}
        {filtered.map(dl => <DeadlineCard key={dl.id} dl={dl} today={today} />)}
      </div>

      <div className="card bg-gray-50 border border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-gray-600">Shënim:</strong> Afatet janë orientuese bazuar në legjislacionin shqiptar. Mund të ndryshojnë sipas kategorisë tatimore dhe vendimeve administrative. Konsultohuni me kontabilistin tuaj për situatën specifike të biznesit.
        </p>
      </div>
    </div>
  )
}
