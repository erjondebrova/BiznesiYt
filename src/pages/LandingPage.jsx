import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  TrendingUp, Shield, BarChart3, MessageSquare, ArrowRight,
  CheckCircle, Star, Zap, Users, Building2, ChevronRight
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: "Këshilltari AI 24/7",
    desc: "Merr këshilla të personalizuara për biznesin tënd çdo orë, çdo ditë. AI-ja jonë kupton kontekstin shqiptar.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Marketing i Zgjuar",
    desc: "Gjenero plane marketingu, postime sociale dhe analiza konkurrence me një klik.",
    color: "text-secondary-500",
    bg: "bg-orange-50",
  },
  {
    icon: BarChart3,
    title: "Financa & Çmimim",
    desc: "Llogarit çmimet e duhura, parashiko fluksin e parasë dhe menaxho financat me saktësi.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Ligjore & Fiskale",
    desc: "Përgjigje të shpejta për çështje fiskale shqiptare, kalendarë TVSH dhe template dokumentash.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
]

const industries = [
  "Restorant & Kafene", "Dyqan & Retail", "Shërbime Profesionale",
  "Ndërtim & Prodhim", "IT & Teknologji", "Turizëm & Hoteli",
]

const stats = [
  { value: "500+", label: "Biznese Aktive" },
  { value: "98%", label: "Kënaqësi Klientësh" },
  { value: "3x", label: "Rritje Mesatare" },
  { value: "24/7", label: "Disponueshmëri" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-gray-900">BiznesiYt</span>
            <span className="text-primary-500 font-bold text-xl">.al</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Karakteristika</a>
            <a href="#industries" className="hover:text-gray-900 transition-colors">Industritë</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Çmimet</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Hyr</Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm">Fillo Falas</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-orange-50 pt-20 pb-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <Badge variant="secondary" className="mb-6 text-secondary-700 bg-secondary-50 border-secondary-200">
            🚀 Platforma #1 AI për Biznese Shqiptare
          </Badge>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Këshilltari juaj AI i{" "}
            <span className="text-primary-500">Biznesit</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Marketing, financa, ligjore dhe rritje biznesi — gjithçka që ju duhet,
            personalizuar për biznesin tuaj shqiptar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="xl" className="gap-2 shadow-lg">
                Fillo Falas — Pa Kartë Krediti
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="xl">
                Shiko Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            ✓ 14 ditë falas &nbsp;&nbsp; ✓ Pa kontratë &nbsp;&nbsp; ✓ Anulo kur të duash
          </p>
        </div>

        {/* Floating cards */}
        <div className="hidden lg:block absolute left-8 top-1/3 -translate-y-1/2">
          <div className="bg-white rounded-xl shadow-card p-4 w-52 animate-slide-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Rritja Mujore</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">+23%</div>
            <div className="text-xs text-green-600 mt-1">↑ krahasuar me muajin e kaluar</div>
          </div>
        </div>
        <div className="hidden lg:block absolute right-8 top-1/4">
          <div className="bg-white rounded-xl shadow-card p-4 w-56">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Këshilla e Ditës</span>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              "Rrit frekuencën e postimeve në Instagram — bizneset si juaji shohin 40% më shumë engagement..."
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-3xl font-bold text-primary-500">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">
              Gjithçka që biznesi juaj ka nevojë
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Katër module të plota, të dizajnuara posaçërisht për realitetin e bizneseve shqiptare.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover p-6">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-20 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Për çdo industri në Shqipëri
          </h2>
          <p className="text-primary-200 mb-10">
            Këshilla të personalizuara bazuar në industrinë dhe madhësinë tuaj
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((ind) => (
              <span key={ind} className="px-4 py-2 bg-white/10 border border-white/20 text-white text-sm rounded-full hover:bg-white/20 transition-colors cursor-default">
                {ind}
              </span>
            ))}
            <span className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 text-sm rounded-full">
              + shumë të tjera...
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">Si funksionon?</h2>
            <p className="text-lg text-gray-500">Tre hapa të thjeshtë deri te këshillat e para</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Krijo llogari falas", desc: "Regjistrohu me email ose Google. Gati në 30 sekonda." },
              { step: "02", title: "Plotëso profilin", desc: "Na trego për biznesin tënd. Pyetja zgjat 3 minuta." },
              { step: "03", title: "Merr këshilla", desc: "AI-ja gjeneron plane dhe këshilla konkrete për ty." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-primary-500 font-bold text-lg">{s.step}</span>
                </div>
                <h3 className="font-heading font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4">Çmimet</h2>
            <p className="text-lg text-gray-500">Transparent dhe i përballueshëm për çdo biznes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Falas", price: "0 ALL", period: "/muaj",
                features: ["50 mesazhe AI/muaj", "Moduli Chat", "Këshilla e ditës"],
                cta: "Fillo Falas", variant: "outline",
              },
              {
                name: "Pro", price: "990 ALL", period: "/muaj",
                features: ["Mesazhe të pakufizuara", "Të gjithë modulet", "Plan marketingu AI", "Llogaritës çmimesh"],
                cta: "Fillo 14 ditë falas", variant: "default", popular: true,
              },
              {
                name: "Business", price: "2,490 ALL", period: "/muaj",
                features: ["Gjithçka në Pro", "Raporte PDF", "Njoftime email", "Mbështetje prioritare"],
                cta: "Kontakto Sales", variant: "outline",
              },
            ].map((plan) => (
              <div key={plan.name} className={`card p-6 relative ${plan.popular ? 'border-2 border-primary-500 shadow-card-hover' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="bg-primary-500 text-white text-xs">Më i Popullarit</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <div className="font-heading font-bold text-gray-900 text-lg">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-heading text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/register">
                  <Button variant={plan.variant} className="w-full">{plan.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Gati të transformoni biznesin tuaj?
          </h2>
          <p className="text-primary-200 mb-8 text-lg">
            Bashkohuni me 500+ biznese shqiptare që tashmë po rriten me BiznesiYt.al
          </p>
          <Link to="/auth/register">
            <Button size="xl" className="bg-white text-primary-600 hover:bg-gray-50 shadow-lg">
              Fillo Falas Sot
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-gray-900">BiznesiYt<span className="text-primary-500">.al</span></span>
          </div>
          <p className="text-sm text-gray-400">© 2025 BiznesiYt.al — E gjitha të drejtat e rezervuara</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privatësia</a>
            <a href="#" className="hover:text-gray-600">Kushtet</a>
            <a href="#" className="hover:text-gray-600">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
