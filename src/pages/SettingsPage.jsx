import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Lock, Mail, Trash2, Camera, Sun, Moon, Monitor,
  Download, ChevronDown, ChevronUp, Eye, EyeOff
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

function SectionCard({ icon: Icon, iconColor = 'text-gray-500', iconBg = 'bg-gray-100', title, children }) {
  return (
    <div className="card space-y-4 mb-4">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h2 className="font-heading font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function StatusMsg({ type, msg }) {
  if (!msg) return null
  return (
    <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
      {type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  )
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
  localStorage.setItem('theme', theme)
}

export default function SettingsPage() {
  const { profile, user, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  // Profile form
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    business_name: profile?.business_name || '',
    industry: profile?.industry || '',
    city: profile?.city || '',
    years_operating: profile?.years_operating || '',
    employee_count: profile?.employee_count || '',
    biggest_challenge: profile?.biggest_challenge || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Photo
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  // Password
  const [showPass, setShowPass] = useState(false)
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' })
  const [showPassWords, setShowPassWords] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSaving, setPassSaving] = useState(false)
  const [passSaved, setPassSaved] = useState(false)

  // Email
  const [showEmail, setShowEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || profile?.theme_preference || 'system')

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        business_name: profile.business_name || '',
        industry: profile.industry || '',
        city: profile.city || '',
        years_operating: profile.years_operating || '',
        employee_count: profile.employee_count || '',
        biggest_challenge: profile.biggest_challenge || '',
      })
      setAvatarUrl(profile.avatar_url || '')
      const savedTheme = localStorage.getItem('theme') || profile.theme_preference || 'system'
      setTheme(savedTheme)
    }
  }, [profile])

  function update(field, val) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function save() {
    setSaving(true)
    setSaveError('')
    try {
      const { error } = await supabase.from('users_profile').upsert({
        id: user.id,
        ...form,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setPhotoError('Fotoja duhet të jetë më e vogël se 2MB.'); return }
    setPhotoUploading(true)
    setPhotoError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = data.publicUrl + '?t=' + Date.now()
      await supabase.from('users_profile').update({ avatar_url: url }).eq('id', user.id)
      setAvatarUrl(url)
      await refreshProfile()
    } catch (err) {
      setPhotoError('Ngarkimi dështoi. Sigurohu që Storage është aktivizuar.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function changePassword() {
    setPassError('')
    if (passForm.next.length < 6) { setPassError('Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere.'); return }
    if (passForm.next !== passForm.confirm) { setPassError('Fjalëkalimet nuk përputhen.'); return }
    setPassSaving(true)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email: user.email, password: passForm.current })
      if (authErr) { setPassError('Fjalëkalimi aktual është i gabuar.'); return }
      const { error: updErr } = await supabase.auth.updateUser({ password: passForm.next })
      if (updErr) throw updErr
      setPassSaved(true)
      setPassForm({ current: '', next: '', confirm: '' })
      setTimeout(() => { setPassSaved(false); setShowPass(false) }, 2500)
    } catch (err) {
      setPassError(err.message)
    } finally {
      setPassSaving(false)
    }
  }

  async function changeEmail() {
    setEmailError('')
    if (!newEmail || !newEmail.includes('@')) { setEmailError('Fut një email të vlefshëm.'); return }
    if (newEmail === user.email) { setEmailError('Ky është tashmë emaili yt aktual.'); return }
    setEmailSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setEmailSent(true)
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setEmailSaving(false)
    }
  }

  async function handleThemeChange(val) {
    setTheme(val)
    applyTheme(val)
    await supabase.from('users_profile').update({ theme_preference: val }).eq('id', user.id)
  }

  function exportData() {
    const data = {
      email: user.email,
      profile,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biznesiytal-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'FSHI') { setDeleteError('Shkruaj FSHI për të konfirmuar.'); return }
    setDeleting(true)
    setDeleteError('')
    try {
      await supabase.from('users_profile').delete().eq('id', user.id)
      await supabase.auth.signOut()
      navigate('/')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('sq-AL', { year: 'numeric', month: 'long' }) : ''

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Cilësimet</h1>
          <p className="text-xs text-gray-400">{memberSince && `Anëtar që nga ${memberSince}`}</p>
        </div>
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

      {/* Profile Photo */}
      <SectionCard icon={Camera} iconColor="text-violet-500" iconBg="bg-violet-50" title="Foto Profili">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-xl">{initials(profile?.full_name)}</span>
            }
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">JPG, PNG — max 2MB. Shfaqet në të gjithë aplikacionin.</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={photoUploading} className="gap-2">
              <Camera className="w-4 h-4" />
              {photoUploading ? 'Duke ngarkuar...' : 'Ndrysho Foton'}
            </Button>
          </div>
        </div>
        <StatusMsg type="error" msg={photoError} />
      </SectionCard>

      {/* Personal Profile */}
      <SectionCard icon={User} iconColor="text-blue-500" iconBg="bg-blue-50" title="Profili Personal">
        <div>
          <Label>Emri i Plotë</Label>
          <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="mt-1" />
        </div>
      </SectionCard>

      {/* Business Profile */}
      <SectionCard icon={Building2} iconColor="text-emerald-500" iconBg="bg-emerald-50" title="Profili i Biznesit">
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
            <Textarea value={form.biggest_challenge} onChange={e => update('biggest_challenge', e.target.value)} rows={3} className="mt-1" />
          </div>
        </div>
        <StatusMsg type="error" msg={saveError} />
        <StatusMsg type="success" msg={saved ? 'Ndryshimet u ruajtën me sukses!' : ''} />
        <Button onClick={save} disabled={saving} className="w-full gap-2">
          {saving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
        </Button>
      </SectionCard>

      {/* Security */}
      <SectionCard icon={Lock} iconColor="text-orange-500" iconBg="bg-orange-50" title="Siguria e Llogarisë">
        {/* Password Change */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => { setShowPass(v => !v); setPassError(''); setPassSaved(false) }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Ndrysho Fjalëkalimin
            </div>
            {showPass ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showPass && (
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3 bg-gray-50/50">
              <div className="relative">
                <Label>Fjalëkalimi Aktual</Label>
                <Input
                  type={showPassWords ? 'text' : 'password'}
                  value={passForm.current}
                  onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))}
                  className="mt-1 pr-10"
                />
                <button onClick={() => setShowPassWords(v => !v)} className="absolute right-3 top-8 text-gray-400">
                  {showPassWords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div>
                <Label>Fjalëkalimi i Ri</Label>
                <Input
                  type={showPassWords ? 'text' : 'password'}
                  value={passForm.next}
                  onChange={e => setPassForm(p => ({ ...p, next: e.target.value }))}
                  className="mt-1"
                  placeholder="Min. 6 karaktere"
                />
              </div>
              <div>
                <Label>Konfirmo Fjalëkalimin e Ri</Label>
                <Input
                  type={showPassWords ? 'text' : 'password'}
                  value={passForm.confirm}
                  onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
                  className="mt-1"
                  onKeyDown={e => e.key === 'Enter' && changePassword()}
                />
              </div>
              <StatusMsg type="error" msg={passError} />
              <StatusMsg type="success" msg={passSaved ? 'Fjalëkalimi u ndryshua me sukses!' : ''} />
              <Button onClick={changePassword} disabled={passSaving} className="w-full gap-2" size="sm">
                {passSaving ? 'Duke ndryshuar...' : 'Ndrysho Fjalëkalimin'}
              </Button>
            </div>
          )}
        </div>

        {/* Email Change */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => { setShowEmail(v => !v); setEmailError(''); setEmailSent(false); setNewEmail('') }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Ndrysho Email-in
              <span className="text-xs text-gray-400 font-normal">({user?.email})</span>
            </div>
            {showEmail ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showEmail && (
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3 bg-gray-50/50">
              {emailSent ? (
                <div className="flex items-start gap-2 bg-green-50 text-green-700 rounded-lg p-3 text-sm">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email konfirmimi u dërgua!</p>
                    <p className="text-xs text-green-600 mt-0.5">Shiko inbox-in e adresës <strong>{newEmail}</strong> dhe kliko linkun e konfirmimit.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Email-i i Ri</Label>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="mt-1"
                      placeholder="email@shembull.com"
                      onKeyDown={e => e.key === 'Enter' && changeEmail()}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Do të dërgojmë një email konfirmimi në adresën e re. Ndryshimi bëhet efektiv pas konfirmimit.</p>
                  <StatusMsg type="error" msg={emailError} />
                  <Button onClick={changeEmail} disabled={emailSaving} className="w-full" size="sm">
                    {emailSaving ? 'Duke dërguar...' : 'Dërgo Email Konfirmimi'}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard icon={Sun} iconColor="text-amber-500" iconBg="bg-amber-50" title="Tema & Pamja">
        <p className="text-sm text-gray-500 -mt-2">Zgjidh si do të duket aplikacioni.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: 'system', icon: Monitor, label: 'Sistemi' },
            { val: 'light', icon: Sun, label: 'E Çelët' },
            { val: 'dark', icon: Moon, label: 'E Errët' },
          ].map(({ val, icon: Icon, label }) => (
            <button
              key={val}
              onClick={() => handleThemeChange(val)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                theme === val
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
              {theme === val && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Privacy & GDPR */}
      <SectionCard icon={Shield} iconColor="text-slate-500" iconBg="bg-slate-100" title="Privatësia & GDPR">
        <p className="text-xs text-gray-500 -mt-2">
          Të dhënat tuaja ruhen në Bashkimin Europian dhe mbrohen sipas rregullores GDPR.
          Anëtar që nga: <strong>{memberSince || '—'}</strong>
        </p>

        <div className="space-y-2">
          <button
            onClick={exportData}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-gray-400" />
            Eksporto të dhënat e mia (JSON)
          </button>

          <a
            href="/privacy"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 font-medium transition-colors block"
          >
            <Shield className="w-4 h-4 text-gray-400" />
            Politika e Privatësisë
          </a>

          <button
            onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError('') }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-sm text-red-600 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Fshi Llogarinë Time
          </button>
        </div>
      </SectionCard>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-heading font-bold text-gray-900 text-center mb-1">Fshi Llogarinë?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Ky veprim është <strong>i pakthyeshëm</strong>. Të gjitha të dhënat tuaja do të fshihen përgjithmonë.
            </p>
            <div className="mb-4">
              <Label>Shkruaj <strong>FSHI</strong> për të konfirmuar</Label>
              <Input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="FSHI"
                className="mt-1 text-center font-mono"
              />
            </div>
            <StatusMsg type="error" msg={deleteError} />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>Anulo</Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={deleting || deleteConfirm !== 'FSHI'}
                onClick={deleteAccount}
              >
                {deleting ? 'Duke fshirë...' : 'Fshi Llogarinë'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
