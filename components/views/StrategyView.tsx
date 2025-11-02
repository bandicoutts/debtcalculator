'use client'

import { useState, useMemo } from 'react'
import { Debt } from '@/types/debt.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { calculatePayoffComparison, calculateSnowball } from '@/lib/calculations'
import { formatCurrency } from '@/lib/formatters'
import {
  Info, TrendingDown, CreditCard, Activity, Car, GraduationCap,
  DollarSign, PartyPopper, Search, Calendar, Plus, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react'
import { DebtBalanceChart } from '@/components/charts/DebtBalanceChart'
import { DebtPayoffTimelineChart } from '@/components/charts/DebtPayoffTimelineChart'

interface StrategyViewProps {
  debts: Debt[]
  extraPayment: number
  onUpdateExtraPayment: (amount: number) => void
}

export function StrategyView({ debts, extraPayment, onUpdateExtraPayment }: StrategyViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<'snowball' | 'avalanche'>('snowball')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllMonths, setShowAllMonths] = useState(false)
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false)
  const [extraPaymentInput, setExtraPaymentInput] = useState(extraPayment.toString())
  const [isSaving, setIsSaving] = useState(false)

  const results = useMemo(() => {
    if (debts.length === 0) return null
    return calculatePayoffComparison(debts, extraPayment)
  }, [debts, extraPayment])

  // Calculate hero stats using actual snowball calculation
  const heroStats = useMemo(() => {
    if (debts.length === 0) return null
    const snowballResult = calculateSnowball(debts, extraPayment)
    return {
      totalDebt: debts.reduce((sum, debt) => sum + debt.balance, 0),
      totalMinimum: debts.reduce((sum, debt) => sum + debt.minimum_payment, 0),
      monthlyPayment: debts.reduce((sum, debt) => sum + debt.minimum_payment, 0) + extraPayment,
      debtFreeDate: snowballResult.monthsToPayoff,
      highAPRDebts: debts.filter(debt => debt.apr > 15)
    }
  }, [debts, extraPayment])

  const handleUpdateExtraPayment = async () => {
    const amount = parseFloat(extraPaymentInput)
    if (!isNaN(amount) && amount >= 0 && amount !== extraPayment) {
      setIsSaving(true)
      await onUpdateExtraPayment(amount)
      setIsSaving(false)
    }
  }

  // Auto-save on blur
  const handleBlur = () => {
    handleUpdateExtraPayment()
  }

  // Calculate savings between methods
  const calculateSavings = () => {
    if (!results) return null
    const interestDiff = results.snowball.totalInterestPaid - results.avalanche.totalInterestPaid
    const monthsDiff = results.snowball.monthsToPayoff - results.avalanche.monthsToPayoff

    if (Math.abs(interestDiff) < 1 && Math.abs(monthsDiff) === 0) {
      return { method: 'same', message: 'Both methods are equivalent for your situation' }
    }

    if (interestDiff > 0) {
      return {
        method: 'avalanche',
        message: `Saves ${formatCurrency(Math.abs(interestDiff))} in interest`,
        months: monthsDiff > 0 ? `${monthsDiff} months faster` : null
      }
    } else {
      return {
        method: 'snowball',
        message: `Saves ${formatCurrency(Math.abs(interestDiff))} in interest`,
        months: monthsDiff < 0 ? `${Math.abs(monthsDiff)} months faster` : null
      }
    }
  }

  const savings = calculateSavings()

  if (debts.length === 0) {
    return (
      <div className="p-10">
        <h1 className="text-4xl font-light text-white mb-8">My Strategy</h1>
        <Card>
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Strategy Yet</h3>
            <p className="text-gray-400 mb-6">Add your debts to see your personalized debt payoff strategy</p>
            <Button onClick={() => window.location.reload()}>
              Go to My Debts
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!results || !heroStats) return null

  const { snowball, avalanche } = results
  const selectedStrategy = selectedMethod === 'snowball' ? snowball : avalanche

  // Calculate payoff dates
  const getPayoffDate = (months: number) => {
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Get debt icon
  const getDebtIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('credit') || lowerName.includes('card')) return CreditCard
    if (lowerName.includes('medical') || lowerName.includes('hospital')) return Activity
    if (lowerName.includes('car') || lowerName.includes('auto') || lowerName.includes('vehicle')) return Car
    if (lowerName.includes('student') || lowerName.includes('school') || lowerName.includes('education')) return GraduationCap
    return DollarSign
  }

  // Get payoff order
  const payoffOrder = selectedStrategy.debtPayments.map(dp => {
    const debt = debts.find(d => d.id === dp.debtId)
    return {
      ...dp,
      icon: getDebtIcon(dp.debtName),
      balance: debt?.balance || 0
    }
  })

  // Filter monthly payments for the table
  const filteredPayments = selectedStrategy.monthlyPayments.filter(payment =>
    searchTerm ? payment.debtName.toLowerCase().includes(searchTerm.toLowerCase()) : true
  )

  const displayedPayments = showAllMonths ? filteredPayments : filteredPayments.slice(0, 20)

  return (
    <div className="p-10">
      <h1 className="text-4xl font-light text-white mb-8">My Strategy</h1>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Debt</p>
              <p className="text-3xl font-semibold text-white">{formatCurrency(heroStats.totalDebt)}</p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Debt-Free Date</p>
              <p className="text-3xl font-semibold text-white">
                {getPayoffDate(heroStats.debtFreeDate)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor(heroStats.debtFreeDate / 12)} years, {heroStats.debtFreeDate % 12} months
              </p>
            </div>
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Monthly Payment</p>
              <p className="text-3xl font-semibold text-white">{formatCurrency(heroStats.monthlyPayment)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(heroStats.totalMinimum)} minimum + {formatCurrency(extraPayment)} extra
              </p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Extra Payment Card */}
      <Card className="mb-8 border-teal-500/30">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Plus className="w-6 h-6 text-teal-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">Extra Monthly Payment</h3>
            <p className="text-gray-400 text-sm mb-4">
              Add extra money each month to pay off your debts faster and save on interest.
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={extraPaymentInput}
                  onChange={(e) => setExtraPaymentInput(e.target.value)}
                  onBlur={handleBlur}
                  disabled={isSaving}
                  className="w-full pl-7 rounded-lg bg-surface-darker border border-border-dark px-3 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  placeholder="0.00"
                  aria-label="Extra monthly payment amount"
                />
              </div>
              {isSaving && (
                <span className="text-sm text-gray-400">Saving...</span>
              )}
            </div>
            {savings && savings.method !== 'same' && (
              <p className="text-sm text-teal-500 mt-2">
                💡 Using the {savings.method === 'avalanche' ? 'Avalanche' : 'Snowball'} method {savings.message}
                {savings.months && ` and is ${savings.months}`}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* High APR Warning */}
      {heroStats.highAPRDebts.length > 0 && (
        <Card className="mb-8 border-orange-500/30">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">High-Interest Debts Detected</h3>
              <p className="text-gray-400 text-sm mb-3">
                You have {heroStats.highAPRDebts.length} debt{heroStats.highAPRDebts.length > 1 ? 's' : ''} with APR above 15%.
                Consider the Avalanche method to save on interest.
              </p>
              <ul className="space-y-1">
                {heroStats.highAPRDebts.map(debt => (
                  <li key={debt.id} className="text-sm text-gray-300">
                    {debt.name}: {debt.apr.toFixed(2)}% APR
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Method Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg bg-surface-darker p-1">
          <button
            onClick={() => setSelectedMethod('snowball')}
            className={`
              px-8 py-2 rounded-md text-sm font-medium transition-colors relative
              ${selectedMethod === 'snowball'
                ? 'bg-surface-dark text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
          >
            Snowball
            {savings?.method === 'snowball' && savings.method !== 'same' && (
              <span className="absolute -top-2 -right-2 text-xs">✨</span>
            )}
          </button>
          <button
            onClick={() => setSelectedMethod('avalanche')}
            className={`
              px-8 py-2 rounded-md text-sm font-medium transition-colors relative
              ${selectedMethod === 'avalanche'
                ? 'bg-surface-dark text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
          >
            Avalanche
            {savings?.method === 'avalanche' && savings.method !== 'same' && (
              <span className="absolute -top-2 -right-2 text-xs">✨</span>
            )}
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Snowball Method</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              Pay off smallest debts first for quick psychological wins and momentum.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Avalanche Method</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              Pay off highest-interest debts first to minimize total interest paid.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {/* Snowball Stats */}
          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Payoff Date</p>
            <p className="text-base font-medium text-white">{getPayoffDate(snowball.monthsToPayoff)}</p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Payoff Date</p>
            <p className="text-base font-medium text-white">{getPayoffDate(avalanche.monthsToPayoff)}</p>
          </div>

          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Total Interest Paid</p>
            <p className="text-base font-medium text-white">{formatCurrency(snowball.totalInterestPaid)}</p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Total Interest Paid</p>
            <p className="text-base font-medium text-white">{formatCurrency(avalanche.totalInterestPaid)}</p>
          </div>

          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Total Paid</p>
            <p className="text-base font-medium text-white">
              {formatCurrency(heroStats.totalDebt + snowball.totalInterestPaid)}
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Total Paid</p>
            <p className="text-base font-medium text-white">
              {formatCurrency(heroStats.totalDebt + avalanche.totalInterestPaid)}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Time to Freedom</p>
            <p className="text-base font-medium text-white">
              {Math.floor(snowball.monthsToPayoff / 12)} years, {snowball.monthsToPayoff % 12} months
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Time to Freedom</p>
            <p className="text-base font-medium text-white">
              {Math.floor(avalanche.monthsToPayoff / 12)} years, {avalanche.monthsToPayoff % 12} months
            </p>
          </div>
        </div>
      </Card>

      {/* Debt Payoff Flow */}
      <Card className="mb-8">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Debt Payoff Order</h3>
          <p className="text-sm text-gray-400">The order your debts will be paid off using the {selectedMethod} method.</p>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto p-4">
          {payoffOrder.map((debt, index) => {
            const Icon = debt.icon
            return (
              <div key={debt.debtId} className="flex items-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`flex size-14 items-center justify-center rounded-full border-2 ${
                    index === 0 ? 'border-teal-500 bg-teal-500/10 text-teal-500' : 'border-gray-600 bg-gray-800/50 text-gray-500'
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <p className={`text-sm font-medium ${index === 0 ? 'text-white' : 'text-gray-500'}`}>
                    {debt.debtName}
                  </p>
                  <p className="text-xs text-gray-500">{formatCurrency(debt.balance)}</p>
                </div>
                {index < payoffOrder.length && (
                  <div className="h-px w-8 flex-shrink-0 bg-gray-700 mx-2"></div>
                )}
              </div>
            )
          })}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-800/50 text-gray-500">
              <PartyPopper className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-gray-500">Debt Free!</p>
            <p className="text-xs text-gray-500">{getPayoffDate(selectedStrategy.monthsToPayoff)}</p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Debt Balance Over Time</h3>
            <p className="text-sm text-gray-400">Total remaining debt balance projection.</p>
          </div>
          <DebtBalanceChart monthlyPayments={selectedStrategy.monthlyPayments} />
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Debt Payoff Timeline</h3>
            <p className="text-sm text-gray-400">Visual timeline of when each debt is paid off.</p>
          </div>
          <DebtPayoffTimelineChart monthlyPayments={selectedStrategy.monthlyPayments} />
        </Card>
      </div>

      {/* Month-by-Month Breakdown (Collapsible) */}
      <Card>
        <button
          onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
        >
          <div className="text-left">
            <h3 className="text-base font-bold text-white">Detailed Payment Schedule</h3>
            <p className="text-sm text-gray-400">Month-by-month breakdown of all payments</p>
          </div>
          {showMonthlyBreakdown ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showMonthlyBreakdown && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  className="w-full rounded-lg border border-border-dark bg-surface-darker py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Filter by debt name..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-dark">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Month</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Debt Name</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Payment</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Principal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Interest</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-darker">
                  {displayedPayments.map((payment, index) => {
                    const isPaidOff = payment.remainingBalance === 0
                    const currentDate = new Date()
                    currentDate.setMonth(currentDate.getMonth() + payment.month - 1)
                    return (
                      <tr key={`${payment.month}-${payment.debtName}-${index}`} className={isPaidOff ? 'bg-teal-500/5' : ''}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                          {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-white">{payment.debtName}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-white">
                          {formatCurrency(payment.payment)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-400">
                          {formatCurrency(payment.principal)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-400">
                          {formatCurrency(payment.interest)}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 text-right text-sm ${isPaidOff ? 'font-bold text-teal-500' : 'text-gray-400'}`}>
                          {formatCurrency(payment.remainingBalance)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredPayments.length > 20 && !showAllMonths && (
              <div className="mt-4 flex items-center justify-center">
                <button
                  onClick={() => setShowAllMonths(true)}
                  className="px-4 py-2 text-sm text-white bg-surface-darker hover:bg-surface-dark rounded-lg transition-colors"
                >
                  Load More ({filteredPayments.length - 20} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
