import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Progress } from '../components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Zap, ChevronRight, ChevronLeft, Check, Building2, Users, TrendingUp, Scale } from 'lucide-react'

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

const NEEDS = [
  { id: 'marketing', icon: TrendingUp, label: 'Marketing & Shitje', desc: 'Plane marketingu, social media, reklama' },
  { id: 'financial', icon: Building2, label: 'Financa & Çmimim', desc: 'Fluksi i parasë, çmimet, projeksione' },
  { id: 'legal', icon: Scale, label: 'Ligjore & Fiskale', desc: 'TVSH, NIPT, deklarata tatimore' },
  { id: 'growth', icon: TrendingUp, label: 'Rritje & Strategji', desc: 'Diagnostikë, plane rritje, mundësi' },
]

const STEPS = [
  { title: "Biznesi juaj", subtitle: "Na tregoni për biznesin tuaj" },
  { title: "Madhësia & Financat", subtitle: "Të dhëna bazë financiare" },
  { title: "Ku dëshironi ndihmë?", subtitle: "Zgjidhni fushat prioritare" },
  { title: "Sfida juaj kryesore", subtitle: "Çfarë ju vështirëson më shumë?" },
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    business_name: '',
    industry: '',
    city: '',
    years_operating: '',
    employee_count: '',
    monthly_revenue_range: '',
    has_nipt: false,
    needs: [],
    biggest_challenge: '',
  })

  function update(field, value) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function toggleNeed(id) {
    setData(prev => ({
      ...prev,
      needs: prev.needs.includes(id)
        ? prev.needs.filter(n => n !== id)
        : [...prev.needs, id]
    }))
  }

  async function handleFinish() {
    if (!user) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('users_profile')
        .update({
          business_name: data.business_name || null,
          industry: data.industry || null,
          city: data.city || null,
          years_operating: data.years_operating || null,
          employee_count: data.employee_count || null,
          monthly_revenue_range: data.monthly_revenue_range || null,
          has_nipt: data.has_nipt,
          needs: data.needs.length > 0 ? data.needs : null,
          biggest_challenge: data.biggest_challenge || null,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (error) {
        // Row may not exist yet — fall back to upsert
        await supabase.from('users_profile').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          onboarding_completed: true,
        }, { onConflict: 'id' })
      }
    } catch (err) {
      console.error('Onboarding save error:', err)
    }

    // SessionStorage flag ensures ProtectedRoute lets us through
    // even if the DB write hasn't reflected yet on the next load
    sessionStorage.setItem('onboarding_done', '1')
    setLoading(false)
    window.location.href = '/dashboard'
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-gray-900">
              BiznesiYt<span className="text-primary-500">.al</span>
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-3">Hapi {step + 1} nga {STEPS.length}</div>
          <Progress value={progress} className="w-full max-w-xs mx-auto" />
        </div>

        <div className="card shadow-modal">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-gray-900">{STEPS[step].title}</h2>
            <p className="text-gray-500 text-sm mt-1">{STEPS[step].subtitle}</p>
          </div>

          {/* Step 1 */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label>Emri i Biznesit</Label>
                <Input placeholder="p.sh. Kafeja Besa" value={data.business_name}
                  onChange={e => update('business_name', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Industria</Label>
                <Select value={data.industry} onValueChange={v => update('industry', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Zgjidhni industrinë..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Qyteti</Label>
                <Select value={data.city} onValueChange={v => update('city', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Zgjidhni qytetin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sa vite është aktiv biznesi?</Label>
                <Select value={data.years_operating} onValueChange={v => update('years_operating', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Zgjidhni..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sapo kam filluar (0-1 vit)", "1-2 vite", "2-5 vite", "5-10 vite", "Mbi 10 vite"].map(y =>
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Numri i Punonjësve</Label>
                <Select value={data.employee_count} onValueChange={v => update('employee_count', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Zgjidhni..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["Vetëm unë", "2-5 punonjës", "6-10 punonjës", "11-25 punonjës", "26-50 punonjës", "Mbi 50 punonjës"].map(e =>
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Xhiroja Mujore (opsionale)</Label>
                <Select value={data.monthly_revenue_range} onValueChange={v => update('monthly_revenue_range', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Zgjidhni rangun..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Nën 500,000 ALL", "500K - 1M ALL", "1M - 3M ALL",
                      "3M - 5M ALL", "5M - 10M ALL", "Mbi 10M ALL", "Preferoj të mos tregoj"
                    ].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => update('has_nipt', !data.has_nipt)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${data.has_nipt ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                  {data.has_nipt && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Biznesi im ka NIPT</div>
                  <div className="text-xs text-gray-400 mt-0.5">Numri i Identifikimit të Personit Tatimpagues</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">Zgjidhni një ose më shumë fusha ku dëshironi ndihmë:</p>
              {NEEDS.map(n => (
                <div key={n.id}
                  onClick={() => toggleNeed(n.id)}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${data.needs.includes(n.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${data.needs.includes(n.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                    {data.needs.includes(n.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{n.label}</div>
                    <div className="text-xs text-gray-400">{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4 */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Cila është sfida juaj më e madhe tani?</Label>
                <Textarea
                  placeholder="p.sh. Kam vështirësi të gjej klientë të rinj. Shpenzoj shumë kohë duke bërë listë-pagesat manualisht. Nuk di si të rris çmimet pa humbur klientët..."
                  value={data.biggest_challenge}
                  onChange={e => update('biggest_challenge', e.target.value)}
                  rows={5}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Sa më shumë detaje të jepni, aq më të personalizuara do të jenë këshillat.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 gap-2">
                <ChevronLeft className="w-4 h-4" />
                Kthehu
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="flex-1 gap-2">
                Vazhdo
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading} className="flex-1 gap-2">
                {loading ? 'Duke ruajtur...' : 'Hyr në BiznesiYt'}
                <Zap className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Mund ta plotësoni profilin plotësisht më vonë nga Cilësimet
        </p>
      </div>
    </div>
  )
}
