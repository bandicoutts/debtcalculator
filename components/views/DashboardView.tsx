'use client'

import { useState } from 'react'
import { Debt } from '@/types/debt.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/formatters'
import { DollarSign, Calendar, TrendingDown, Plus } from 'lucide-react'

interface DashboardViewProps {
  debts: Debt[]
  extraPayment: number
  onUpdateExtraPayment: (amount: number) => void
}

export function DashboardView({ debts, extraPayment, onUpdateExtraPayment }: DashboardViewProps) {
  const [extraPaymentInput, setExtraPaymentInput] = useState(extraPayment.toString())
  const [isEditing, setIsEditing] = useState(false)

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
  const totalMinimum = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0)
  const highAPRDebts = debts.filter(debt => debt.apr > 15)

  // Rough estimate of payoff date
  const monthlyPayment = totalMinimum + extraPayment
  const estimatedMonths = monthlyPayment > 0 ? Math.ceil(totalDebt / monthlyPayment) : 0
  const debtFreeDate = new Date()
  debtFreeDate.setMonth(debtFreeDate.getMonth() + estimatedMonths)

  const handleUpdateExtraPayment = () => {
    const amount = parseFloat(extraPaymentInput)
    if (!isNaN(amount) && amount >= 0) {
      onUpdateExtraPayment(amount)
      setIsEditing(false)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-4xl font-light text-white mb-8">Dashboard</h1>

      {debts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Debts Yet</h3>
            <p className="text-gray-400">Go to the Debts page to add your first debt</p>
          </div>
        </Card>
      ) : (
        <>
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
                      onFocus={() => setIsEditing(true)}
                      className="w-full pl-7 rounded-lg bg-surface-darker border border-border-dark px-3 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0.00"
                    />
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateExtraPayment} size="sm">
                        Update
                      </Button>
                      <Button
                        onClick={() => {
                          setExtraPaymentInput(extraPayment.toString())
                          setIsEditing(false)
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                {extraPayment > 0 && (
                  <p className="text-sm text-teal-500 mt-2">
                    Current: {formatCurrency(extraPayment)}/month
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Debt</p>
                  <p className="text-2xl font-semibold text-white">{formatCurrency(totalDebt)}</p>
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
                  <p className="text-2xl font-semibold text-white">
                    {estimatedMonths > 0
                      ? debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'N/A'
                    }
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
                  <p className="text-2xl font-semibold text-white">{formatCurrency(monthlyPayment)}</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* High APR Warning */}
          {highAPRDebts.length > 0 && (
            <Card className="mb-8 border-orange-500/30">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">High-Interest Debts Detected</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    You have {highAPRDebts.length} debt{highAPRDebts.length > 1 ? 's' : ''} with APR above 15%.
                    Consider the Avalanche method to save on interest.
                  </p>
                  <ul className="space-y-1">
                    {highAPRDebts.map(debt => (
                      <li key={debt.id} className="text-sm text-gray-300">
                        {debt.name}: {debt.apr.toFixed(2)}% APR
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Debts Summary Table */}
          <Card>
            <h2 className="text-xl font-medium text-white mb-4">Your Debts</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-dark">
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Debt Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Balance</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">APR</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Min. Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map(debt => (
                    <tr key={debt.id} className="border-b border-border-darker">
                      <td className="py-4 px-4 text-sm text-white font-medium">{debt.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-400">{formatCurrency(debt.balance)}</td>
                      <td className="py-4 px-4 text-sm text-gray-400">{debt.apr.toFixed(2)}%</td>
                      <td className="py-4 px-4 text-sm text-gray-400">{formatCurrency(debt.minimum_payment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
