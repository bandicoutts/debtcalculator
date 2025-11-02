'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MonthlyPayment } from '@/types/debt.types'
import { formatCurrency } from '@/lib/formatters'

interface DebtPayoffTimelineChartProps {
  monthlyPayments: MonthlyPayment[]
}

const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#0f766e']

export function DebtPayoffTimelineChart({ monthlyPayments }: DebtPayoffTimelineChartProps) {
  const { data, debtNames } = useMemo(() => {
    // Get unique debt names
    const uniqueDebts = Array.from(new Set(monthlyPayments.map(p => p.debtName)))

    // Group payments by month
    const monthlyData: Record<number, any> = {}

    monthlyPayments.forEach((payment) => {
      if (!monthlyData[payment.month]) {
        monthlyData[payment.month] = { month: payment.month }
      }
      monthlyData[payment.month][payment.debtName] = payment.remainingBalance
    })

    // Fill in missing values with 0 for debts that are paid off
    const sortedMonths = Object.keys(monthlyData).map(Number).sort((a, b) => a - b)
    sortedMonths.forEach(month => {
      uniqueDebts.forEach(debtName => {
        if (!(debtName in monthlyData[month])) {
          monthlyData[month][debtName] = 0
        }
      })
    })

    return {
      data: Object.values(monthlyData),
      debtNames: uniqueDebts
    }
  }, [monthlyPayments])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          {debtNames.map((name, index) => (
            <linearGradient key={name} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
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
          label={{ value: 'Debt Balance', angle: -90, position: 'insideLeft', fill: '#999' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => [formatCurrency(value), '']}
          labelFormatter={(label) => `Month ${label}`}
        />
        {debtNames.map((name, index) => (
          <Area
            key={name}
            type="monotone"
            dataKey={name}
            stackId="1"
            stroke={COLORS[index % COLORS.length]}
            fill={`url(#color${index})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
