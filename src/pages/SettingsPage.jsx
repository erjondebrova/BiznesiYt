import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import {
  Settings, User, Building2, Shield, Check, AlertCircle,
  Globe, Phone, Target, Bell, LogOut, ChevronRight, Lock
} from 'lucide-react'

const INDUSTRIES = [
  "Restorant & Kafene", "Dyqan & Retail", "Supermarket & Ushqimore",
  "Ndërtim & Materiale", "Shërbime Profesionale (Kontabilitet, Juridik)",
  "IT & Teknologji", "Turizëm, Hotel & Akomodim", "Transport & Logjistikë",
  "Shëndetësi & Mirëqenie", "Arsim & Trajnim", "Agjensi Marketingu",
  "Prodhim & Industri", "Bujqësi & Agrobiznes", "Mode & Veshje",
  "Shërbime Shtëpiake & Riparime", "Tjetër",
]

const CITIES = [
  "Tiranë", "Durrës", "Vlorë", "Shkodër", "Fier",
  "Korçë", "Elbasan", "Berat", "Lushnjë", "Kavajë",
  "Gjirokastër", "Sarandë", "Lezhë", "Kukës", "Tjetër",
]

const REVENUE_RANGES = [
  "Nën 500,000 ALL/muaj",
  "500,000 – 1,000,000 ALL/muaj",
  "1,000,000 – 3,000,000 ALL/muaj",
  "3,000,000 – 8,000,000 ALL/muaj",
  "Mbi 8,000,000 ALL/muaj",
  "Preferoj të mos e ndaj",
]

const BUSINESS_GOALS = [
  "Rrit shitjet dhe qarkullimin",
  "Hap lokacion / degë të re",
  "Fut produkt ose shërbim të ri",
  "Digjitalizoj biznesin",
  "Redukto kostot operative",
  "Ndërtoj ekip të fortë",
  "Gjej investitor ose financim",
  "Dal në treg ndërkombëtar",
]

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
  business: 'bg-amber-100 text-amber-700',
  enterprise: 'bg-emerald-100 text-emerald-700',
}

function Avatar({ name, size = 'lg' }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    'from-purple-500 to-indigo-600', 'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',  'from-orange-500 to-amber-600',
    'from-rose-500 to-pink-600',
  ]
  const color = colors[(name || '').charCodeAt(0) % colors.length]
  const sz = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500"/>
      </div>
      <div>
        <h2 className="font-heading font-semibold text-gray-900 text-sm">{title}</h2>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary-500' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`}/>
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { profile, user, refreshProfile, signOut } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    business_name: profile?.business_name || '',
    industry: profile?.industry || '',
    city: profile?.city || '',
    years_operating: profile?.years_operating || '',
    employee_count: profile?.employee_count || '',
    monthly_revenue_range: profile?.monthly_revenue_range || '',
    has_nipt: profile?.has_nipt ?? false,
    website: profile?.website || '',
    biggest_challenge: profile?.biggest_challenge || '',
    business_goal: profile?.business_goal || '',
    notification_tips: profile?.notification_tips ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function update(field, val) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function save() {
    setSaving(true); setError('')
    try {
      const { error: err } = await supabase.from('users_profile').upsert({
        id: user.id, ...form, updated_at: new Date().toISOString(),
      })
      if (err) throw err
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const planLabel = profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free'
  const planColor = PLAN_COLORS[profile?.plan] || PLAN_COLORS.free

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-500"/>
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-gray-900">Cilësimet</h1>
          <p className="text-xs text-gray-400">Menaxhoni profilin dhe preferencat</p>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div className="card flex items-center gap-4">
        <Avatar name={profile?.full_name}/>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{profile?.full_name || 'Profili juaj'}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planColor}`}>{planLabel}</span>
            {profile?.business_name && (
              <span className="text-xs text-gray-400">· {profile.business_name}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal Info ── */}
      <div className="card space-y-4">
        <SectionHeader icon={User} title="Profili Personal" desc="Emri dhe kontakti juaj"/>
        <div>
          <Label>Emri i Plotë</Label>
          <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="mt-1" placeholder="p.sh. Erjon Debrova"/>
        </div>
        <div>
          <Label>Numri i Telefonit</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <Input value={form.phone} onChange={e => update('phone', e.target.value)} className="pl-9" placeholder="+355 6X XXX XXXX"/>
          </div>
        </div>
      </div>

      {/* ── Business Info ── */}
      <div className="card space-y-4">
        <SectionHeader icon={Building2} title="Profili i Biznesit" desc="Informacion bazë për biznesin tuaj"/>
        <div>
          <Label>Emri i Biznesit</Label>
          <Input value={form.business_name} onChange={e => update('business_name', e.target.value)} className="mt-1" placeholder="p.sh. DEBROVA shpk"/>
        </div>
        <div>
          <Label>Website (opsionale)</Label>
          <div className="relative mt-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <Input value={form.website} onChange={e => update('website', e.target.value)} className="pl-9" placeholder="www.biznesijuaj.al"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Industria</Label>
            <Select value={form.industry} onValueChange={v => update('industry', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..."/></SelectTrigger>
              <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Qyteti</Label>
            <Select value={form.city} onValueChange={v => update('city', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..."/></SelectTrigger>
              <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Vitet e Operimit</Label>
            <Select value={form.years_operating} onValueChange={v => update('years_operating', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..."/></SelectTrigger>
              <SelectContent>
                {["Sapo kam filluar (0–1 vit)","1–2 vite","2–5 vite","5–10 vite","Mbi 10 vite"].map(y =>
                  <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Numri i Punonjësve</Label>
            <Select value={form.employee_count} onValueChange={v => update('employee_count', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..."/></SelectTrigger>
              <SelectContent>
                {["Vetëm unë","2–5 punonjës","6–10 punonjës","11–25 punonjës","26–50 punonjës","Mbi 50 punonjës"].map(e =>
                  <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Qarkullimi Mujor (afërsisht)</Label>
          <Select value={form.monthly_revenue_range} onValueChange={v => update('monthly_revenue_range', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..."/></SelectTrigger>
            <SelectContent>{REVENUE_RANGES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <button onClick={() => update('has_nipt', !form.has_nipt)}
            className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${form.has_nipt ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
            {form.has_nipt && <Check className="w-3 h-3 text-white"/>}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">Biznesi ka NIPT aktiv</p>
            <p className="text-xs text-gray-400">Numri i Identifikimit të Personit Tatimpagues</p>
          </div>
        </div>
      </div>

      {/* ── Business Context ── */}
      <div className="card space-y-4">
        <SectionHeader icon={Target} title="Qëllimet e Biznesit" desc="Na ndihmoni të personalizojmë këshillat për ju"/>
        <div>
          <Label>Qëllimi kryesor 12-mujor</Label>
          <Select value={form.business_goal} onValueChange={v => update('business_goal', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni qëllimin..."/></SelectTrigger>
            <SelectContent>{BUSINESS_GOALS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sfida kryesore aktuale</Label>
          <Textarea value={form.biggest_challenge} onChange={e => update('biggest_challenge', e.target.value)}
            rows={3} className="mt-1" placeholder="Çfarë ju pengon të rriteni? Klientë, konkurrencë, staf, kapital..."/>
        </div>
      </div>

      {/* ── Preferences ── */}
      <div className="card">
        <SectionHeader icon={Bell} title="Preferencat" desc="Menaxhoni njoftimet dhe eksperiencën"/>
        <div className="divide-y divide-gray-100">
          <Toggle
            checked={form.notification_tips}
            onChange={v => update('notification_tips', v)}
            label="Këshilla e Ditës"
            desc="Merrni këshilla të personalizuara çdo ditë në dashboard"
          />
        </div>
      </div>

      {/* ── Save ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl p-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0"/>{error}
        </div>
      )}
      <Button onClick={save} disabled={saving} className="w-full gap-2 h-11" size="lg">
        {saved ? <><Check className="w-4 h-4"/>Ruajtur me sukses!</> : saving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
      </Button>

      {/* ── Account ── */}
      <div className="card space-y-1">
        <SectionHeader icon={Shield} title="Llogaria" desc="Siguria dhe aksesi"/>
        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-gray-400"/>
            <span className="text-sm text-gray-700">Ndrysho fjalëkalimin</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500"/>
        </button>
        <button onClick={signOut}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left group">
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500"/>
          <span className="text-sm text-gray-700 group-hover:text-red-600">Dil nga llogaria</span>
        </button>
      </div>

    </div>
  )
}
