'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MonthlyPayment } from '@/types/debt.types'
import { formatCurrency } from '@/lib/formatters'

interface DebtBalanceChartProps {
  monthlyPayments: MonthlyPayment[]
}

export function DebtBalanceChart({ monthlyPayments }: DebtBalanceChartProps) {
  const data = useMemo(() => {
    const monthlyTotals: Record<number, number> = {}

    monthlyPayments.forEach((payment) => {
      if (!monthlyTotals[payment.month]) {
        monthlyTotals[payment.month] = 0
      }
      monthlyTotals[payment.month] += payment.remainingBalance
    })

    return Object.entries(monthlyTotals).map(([month, total]) => ({
      month: parseInt(month),
      total: Math.round(total * 100) / 100,
    }))
  }, [monthlyPayments])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="month"
          stroke="#999"
          tick={{ fill: '#999' }}
          label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#999' }}
        />
        <YAxis
          stroke="#999"
          tick={{ fill: '#999' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          label={{ value: 'Total Debt', angle: -90, position: 'insideLeft', fill: '#999' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => [formatCurrency(value), 'Total Debt']}
          labelFormatter={(label) => `Month ${label}`}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#14b8a6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
