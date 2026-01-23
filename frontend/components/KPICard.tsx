'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  variant?: 'default' | 'income' | 'expense' | 'balance'
  loading?: boolean
  delay?: number
  className?: string
}

const variantStyles = {
  default: 'text-slate-300 border-slate-700/50',
  income: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  expense: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
  balance: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  loading = false,
  delay = 0,
  className,
}: KPICardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'glass-card rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-label text-slate-400 mb-2 uppercase tracking-wider">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-32 bg-slate-700/50 rounded animate-pulse" />
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              className="text-executive text-3xl font-bold"
            >
              {formatValue(value)}
            </motion.p>
          )}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'p-3 rounded-lg',
            variant === 'income' && 'bg-emerald-500/20',
            variant === 'expense' && 'bg-rose-500/20',
            variant === 'balance' && 'bg-cyan-500/20',
            variant === 'default' && 'bg-slate-700/50'
          )}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  )
}
