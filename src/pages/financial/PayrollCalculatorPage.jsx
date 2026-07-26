import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, AlertCircle, Plus, Trash2, Printer } from 'lucide-react'

// Albania 2024 rates (approximate — verify with tax authority)
const SS_EMPLOYEE  = 0.095   // sigurime shoqërore punëmarrës
const HI_EMPLOYEE  = 0.017   // sigurime shëndetësore punëmarrës
const SS_EMPLOYER  = 0.167   // sigurime shoqërore punëdhënës
const HI_EMPLOYER  = 0.017   // sigurime shëndetësore punëdhënës
const MIN_WAGE     = 40000   // ALL/muaj

function calcPIT(taxable) {
  // Personal income tax brackets (monthly, 2024 approx)
  if (taxable <= 30000) return 0
  if (taxable <= 150000) return (taxable - 30000) * 0.13
  return (150000 - 30000) * 0.13 + (taxable - 150000) * 0.23
}

function calcEmployee(gross) {
  const ssEmp = gross * SS_EMPLOYEE
  const hiEmp = gross * HI_EMPLOYEE
  const taxable = Math.max(0, gross - ssEmp - hiEmp)
  const pit = calcPIT(taxable)
  const totalDeductions = ssEmp + hiEmp + pit
  const net = gross - totalDeductions
  return { ssEmp, hiEmp, taxable, pit, totalDeductions, net }
}

function calcEmployer(gross) {
  const ssEmpr = gross * SS_EMPLOYER
  const hiEmpr = gross * HI_EMPLOYER
  const totalCost = gross + ssEmpr + hiEmpr
  return { ssEmpr, hiEmpr, totalCost }
}

function fmt(n) {
  return Math.round(n).toLocaleString('sq-AL')
}

function pct(part, total) {
  if (!total) return '0%'
  return (part / total * 100).toFixed(1) + '%'
}

function Bar({ label, value, total, color }) {
  const w = Math.min(100, (value / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{fmt(value)} ALL <span className="text-gray-400">({pct(value, total)})</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${w}%` }}/>
      </div>
    </div>
  )
}

function EmployeeRow({ emp, onChange, onDelete, index }) {
  const r = useMemo(() => {
    const g = parseFloat(emp.gross) || 0
    if (!g) return null
    return { ...calcEmployee(g), ...calcEmployer(g) }
  }, [emp.gross])

  return (
    <div className="card border border-gray-100 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">{index + 1}</div>
        <input type="text" value={emp.name} onChange={e => onChange({ ...emp, name: e.target.value })}
          placeholder={`Punëmarrësi ${index + 1}`}
          className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-600 shrink-0">Paga Bruto</label>
        <input type="number" value={emp.gross} onChange={e => onChange({ ...emp, gross: e.target.value })}
          placeholder="p.sh. 80000"
          className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <span className="text-xs text-gray-400">ALL</span>
      </div>

      {r && parseFloat(emp.gross) > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <p className="text-gray-400">Sig. Shoqërore (9.5%)</p>
              <p className="font-bold text-gray-700">−{fmt(r.ssEmp)} ALL</p>
            </div>
            <div>
              <p className="text-gray-400">Sig. Shëndetësore (1.7%)</p>
              <p className="font-bold text-gray-700">−{fmt(r.hiEmp)} ALL</p>
            </div>
            <div>
              <p className="text-gray-400">Tatimi mbi të Ardhura</p>
              <p className="font-bold text-gray-700">−{fmt(r.pit)} ALL</p>
            </div>
            <div className="bg-blue-600 rounded-lg p-2">
              <p className="text-blue-200">Paga Neto</p>
              <p className="font-black text-white text-base">{fmt(r.net)} ALL</p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span>Kosto totale punëdhënës:</span>
              <span className="block text-xs text-gray-400">+Sig. Sh. {fmt(r.ssEmpr)} + Sig. Shën. {fmt(r.hiEmpr)}</span>
            </div>
            <span className="text-sm font-black text-rose-600">{fmt(r.totalCost)} ALL</span>
          </div>
        </div>
      )}

      {parseFloat(emp.gross) > 0 && parseFloat(emp.gross) < MIN_WAGE && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0"/>
          Paga minimale ligjore është {fmt(MIN_WAGE)} ALL/muaj.
        </div>
      )}
    </div>
  )
}

export default function PayrollCalculatorPage() {
  const [employees, setEmployees] = useState([{ id: 1, name: '', gross: '' }])
  const [showSummary, setShowSummary] = useState(false)

  function addEmployee() {
    setEmployees(prev => [...prev, { id: Date.now(), name: '', gross: '' }])
  }

  const totals = useMemo(() => {
    let totalGross = 0, totalNet = 0, totalCost = 0, totalTax = 0, totalSS = 0
    for (const emp of employees) {
      const g = parseFloat(emp.gross) || 0
      if (!g) continue
      const e = calcEmployee(g)
      const er = calcEmployer(g)
      totalGross += g
      totalNet += e.net
      totalCost += er.totalCost
      totalTax += e.pit
      totalSS += e.ssEmp + e.hiEmp + er.ssEmpr + er.hiEmpr
    }
    return { totalGross, totalNet, totalCost, totalTax, totalSS }
  }, [employees])

  const hasData = employees.some(e => parseFloat(e.gross) > 0)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/financial" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Llogaritës Pagash</h1>
          <p className="text-xs text-gray-400 mt-0.5">Bruto → Neto · Sigurime · Tatimi mbi të ardhurat</p>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>
        <p className="text-xs text-amber-800">Normat janë orientuese bazuar në legjislacionin shqiptar 2024. Sig. Shoqërore 9.5% (punëmarrës) / 16.7% (punëdhënës) · Sig. Shëndetësore 1.7% · Tatimi 0/13/23%. Konsultohuni me kontabilistin tuaj.</p>
      </div>

      <div className="space-y-3">
        {employees.map((emp, i) => (
          <EmployeeRow key={emp.id} index={i} emp={emp}
            onChange={updated => setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e))}
            onDelete={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))} />
        ))}
      </div>

      <button onClick={addEmployee} className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 font-medium">
        <Plus className="w-4 h-4"/>Shto punëmarrës tjetër
      </button>

      {hasData && (
        <div className="card border border-blue-100 bg-blue-50/30 space-y-4">
          <p className="text-sm font-bold text-gray-900">{employees.filter(e => parseFloat(e.gross) > 0).length} Punëmarrës — Totali Mujor</p>

          <div className="space-y-3">
            <Bar label="Paga Neto (marrin punëmarrësit)" value={totals.totalNet} total={totals.totalCost} color="bg-emerald-500" />
            <Bar label="Sigurime (punëmarrës + punëdhënës)" value={totals.totalSS} total={totals.totalCost} color="bg-blue-400" />
            <Bar label="Tatimi mbi të Ardhurat" value={totals.totalTax} total={totals.totalCost} color="bg-amber-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Total Paga Bruto</p>
              <p className="text-lg font-bold text-gray-900">{fmt(totals.totalGross)} ALL</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Total Paga Neto</p>
              <p className="text-lg font-bold text-emerald-600">{fmt(totals.totalNet)} ALL</p>
            </div>
          </div>

          <div className="bg-rose-600 text-white rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-rose-200">Kosto TOTALE e Punëdhënësit</p>
              <p className="text-xs text-rose-300 mt-0.5">Bruto + kontributet e punëdhënësit</p>
            </div>
            <p className="text-2xl font-black">{fmt(totals.totalCost)} ALL</p>
          </div>
        </div>
      )}

      <div className="card bg-gray-50 border border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Normat e Kontributeve 2024</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Sig. Shoqërore (punëmarrës)', '9.5%', 'text-blue-600'],
            ['Sig. Shëndetësore (punëmarrës)', '1.7%', 'text-blue-600'],
            ['Sig. Shoqërore (punëdhënës)', '16.7%', 'text-rose-600'],
            ['Sig. Shëndetësore (punëdhënës)', '1.7%', 'text-rose-600'],
          ].map(([label, rate, color]) => (
            <div key={label} className="bg-white rounded-lg p-2.5 border border-gray-100">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-base font-black ${color}`}>{rate}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tatimi mbi të Ardhurat (mujore)</p>
          {[['0 – 30,000 ALL','0%'],['30,001 – 150,000 ALL','13%'],['Mbi 150,000 ALL','23%']].map(([range, rate]) => (
            <div key={range} className="flex justify-between text-xs">
              <span className="text-gray-500">{range}</span>
              <span className="font-bold text-gray-800">{rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
