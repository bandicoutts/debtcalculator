'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Debt, UserSettings } from '@/types/debt.types'
import { Sidebar, View } from '@/components/Sidebar'
import { DashboardView } from '@/components/views/DashboardView'
import { ManageDebtsView } from '@/components/views/ManageDebtsView'
import { ResultsView } from '@/components/views/ResultsView'
import { AuthView } from '@/components/views/AuthView'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [debts, setDebts] = useState<Debt[]>([])
  const [extraPayment, setExtraPayment] = useState(0)

  const supabase = createClient()

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Test Supabase connection
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Supabase client initialized:', !!supabase)

        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          await loadUserData(user.id)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setDebts([])
        setExtraPayment(0)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Load debts
      const { data: debtsData, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (debtsError) throw debtsError
      setDebts(debtsData || [])

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw settingsError
      }

      if (settingsData) {
        setExtraPayment(settingsData.extra_payment || 0)
      } else {
        // Create default settings
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: userId, extra_payment: 0 })

        if (insertError) console.error('Error creating settings:', insertError)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    console.log('Attempting login...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Login error:', error)
      throw error
    }
    console.log('Login successful:', data)
  }

  const handleSignup = async (email: string, password: string) => {
    console.log('Attempting signup...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      }
    })

    console.log('Signup response:', { data, error })

    if (error) {
      console.error('Signup error:', error)
      throw error
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.log('Email confirmation required')
      alert('Success! Please check your email to confirm your account before signing in.')
      throw new Error('Please check your email to confirm your account')
    }

    console.log('Signup successful, user logged in')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDebts([])
    setExtraPayment(0)
    setCurrentView('dashboard')
  }

  const handleAddDebt = async (debtData: Omit<Debt, 'id'>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        ...debtData
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding debt:', error)
      alert('Failed to add debt. Please try again.')
      return
    }

    setDebts([...debts, data])
  }

  const handleUpdateDebt = async (id: string, updates: Partial<Debt>) => {
    const { error } = await supabase
      .from('debts')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating debt:', error)
      alert('Failed to update debt. Please try again.')
      return
    }

    setDebts(debts.map(debt => debt.id === id ? { ...debt, ...updates } : debt))
  }

  const handleDeleteDebt = async (id: string) => {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting debt:', error)
      alert('Failed to delete debt. Please try again.')
      return
    }

    setDebts(debts.filter(debt => debt.id !== id))
  }

  const handleUpdateExtraPayment = async (amount: number) => {
    if (!user) return

    const { error } = await supabase
      .from('user_settings')
      .update({ extra_payment: amount })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating extra payment:', error)
      alert('Failed to update extra payment. Please try again.')
      return
    }

    setExtraPayment(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthView onLogin={handleLogin} onSignup={handleSignup} />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        debtCount={debts.length}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <DashboardView
            debts={debts}
            extraPayment={extraPayment}
            onUpdateExtraPayment={handleUpdateExtraPayment}
          />
        )}
        {currentView === 'debts' && (
          <ManageDebtsView
            debts={debts}
            onAddDebt={handleAddDebt}
            onUpdateDebt={handleUpdateDebt}
            onDeleteDebt={handleDeleteDebt}
          />
        )}
        {currentView === 'results' && (
          <ResultsView debts={debts} extraPayment={extraPayment} />
        )}
      </main>
    </div>
  )
}
