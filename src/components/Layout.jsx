import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, MessageSquare, TrendingUp, BarChart3, Scale,
  Rocket, Settings, LogOut, Zap, Menu, Bell, BarChart2, Briefcase
} from 'lucide-react'
import { cn } from '../lib/utils'

const MAIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',      href: '/dashboard' },
  { icon: MessageSquare,   label: 'Këshilltari AI', href: '/chat' },
]

const MODULE_NAV = [
  { icon: TrendingUp, label: 'Marketing',        href: '/marketing', dot: 'bg-orange-400',  activeBg: 'bg-orange-50',   activeText: 'text-orange-700',  activeIcon: 'text-orange-500'  },
  { icon: BarChart3,  label: 'Financiar',        href: '/financial', dot: 'bg-blue-400',    activeBg: 'bg-blue-50',     activeText: 'text-blue-700',    activeIcon: 'text-blue-500'    },
  { icon: Scale,      label: 'Ligjore & Fiskal', href: '/legal',     dot: 'bg-purple-400',  activeBg: 'bg-purple-50',   activeText: 'text-purple-700',  activeIcon: 'text-purple-500'  },
  { icon: Rocket,     label: 'Rritje',           href: '/growth',    dot: 'bg-emerald-400', activeBg: 'bg-emerald-50',  activeText: 'text-emerald-700', activeIcon: 'text-emerald-500' },
  { icon: Briefcase,  label: 'HR & Ekipi',       href: '/hr',        dot: 'bg-teal-400',    activeBg: 'bg-teal-50',     activeText: 'text-teal-700',    activeIcon: 'text-teal-500'    },
  { icon: BarChart2,  label: 'Raporte',          href: '/raporte',   dot: 'bg-slate-400',   activeBg: 'bg-slate-100',   activeText: 'text-slate-700',   activeIcon: 'text-slate-500'   },
]

const GRADS = [
  'from-violet-500 to-indigo-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-500',
]

function nameGrad(name) { return GRADS[(name || '').charCodeAt(0) % GRADS.length] }
function initials(name) { return (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() }

const PLAN_BADGE = {
  free:       'bg-gray-100 text-gray-500',
  starter:    'bg-blue-100 text-blue-600',
  pro:        'bg-violet-100 text-violet-600',
  business:   'bg-amber-100 text-amber-700',
  enterprise: 'bg-emerald-100 text-emerald-700',
}

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleSignOut() { await signOut(); navigate('/') }

  function active(href) {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">

      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-200/60 group-hover:shadow-primary-300/60 transition-shadow">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5}/>
          </div>
          <span className="font-heading font-bold text-[15px] tracking-tight text-gray-900">
            BiznesiYt<span className="text-primary-500">.al</span>
          </span>
        </Link>
      </div>

      {/* ── Business card ── */}
      {profile && (
        <div className="mx-3 mt-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100/80">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${nameGrad(profile.business_name || profile.full_name)} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm`}>
              {(profile.business_name || profile.full_name || 'B')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 truncate leading-tight">
                {profile.business_name || 'Biznesi im'}
              </p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-tight">
                {profile.industry || 'Pa industri'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">

        {/* Main items */}
        {MAIN_NAV.map(item => {
          const isActive = active(item.href)
          return (
            <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-700'
              )}>
              <item.icon className={cn('w-[17px] h-[17px] flex-shrink-0 transition-colors', isActive ? 'text-primary-500' : 'text-gray-400')} strokeWidth={isActive ? 2.5 : 2}/>
              {item.label}
            </Link>
          )
        })}

        {/* Section label */}
        <div className="pt-4 pb-1.5 px-3">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-gray-300">Modulet</p>
        </div>

        {/* Module items */}
        {MODULE_NAV.map(item => {
          const isActive = active(item.href)
          return (
            <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all group',
                isActive
                  ? `${item.activeBg} ${item.activeText} font-semibold`
                  : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-700'
              )}>
              <item.icon className={cn('w-[17px] h-[17px] flex-shrink-0 transition-colors', isActive ? item.activeIcon : 'text-gray-350 group-hover:text-gray-400')} strokeWidth={isActive ? 2.5 : 2}/>
              <span className="flex-1 truncate">{item.label}</span>
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all', item.dot, isActive ? 'opacity-90 scale-110' : 'opacity-0 group-hover:opacity-30')}/>
            </Link>
          )
        })}

        {/* Separator */}
        <div className="pt-3 pb-1"><div className="border-t border-gray-100"/></div>

        {/* Settings */}
        {(() => {
          const isActive = active('/settings')
          return (
            <Link to="/settings" onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all',
                isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-700'
              )}>
              <Settings className={cn('w-[17px] h-[17px] flex-shrink-0', isActive ? 'text-primary-500' : 'text-gray-400')} strokeWidth={isActive ? 2.5 : 2}/>
              Cilësimet
            </Link>
          )
        })()}
      </nav>

      {/* ── User ── */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-2xl hover:bg-gray-50 transition-colors group">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${nameGrad(profile?.full_name)} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm`}>
            {initials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-800 truncate leading-tight">{profile?.full_name || 'Profili'}</p>
            <span className={cn('inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full mt-0.5', PLAN_BADGE[profile?.plan] || PLAN_BADGE.free)}>
              {profile?.plan || 'free'}
            </span>
          </div>
          <button onClick={handleSignOut}
            className="p-1.5 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
            <LogOut className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 border-r border-gray-100 flex-shrink-0">
        <SidebarContent/>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}/>
          <aside className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl z-50">
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-gray-600"/>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5}/>
            </div>
            <span className="font-heading font-bold text-gray-900 text-sm tracking-tight">
              BiznesiYt<span className="text-primary-500">.al</span>
            </span>
          </Link>
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-500"/>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
