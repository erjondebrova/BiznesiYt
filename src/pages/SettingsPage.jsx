import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Settings, User, Building2, Shield, Check, AlertCircle } from 'lucide-react'

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

export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    business_name: profile?.business_name || '',
    industry: profile?.industry || '',
    city: profile?.city || '',
    years_operating: profile?.years_operating || '',
    employee_count: profile?.employee_count || '',
    monthly_revenue_range: profile?.monthly_revenue_range || '',
    has_nipt: profile?.has_nipt || false,
    biggest_challenge: profile?.biggest_challenge || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function update(field, val) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      await supabase.from('users_profile').upsert({
        id: user.id,
        ...form,
        updated_at: new Date().toISOString(),
      })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-500" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Cilësimet</h1>
      </div>

      {/* Plan */}
      <div className="card mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Plani aktual</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>
        <Badge variant="default" className="capitalize">{profile?.plan || 'Free'}</Badge>
      </div>

      {/* Profile form */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-500" />
          <h2 className="font-heading font-semibold text-gray-900">Profili Personal</h2>
        </div>
        <div>
          <Label>Emri i Plotë</Label>
          <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="mt-1" />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-gray-500" />
            <h2 className="font-heading font-semibold text-gray-900">Profili i Biznesit</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Emri i Biznesit</Label>
              <Input value={form.business_name} onChange={e => update('business_name', e.target.value)} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Industria</Label>
                <Select value={form.industry} onValueChange={v => update('industry', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..." /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Qyteti</Label>
                <Select value={form.city} onValueChange={v => update('city', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..." /></SelectTrigger>
                  <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vitet e Operimit</Label>
                <Select value={form.years_operating} onValueChange={v => update('years_operating', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..." /></SelectTrigger>
                  <SelectContent>
                    {["Sapo kam filluar (0-1 vit)", "1-2 vite", "2-5 vite", "5-10 vite", "Mbi 10 vite"].map(y =>
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Numri i Punonjësve</Label>
                <Select value={form.employee_count} onValueChange={v => update('employee_count', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni..." /></SelectTrigger>
                  <SelectContent>
                    {["Vetëm unë", "2-5 punonjës", "6-10 punonjës", "11-25 punonjës", "26-50 punonjës", "Mbi 50 punonjës"].map(e =>
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Sfida Kryesore</Label>
              <Textarea value={form.biggest_challenge} onChange={e => update('biggest_challenge', e.target.value)}
                rows={3} className="mt-1" />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}

        <Button onClick={save} disabled={saving} className="w-full gap-2">
          {saved ? (
            <><Check className="w-4 h-4" />Ruajtur me sukses!</>
          ) : saving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
        </Button>
      </div>
    </div>
  )
}
