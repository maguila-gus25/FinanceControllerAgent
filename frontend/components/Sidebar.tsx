'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceData {
  saldo_total: number
  total_receitas: number
  total_despesas: number
}

export default function Sidebar() {
  const [balance, setBalance] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/balance')
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar saldo: ${response.status}`)
        }
        
        const data: BalanceData = await response.json()
        setBalance(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { href: '/', icon: MessageSquare, label: 'Chat' },
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  ]

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-xl font-bold text-slate-100"
            >
              CFO Agent
            </motion.h2>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mb-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
              )} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Summary Section */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <h3 className="text-label text-slate-400 mb-4 uppercase tracking-wider">
              Resumo
            </h3>

            <div className="space-y-3">
              {/* Saldo Total */}
              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <p className="text-label text-slate-400">Saldo Total</p>
                </div>
                {loading ? (
                  <div className="h-6 w-24 bg-slate-700/50 rounded animate-pulse" />
                ) : error ? (
                  <p className="text-sm text-rose-400">{error}</p>
                ) : balance ? (
                  <p className={cn(
                    'text-executive text-xl',
                    balance.saldo_total >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  )}>
                    R$ {balance.saldo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                ) : null}
              </div>

              {/* Receitas e Despesas */}
              {balance && (
                <>
                  <div className="glass-card rounded-lg p-4 border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <p className="text-label text-slate-400">Total Receitas</p>
                    </div>
                    <p className="text-executive text-lg text-emerald-400">
                      R$ {balance.total_receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="glass-card rounded-lg p-4 border-rose-500/20 bg-rose-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      <p className="text-label text-slate-400">Total Despesas</p>
                    </div>
                    <p className="text-executive text-lg text-rose-400">
                      R$ {balance.total_despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-auto pt-6 border-t border-slate-700/50"
          >
            <p className="text-xs text-slate-500">
              Atualizado a cada 30s
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card rounded-lg text-slate-300"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 glass z-50 p-6 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex glass border-r border-slate-700/50 p-6 flex-col transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
