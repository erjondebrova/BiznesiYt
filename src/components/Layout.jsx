import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, MessageSquare, TrendingUp, BarChart3, Scale,
  Rocket, Settings, LogOut, Zap, Menu, X, ChevronRight, Bell, BarChart2, Briefcase
} from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: MessageSquare, label: 'Këshilltari AI', href: '/chat' },
  { type: 'separator', label: 'Modulet' },
  { icon: TrendingUp, label: 'Marketing', href: '/marketing' },
  { icon: BarChart3, label: 'Financiar', href: '/financial' },
  { icon: Scale, label: 'Ligjore & Fiskal', href: '/legal' },
  { icon: Rocket, label: 'Rritje', href: '/growth' },
  { icon: Briefcase, label: 'HR & Ekipi', href: '/hr' },
  { icon: BarChart2, label: 'Raporte', href: '/raporte' },
  { type: 'separator' },
  { icon: Settings, label: 'Cilësimet', href: '/settings' },
]

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-heading font-bold text-gray-900">
            BiznesiYt<span className="text-primary-500">.al</span>
          </span>
        </Link>
      </div>

      {/* Profile snippet */}
      {profile && (
        <div className="px-4 py-3 mx-3 mt-3 bg-primary-50 rounded-xl">
          <div className="text-xs text-primary-600 font-medium">{profile.business_name || 'Biznesi im'}</div>
          <div className="text-xs text-gray-400 mt-0.5">{profile.industry || ''}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'separator') {
            return (
              <div key={i} className="py-3">
                {item.label && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3">{item.label}</div>}
                {!item.label && <div className="border-t border-gray-100" />}
              </div>
            )
          }
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn("sidebar-link", isActive && "active")}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">{profile?.full_name}</div>
            <div className="text-xs text-gray-400 capitalize">{profile?.plan || 'free'}</div>
          </div>
          <button onClick={handleSignOut} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-modal z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-1 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-gray-900 text-sm">
              BiznesiYt<span className="text-primary-500">.al</span>
            </span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
