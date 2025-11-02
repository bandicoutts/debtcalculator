/**
 * Format a number as US currency with 2 decimal places
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Format a number as a percentage with 2 decimal places
 */
export function formatPercent(rate: number): string {
  return `${rate.toFixed(2)}%`
}

/**
 * Format a number with thousand separators and decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}
