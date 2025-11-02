'use client'

import { useState } from 'react'
import { Debt } from '@/types/debt.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/formatters'
import { Pencil, Trash2 } from 'lucide-react'

interface ManageDebtsViewProps {
  debts: Debt[]
  onAddDebt: (debt: Omit<Debt, 'id'>) => void
  onUpdateDebt: (id: string, debt: Partial<Debt>) => void
  onDeleteDebt: (id: string) => void
}

export function ManageDebtsView({ debts, onAddDebt, onUpdateDebt, onDeleteDebt }: ManageDebtsViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    minimum_payment: '',
    apr: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Debt name is required'
    }

    const balance = parseFloat(formData.balance)
    if (isNaN(balance) || balance <= 0) {
      newErrors.balance = 'Enter a valid balance'
    }

    const minPayment = parseFloat(formData.minimum_payment)
    if (isNaN(minPayment) || minPayment <= 0) {
      newErrors.minimum_payment = 'Enter a valid minimum payment'
    }

    const apr = parseFloat(formData.apr)
    if (isNaN(apr) || apr < 0 || apr > 100) {
      newErrors.apr = 'APR must be between 0 and 100'
    } else if (apr > 30) {
      // Warning, not error
      setErrors({ apr: 'Warning: This APR seems high.' })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (editingDebt) {
      // Update existing debt
      onUpdateDebt(editingDebt.id, {
        name: formData.name.trim(),
        balance: parseFloat(formData.balance),
        minimum_payment: parseFloat(formData.minimum_payment),
        apr: parseFloat(formData.apr)
      })
      setEditingDebt(null)
    } else {
      // Add new debt
      onAddDebt({
        name: formData.name.trim(),
        balance: parseFloat(formData.balance),
        minimum_payment: parseFloat(formData.minimum_payment),
        apr: parseFloat(formData.apr)
      })
    }

    // Reset form
    setFormData({
      name: '',
      balance: '',
      minimum_payment: '',
      apr: ''
    })
    setErrors({})
  }

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setFormData({
      name: debt.name,
      balance: debt.balance.toString(),
      minimum_payment: debt.minimum_payment.toString(),
      apr: debt.apr.toString()
    })
    setErrors({})
  }

  const handleCancelEdit = () => {
    setEditingDebt(null)
    setFormData({
      name: '',
      balance: '',
      minimum_payment: '',
      apr: ''
    })
    setErrors({})
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      onDeleteDebt(id)
    }
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-4xl font-light text-white mb-8">Manage Your Debts</h1>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-darker/50">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Debt Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Remaining Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">APR</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Min. Payment</th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {debts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No debts yet. Add your first debt using the form.
                    </td>
                  </tr>
                ) : (
                  debts.map(debt => (
                    <tr key={debt.id} className="border-t border-border-darker group">
                      <td className="px-6 py-4 text-sm font-normal text-white">{debt.name}</td>
                      <td className="px-6 py-4 text-sm font-normal text-gray-400">{formatCurrency(debt.balance)}</td>
                      <td className="px-6 py-4 text-sm font-normal text-gray-400">{debt.apr.toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm font-normal text-gray-400">{formatCurrency(debt.minimum_payment)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(debt)}
                            className="text-gray-500 hover:text-teal-500 transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(debt.id, debt.name)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit Debt Sidebar */}
      <div className="w-96 border-l border-border-dark bg-surface-dark/30 p-8">
        <div className="sticky top-10">
          <h2 className="text-xl font-medium text-white mb-6">
            {editingDebt ? 'Edit Debt' : 'Add a New Debt'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Debt Name"
              placeholder="e.g., Visa Credit Card"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Current Balance</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="12,500.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className={`
                    w-full pl-7 rounded-lg bg-surface-darker border px-3 py-2.5 text-gray-200
                    focus:outline-none focus:ring-2 focus:ring-teal-500
                    ${errors.balance ? 'border-red-500' : 'border-border-dark'}
                  `}
                />
              </div>
              {errors.balance && <p className="text-sm text-red-500 mt-1">{errors.balance}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Min. Payment</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="250.00"
                    value={formData.minimum_payment}
                    onChange={(e) => setFormData({ ...formData, minimum_payment: e.target.value })}
                    className={`
                      w-full pl-7 rounded-lg bg-surface-darker border px-3 py-2.5 text-gray-200
                      focus:outline-none focus:ring-2 focus:ring-teal-500
                      ${errors.minimum_payment ? 'border-red-500' : 'border-border-dark'}
                    `}
                  />
                </div>
                {errors.minimum_payment && <p className="text-sm text-red-500 mt-1">{errors.minimum_payment}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">APR</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="21.99"
                    value={formData.apr}
                    onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                    className={`
                      w-full pr-7 rounded-lg bg-surface-darker border px-3 py-2.5 text-gray-200
                      focus:outline-none focus:ring-2 focus:ring-teal-500
                      ${errors.apr && !errors.apr.includes('Warning') ? 'border-red-500' : errors.apr ? 'border-orange-500' : 'border-border-dark'}
                    `}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                </div>
                {errors.apr && (
                  <p className={`text-sm mt-1 ${errors.apr.includes('Warning') ? 'text-orange-500' : 'text-red-500'}`}>
                    {errors.apr}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {editingDebt && (
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex-1" size="lg">
                {editingDebt ? 'Update Debt' : 'Add Debt'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
