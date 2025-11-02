import { Debt, MonthlyPayment, PayoffStrategy, CalculationResult } from '@/types/debt.types'

function validateDebt(debt: Debt): void {
  if (!debt.id || typeof debt.id !== 'string') {
    throw new Error('Invalid debt ID')
  }
  if (!debt.name || debt.name.trim().length === 0) {
    throw new Error('Debt name is required')
  }
  if (!Number.isFinite(debt.balance) || debt.balance < 0) {
    throw new Error(`Invalid balance for ${debt.name}`)
  }
  if (!Number.isFinite(debt.minimum_payment) || debt.minimum_payment < 0) {
    throw new Error(`Invalid minimum payment for ${debt.name}`)
  }
  if (!Number.isFinite(debt.apr) || debt.apr < 0 || debt.apr > 100) {
    throw new Error(`Invalid APR for ${debt.name}`)
  }
}

function calculateMonthlyInterest(balance: number, apr: number): number {
  const monthlyRate = apr / 100 / 12
  return balance * monthlyRate
}

export function calculateSnowball(debts: Debt[], extraPayment: number): PayoffStrategy {
  if (!Array.isArray(debts) || debts.length === 0) {
    return {
      method: 'snowball',
      monthlyPayments: [],
      totalInterestPaid: 0,
      monthsToPayoff: 0,
      debtPayments: [],
    }
  }

  debts.forEach(validateDebt)
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance)
  return calculatePayoffStrategy(sortedDebts, extraPayment, 'snowball')
}

export function calculateAvalanche(debts: Debt[], extraPayment: number): PayoffStrategy {
  if (!Array.isArray(debts) || debts.length === 0) {
    return {
      method: 'avalanche',
      monthlyPayments: [],
      totalInterestPaid: 0,
      monthsToPayoff: 0,
      debtPayments: [],
    }
  }

  debts.forEach(validateDebt)
  const sortedDebts = [...debts].sort((a, b) => b.apr - a.apr)
  return calculatePayoffStrategy(sortedDebts, extraPayment, 'avalanche')
}

function calculatePayoffStrategy(
  sortedDebts: Debt[],
  extraPayment: number,
  method: 'snowball' | 'avalanche'
): PayoffStrategy {
  const monthlyPayments: MonthlyPayment[] = []
  let totalInterestPaid = 0
  let month = 0
  const maxMonths = 600

  const workingDebts = sortedDebts.map(debt => ({
    ...debt,
    currentBalance: debt.balance,
    isPaidOff: false,
  }))

  while (workingDebts.some(debt => !debt.isPaidOff) && month < maxMonths) {
    month++
    let remainingExtraPayment = extraPayment

    for (const debt of workingDebts) {
      if (debt.isPaidOff) continue

      const monthlyInterest = calculateMonthlyInterest(debt.currentBalance, debt.apr)
      const minimumPayment = Math.min(debt.minimum_payment, debt.currentBalance + monthlyInterest)
      const principalFromMinimum = minimumPayment - monthlyInterest

      debt.currentBalance -= principalFromMinimum
      totalInterestPaid += monthlyInterest

      monthlyPayments.push({
        month,
        debtName: debt.name,
        payment: minimumPayment,
        principal: principalFromMinimum,
        interest: monthlyInterest,
        remainingBalance: Math.max(0, debt.currentBalance),
      })

      if (debt.currentBalance <= 0) {
        debt.isPaidOff = true
        remainingExtraPayment += debt.minimum_payment
      }
    }

    if (remainingExtraPayment > 0) {
      const targetDebt = workingDebts.find(debt => !debt.isPaidOff)

      if (targetDebt) {
        const extraPaymentAmount = Math.min(remainingExtraPayment, targetDebt.currentBalance)
        targetDebt.currentBalance -= extraPaymentAmount

        const existingPayment = monthlyPayments.find(
          p => p.month === month && p.debtName === targetDebt.name
        )

        if (existingPayment) {
          existingPayment.payment += extraPaymentAmount
          existingPayment.principal += extraPaymentAmount
          existingPayment.remainingBalance = Math.max(0, targetDebt.currentBalance)
        }

        if (targetDebt.currentBalance <= 0) {
          targetDebt.isPaidOff = true
        }
      }
    }
  }

  const debtPayments = sortedDebts.map(debt => {
    const isFirst = debt.id === sortedDebts[0].id
    return {
      debtId: debt.id,
      debtName: debt.name,
      monthlyPayment: debt.minimum_payment + (isFirst ? extraPayment : 0),
    }
  })

  return {
    method,
    monthlyPayments,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    monthsToPayoff: month,
    debtPayments,
  }
}

export function calculatePayoffComparison(
  debts: Debt[],
  extraPayment: number
): CalculationResult {
  return {
    snowball: calculateSnowball(debts, extraPayment),
    avalanche: calculateAvalanche(debts, extraPayment),
    debts,
    extraPayment,
  }
}
