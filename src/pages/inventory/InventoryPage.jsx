import React from 'react'
import { Link } from 'react-router-dom'
import { Package, PackagePlus, Boxes, ListOrdered, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

const tools = [
  { icon: PackagePlus, title: 'Shto Produkt',      desc: 'Regjistro produktet dhe shërbimet e tua me çmime, kategori dhe detaje.',    href: '/inventory/products/new', color: 'text-teal-500', bg: 'bg-teal-50', grad: 'from-teal-400 to-cyan-500',    cta: 'Shto Produkt' },
  { icon: Boxes,       title: 'Gjendja e Stokut',  desc: 'Shiko çfarë ke, çfarë po mbaron, dhe çfarë duhet porositur.',              href: '/inventory/stock',        color: 'text-amber-500',bg: 'bg-amber-50',grad: 'from-amber-400 to-orange-500', cta: 'Shiko Stokun' },
  { icon: ListOrdered, title: 'Lista e Çmimeve',   desc: 'Gjenero listë çmimesh profesionale — gati për print, faqen web, ose klientët.', href: '/inventory/pricelist', color: 'text-violet-500', bg: 'bg-violet-50', grad: 'from-violet-400 to-purple-500', cta: 'Krijo Listën' },
  { icon: TrendingUp,  title: 'Analiza Produktesh',desc: 'Zbulo çfarë shitet më shumë, çfarë fiton më shumë, dhe çfarë nuk lëviz.',  href: '/inventory/analysis',     color: 'text-cyan-500', bg: 'bg-cyan-50', grad: 'from-cyan-400 to-blue-500',    cta: 'Analizo Produktet' },
]

export default function InventoryPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white rounded-full"/>
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white rounded-full"/>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <Package className="w-7 h-7 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200"/>
              <span className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Modul</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">Produktet & Inventari</h1>
            <p className="text-cyan-100 text-sm mt-0.5">Menaxho produktet, çmimet dhe stokun — gjithçka në një vend</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
            <span className="text-3xl font-bold">4</span>
            <span className="text-xs text-cyan-200">mjete aktive</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map(t => (
          <Link key={t.href} to={t.href} className="group block">
            <div className="relative h-full bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-4 overflow-hidden">
              <div className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center`}>
                <t.icon className={`w-6 h-6 ${t.color}`}/>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-gray-900 mb-1.5">{t.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
              </div>
              <div className={`flex items-center text-sm font-semibold bg-gradient-to-r ${t.grad} bg-clip-text text-transparent`}>
                {t.cta} <ArrowRight className={`w-4 h-4 ml-1 ${t.color} transition-transform group-hover:translate-x-0.5`}/>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${t.grad} opacity-0 group-hover:opacity-100 transition-opacity`}/>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
