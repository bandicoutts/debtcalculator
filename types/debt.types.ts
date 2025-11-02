export interface Debt {
  id: string
  user_id?: string
  name: string
  balance: number
  minimum_payment: number
  apr: number
  created_at?: string
  updated_at?: string
}

export interface MonthlyPayment {
  month: number
  debtName: string
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

export interface PayoffStrategy {
  method: 'snowball' | 'avalanche'
  monthlyPayments: MonthlyPayment[]
  totalInterestPaid: number
  monthsToPayoff: number
  debtPayments: {
    debtId: string
    debtName: string
    monthlyPayment: number
  }[]
}

export interface CalculationResult {
  snowball: PayoffStrategy
  avalanche: PayoffStrategy
  debts: Debt[]
  extraPayment: number
}

export interface UserSettings {
  id?: string
  user_id: string
  extra_payment: number
  created_at?: string
  updated_at?: string
}
