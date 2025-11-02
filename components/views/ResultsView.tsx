'use client'

import { useState, useMemo } from 'react'
import { Debt } from '@/types/debt.types'
import { Card } from '@/components/ui/Card'
import { calculatePayoffComparison } from '@/lib/calculations'
import { formatCurrency } from '@/lib/formatters'
import { Info, TrendingDown, CreditCard, Activity, Car, GraduationCap, DollarSign, PartyPopper, Search, Filter } from 'lucide-react'
import { DebtBalanceChart } from '@/components/charts/DebtBalanceChart'
import { DebtPayoffTimelineChart } from '@/components/charts/DebtPayoffTimelineChart'

interface ResultsViewProps {
  debts: Debt[]
  extraPayment: number
}

export function ResultsView({ debts, extraPayment }: ResultsViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<'snowball' | 'avalanche'>('snowball')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllMonths, setShowAllMonths] = useState(false)

  const results = useMemo(() => {
    if (debts.length === 0) return null
    return calculatePayoffComparison(debts, extraPayment)
  }, [debts, extraPayment])

  if (debts.length === 0) {
    return (
      <div className="p-10">
        <h1 className="text-4xl font-light text-white mb-8">Compare Your Payoff Strategies</h1>
        <Card>
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Debts to Analyze</h3>
            <p className="text-gray-400">Add your debts to see your payoff strategies</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!results) return null

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
      <h1 className="text-4xl font-light text-white mb-8">Compare Your Payoff Strategies</h1>

      {/* Method Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg bg-surface-darker p-1">
          <button
            onClick={() => setSelectedMethod('snowball')}
            className={`
              px-8 py-2 rounded-md text-sm font-medium transition-colors
              ${selectedMethod === 'snowball'
                ? 'bg-surface-dark text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
          >
            Snowball
          </button>
          <button
            onClick={() => setSelectedMethod('avalanche')}
            className={`
              px-8 py-2 rounded-md text-sm font-medium transition-colors
              ${selectedMethod === 'avalanche'
                ? 'bg-surface-dark text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
          >
            Avalanche
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Snowball</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              Focuses on paying off the smallest debts first for quick wins.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Avalanche</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              Focuses on paying off the highest-interest debts first to save money.
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
              {formatCurrency(debts.reduce((sum, d) => sum + d.balance, 0) + snowball.totalInterestPaid)}
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-dark py-4">
            <p className="text-sm text-gray-400">Total Paid</p>
            <p className="text-base font-medium text-white">
              {formatCurrency(debts.reduce((sum, d) => sum + d.balance, 0) + avalanche.totalInterestPaid)}
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
          <h3 className="text-base font-bold text-white">Debt Payoff Flow</h3>
          <p className="text-sm text-gray-400">The order your debts will be paid off.</p>
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

      {/* Month-by-Month Breakdown */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Month-by-Month Breakdown</h3>
            <p className="text-sm text-gray-400">A detailed view of your payment schedule.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto">
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
                return (
                  <tr key={`${payment.month}-${payment.debtName}-${index}`} className={isPaidOff ? 'bg-teal-500/5' : ''}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                      {new Date(2024, payment.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
              Load More
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
