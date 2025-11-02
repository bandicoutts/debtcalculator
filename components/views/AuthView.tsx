'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Infinity, Check, X } from 'lucide-react'

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string) => Promise<void>
}

export function AuthView({ onLogin, onSignup }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
  }

  const isPasswordValid = passwordRequirements.minLength && passwordRequirements.hasLetter

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Forgot password flow
    if (isForgotPassword) {
      if (!email) {
        setError('Please enter your email address')
        return
      }

      setLoading(true)
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) throw error

        toast.success('Password reset email sent! Check your inbox.')
        setIsForgotPassword(false)
        setEmail('')
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email')
      } finally {
        setLoading(false)
      }
      return
    }

    // Regular login/signup
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!isLogin) {
      if (!isPasswordValid) {
        setError('Password must be at least 6 characters and contain letters')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    setLoading(true)
    try {
      if (isLogin) {
        await onLogin(email, password)
      } else {
        await onSignup(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
      <Card className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Infinity className="text-teal-500 w-10 h-10" strokeWidth={2} />
          <h1 className="text-2xl font-bold text-white">Snowball</h1>
        </div>

        {/* Title */}
        <h2 className="text-xl font-medium text-white mb-2 text-center">
          {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          {isForgotPassword
            ? 'Enter your email to receive a password reset link'
            : isLogin
            ? 'Sign in to continue to your account'
            : 'Sign up to start managing your debt'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!isForgotPassword && (
            <>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!isLogin && (
                <>
                  {/* Password Requirements */}
                  {password && (
                    <div className="space-y-2 -mt-2">
                      <p className="text-xs text-gray-400">Password requirements:</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {passwordRequirements.minLength ? (
                            <Check className="w-4 h-4 text-teal-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-500" />
                          )}
                          <span className={passwordRequirements.minLength ? 'text-teal-500' : 'text-gray-500'}>
                            At least 6 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordRequirements.hasLetter ? (
                            <Check className="w-4 h-4 text-teal-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-500" />
                          )}
                          <span className={passwordRequirements.hasLetter ? 'text-teal-500' : 'text-gray-500'}>
                            Contains letters
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </>
              )}

              {isLogin && (
                <div className="text-right -mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true)
                      setError('')
                      setPassword('')
                    }}
                    className="text-sm text-teal-500 hover:text-teal-400 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
          >
            {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center space-y-2">
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false)
                setError('')
              }}
              className="text-sm text-gray-400 hover:text-teal-500 transition-colors"
            >
              Back to sign in
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setConfirmPassword('')
                setPassword('')
              }}
              className="text-sm text-gray-400 hover:text-teal-500 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
