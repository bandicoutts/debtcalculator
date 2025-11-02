import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface-dark rounded-xl border border-border-dark p-6 ${className}`}>
      {children}
    </div>
  )
}
