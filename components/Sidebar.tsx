'use client'

import { useState } from 'react'
import { LayoutDashboard, Wallet, TrendingUp, LogOut, Infinity, Menu, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export type View = 'debts' | 'strategy'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  debtCount: number
  onLogout: () => void
}

export function Sidebar({ currentView, onViewChange, debtCount, onLogout }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'debts' as View, label: 'My Debts', icon: Wallet, badge: debtCount },
    { id: 'strategy' as View, label: 'My Strategy', icon: TrendingUp },
  ]

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    onLogout()
  }

  const handleNavClick = (view: View) => {
    onViewChange(view)
    setIsMobileMenuOpen(false) // Close mobile menu on navigation
  }

  return (
    <>
    {/* Mobile Header */}
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-background-dark border-b border-border-dark p-4">
      <div className="flex items-center gap-3">
        <Infinity className="text-teal-500 w-8 h-8" strokeWidth={2} />
        <h1 className="text-xl font-bold text-white">Snowball</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleLogoutClick}
          className="text-gray-400 hover:text-white transition-colors p-2"
          aria-label="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Sidebar */}
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      flex w-64 flex-col border-r border-border-dark bg-background-dark p-4
      transform transition-transform duration-200 ease-in-out
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo - Hidden on mobile (shown in header) */}
      <div className="hidden lg:flex items-center gap-3 p-2 mb-8">
        <Infinity className="text-teal-500 w-8 h-8" strokeWidth={2} />
        <h1 className="text-xl font-bold text-white">Snowball</h1>
      </div>

      {/* Mobile: Close button and logo */}
      <div className="lg:hidden flex items-center justify-between p-2 mb-8">
        <div className="flex items-center gap-3">
          <Infinity className="text-teal-500 w-8 h-8" strokeWidth={2} />
          <h1 className="text-xl font-bold text-white">Snowball</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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

      {/* Spacer to push logout to bottom */}
      <div className="flex-1"></div>

      {/* Logout */}
      <button
        onClick={handleLogoutClick}
        className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-gray-300 rounded-lg transition-colors text-sm font-medium mt-4"
        aria-label="Log out"
      >
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button>
    </aside>

    {/* Logout Confirmation */}
    <ConfirmDialog
      isOpen={showLogoutConfirm}
      onClose={() => setShowLogoutConfirm(false)}
      onConfirm={confirmLogout}
      title="Log Out"
      message="Are you sure you want to log out? Your data is saved and you can log back in anytime."
      confirmText="Log Out"
      cancelText="Stay"
      variant="warning"
    />
    </>
  )
}
