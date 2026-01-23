'use client'

import { useEffect, useState } from 'react'
import { useChat } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import KPICard from '@/components/KPICard'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceData {
  saldo_total: number
  total_receitas: number
  total_despesas: number
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Erro no chat:', error)
    },
  })

  const [balance, setBalance] = useState<BalanceData | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true)
        const response = await fetch('/api/balance')
        if (response.ok) {
          const data = await response.json()
          setBalance(data)
        }
      } catch (err) {
        console.error('Erro ao buscar saldo:', err)
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="glass border-b border-slate-700/50 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-executive text-2xl text-slate-100">CFO Agent</h1>
              <p className="text-label text-slate-400">Seu assistente financeiro inteligente</p>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="Saldo Atual"
              value={balance?.saldo_total ?? 0}
              icon={Wallet}
              variant="balance"
              loading={balanceLoading}
              delay={0}
            />
            <KPICard
              title="Total Entradas"
              value={balance?.total_receitas ?? 0}
              icon={TrendingUp}
              variant="income"
              loading={balanceLoading}
              delay={0.1}
            />
            <KPICard
              title="Total Saídas"
              value={balance?.total_despesas ?? 0}
              icon={TrendingDown}
              variant="expense"
              loading={balanceLoading}
              delay={0.2}
            />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center max-w-md">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6"
                  >
                    <Bot className="w-12 h-12 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-executive text-2xl text-slate-100 mb-3">
                    Bem-vindo ao CFO Agent
                  </h2>
                  <p className="text-label text-slate-400 mb-6">
                    Faça perguntas sobre suas finanças. Exemplos:
                  </p>
                  <ul className="text-left space-y-3">
                    {[
                      'Qual foi o gasto total com cloud?',
                      'Qual categoria é a mais cara?',
                      'Dê um resumo do meu cashflow',
                      'Quanto gastamos com Marketing este mês?',
                    ].map((example, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="text-sm text-slate-400 flex items-center gap-2"
                      >
                        <span className="text-cyan-400">•</span>
                        <span>"{example}"</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-3xl rounded-xl px-5 py-4 shadow-lg',
                    message.role === 'user'
                      ? 'bg-cyan-500 text-white'
                      : 'glass-light text-slate-100'
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <div className="glass-card border-rose-500/30 bg-rose-500/10 rounded-xl px-5 py-4 max-w-3xl">
                  <div className="font-semibold mb-1 text-rose-400">Erro:</div>
                  <div className="text-sm text-rose-300">
                    {error.message || 'Erro desconhecido ao processar sua mensagem'}
                  </div>
                </div>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="glass-light rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                          animate={{
                            y: [0, -8, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-400">Processando...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Form */}
        <div className="glass border-t border-slate-700/50 px-4 sm:px-6 py-4 sm:py-5">
          <form onSubmit={handleSubmit} className="flex gap-3 sm:gap-4">
              <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Digite sua pergunta sobre finanças..."
                className="w-full glass-light rounded-xl px-4 sm:px-5 py-3 sm:py-4 pr-12 text-slate-100 placeholder:text-slate-500 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all flex items-center gap-2',
                'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/25',
                'disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none',
                'min-w-[60px] sm:min-w-auto'
              )}
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Enviar</span>
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  )
}
