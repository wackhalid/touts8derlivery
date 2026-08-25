import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: ReactNode
}

const variants: Record<string, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/90',
  secondary: 'bg-amber text-ink hover:bg-amber/90',
  ghost: 'bg-transparent text-ink border border-line hover:bg-ink/5',
  danger: 'bg-alert/10 text-alert border border-alert/30 hover:bg-alert/20',
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
