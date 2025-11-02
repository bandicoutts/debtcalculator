'use client'

import { LayoutDashboard, Wallet, TrendingUp, LogOut, Infinity } from 'lucide-react'

export type View = 'dashboard' | 'debts' | 'results'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  debtCount: number
  onLogout: () => void
}

export function Sidebar({ currentView, onViewChange, debtCount, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'debts' as View, label: 'Debts', icon: Wallet, badge: debtCount },
    { id: 'results' as View, label: 'Results', icon: TrendingUp },
  ]

  return (
    <aside className="flex w-64 flex-col border-r border-border-dark bg-background-dark p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 p-2 mb-8">
        <Infinity className="text-teal-500 w-8 h-8" strokeWidth={2} />
        <h1 className="text-xl font-bold text-white">Snowball</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-teal-700/10 text-teal-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700/20 text-xs font-semibold text-teal-400">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-gray-300 rounded-lg transition-colors text-sm font-medium"
      >
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button>
    </aside>
  )
}
