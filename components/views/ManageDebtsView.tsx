'use client'

import { useState } from 'react'
import { Debt } from '@/types/debt.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency } from '@/lib/formatters'
import { Pencil, Trash2, CopyPlus, X } from 'lucide-react'

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
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [showMobileForm, setShowMobileForm] = useState(false)

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
    setShowMobileForm(true) // Open form on mobile
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
    setShowMobileForm(false) // Close form on mobile
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteDebt(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleDuplicate = (debt: Debt) => {
    setFormData({
      name: `${debt.name} (Copy)`,
      balance: debt.balance.toString(),
      minimum_payment: debt.minimum_payment.toString(),
      apr: debt.apr.toString()
    })
    setErrors({})
    setShowMobileForm(true) // Open form on mobile
    // Scroll to form on desktop
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-10">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-white">My Debts</h1>
          {/* Mobile Add Button */}
          <button
            onClick={() => {
              setEditingDebt(null)
              setFormData({ name: '', balance: '', minimum_payment: '', apr: '' })
              setShowMobileForm(true)
            }}
            className="lg:hidden px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Add Debt
          </button>
        </div>

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
                    <tr
                      key={debt.id}
                      className={`border-t border-border-darker group ${
                        editingDebt?.id === debt.id ? 'bg-teal-500/5 border-l-4 border-l-teal-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-normal text-white">
                        {debt.name}
                        {editingDebt?.id === debt.id && (
                          <span className="ml-2 text-xs text-teal-500">(Editing)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-normal text-gray-400">{formatCurrency(debt.balance)}</td>
                      <td className="px-6 py-4 text-sm font-normal text-gray-400">{debt.apr.toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm font-normal text-gray-400">{formatCurrency(debt.minimum_payment)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDuplicate(debt)}
                            className="text-gray-500 hover:text-blue-500 transition-colors"
                            aria-label={`Duplicate ${debt.name}`}
                            title="Duplicate"
                          >
                            <CopyPlus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(debt)}
                            className="text-gray-500 hover:text-teal-500 transition-colors"
                            aria-label={`Edit ${debt.name}`}
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(debt.id, debt.name)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            aria-label={`Delete ${debt.name}`}
                            title="Delete"
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

      {/* Add/Edit Debt Sidebar - Desktop */}
      <div className="hidden lg:block w-96 border-l border-border-dark bg-surface-dark/30 p-8">
        <div className="sticky top-10">
          <h2 className="text-xl font-medium text-white mb-2">
            {editingDebt ? 'Edit Debt' : 'Add a New Debt'}
          </h2>
          {editingDebt && (
            <p className="text-sm text-teal-500 mb-4">
              Currently editing: {editingDebt.name}
            </p>
          )}

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

      {/* Mobile Form Modal */}
      {showMobileForm && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-surface-dark w-full max-h-[90vh] overflow-y-auto rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white">
                {editingDebt ? 'Edit Debt' : 'Add a New Debt'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white"
                aria-label="Close form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {editingDebt && (
              <p className="text-sm text-teal-500 mb-4">
                Currently editing: {editingDebt.name}
              </p>
            )}

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
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" size="lg">
                  {editingDebt ? 'Update Debt' : 'Add Debt'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Debt"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
