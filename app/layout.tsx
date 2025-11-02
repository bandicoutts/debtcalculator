import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Snowball - Debt Payoff Calculator',
  description: 'Calculate and visualize your debt payoff strategy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
