'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingUp, TrendingDown, Wallet, Percent, BarChart3 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart'
import CategoryPieChart from '@/components/CategoryPieChart'
import ExpensesByMonthChart from '@/components/ExpensesByMonthChart'
import ExpensesTable from '@/components/ExpensesTable'
import KPICard from '@/components/KPICard'
import { cn } from '@/lib/utils'

interface MonthlySummary {
  mes_ano: string
  total_entradas: number
  total_saidas: number
  saldo: number
  taxa_poupanca: number
  gastos_por_categoria: Record<string, number>
}

export default function DashboardPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/monthly-summary')
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status}`)
        }
        
        const data = await response.json()
        setMonthlyData(data.resumos || [])
        
        if (data.resumos && data.resumos.length > 0) {
          setSelectedMonth(data.resumos[data.resumos.length - 1].mes_ano)
        }
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const selectedMonthData = monthlyData.find(m => m.mes_ano === selectedMonth)

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="glass border-b border-slate-700/50 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-executive text-2xl text-slate-100">Dashboard Financeiro</h1>
              <p className="text-label text-slate-400">Visualização detalhada dos seus gastos por mês</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent mb-4"
                />
                <p className="text-slate-400">Carregando dados...</p>
              </motion.div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card border-rose-500/30 bg-rose-500/10 rounded-xl px-5 py-4"
            >
              <div className="font-semibold mb-1 text-rose-400">Erro:</div>
              <div className="text-sm text-rose-300">{error}</div>
            </motion.div>
          ) : monthlyData.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p>Nenhum dado disponível</p>
            </div>
          ) : (
            <>
              {/* Seletor de Mês */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <label className="block text-label text-slate-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Selecionar Mês:
                </label>
                <select
                  value={selectedMonth || ''}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="glass-light rounded-xl px-5 py-3 text-slate-100 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all w-full md:w-auto"
                >
                  {monthlyData.map((month) => (
                    <option key={month.mes_ano} value={month.mes_ano}>
                      {new Date(month.mes_ano + '-01').toLocaleDateString('pt-BR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Cards de Resumo */}
              <AnimatePresence mode="wait">
                {selectedMonthData && (
                  <motion.div
                    key={selectedMonth}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                  >
                    <KPICard
                      title="Total Entradas"
                      value={selectedMonthData.total_entradas}
                      icon={TrendingUp}
                      variant="income"
                      delay={0}
                    />
                    <KPICard
                      title="Total Saídas"
                      value={selectedMonthData.total_saidas}
                      icon={TrendingDown}
                      variant="expense"
                      delay={0.1}
                    />
                    <KPICard
                      title="Saldo do Mês"
                      value={selectedMonthData.saldo}
                      icon={Wallet}
                      variant={selectedMonthData.saldo >= 0 ? 'income' : 'expense'}
                      delay={0.2}
                    />
                    <KPICard
                      title="Taxa de Poupança"
                      value={`${selectedMonthData.taxa_poupanca.toFixed(1)}%`}
                      icon={Percent}
                      variant="balance"
                      delay={0.3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico de Pizza - Categorias do Mês Selecionado */}
                <AnimatePresence mode="wait">
                  {selectedMonthData && (
                    <motion.div
                      key={`pie-${selectedMonth}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="glass-card rounded-xl p-6"
                    >
                      <h2 className="text-executive text-xl text-slate-100 mb-6">
                        Gastos por Categoria - {new Date(selectedMonthData.mes_ano + '-01').toLocaleDateString('pt-BR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </h2>
                      <CategoryPieChart data={selectedMonthData.gastos_por_categoria} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gráfico de Barras - Gastos por Mês */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-xl p-6"
                >
                  <h2 className="text-executive text-xl text-slate-100 mb-6">
                    Evolução de Gastos por Mês
                  </h2>
                  <ExpensesByMonthChart data={monthlyData} />
                </motion.div>
              </div>

              {/* Gráfico de Barras - Comparação de Categorias ao Longo do Tempo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-xl p-6 mb-6"
              >
                <h2 className="text-executive text-xl text-slate-100 mb-6">
                  Gastos por Categoria ao Longo do Tempo
                </h2>
                <MonthlyExpensesChart data={monthlyData} />
              </motion.div>

              {/* Tabela de Gastos Detalhados */}
              <AnimatePresence mode="wait">
                {selectedMonthData && (
                  <motion.div
                    key={`table-${selectedMonth}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card rounded-xl p-6"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-executive text-xl text-slate-100">
                        Detalhamento de Gastos - {new Date(selectedMonthData.mes_ano + '-01').toLocaleDateString('pt-BR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </h2>
                    </div>
                    <ExpensesTable 
                      data={selectedMonthData.gastos_por_categoria}
                      month={selectedMonthData.mes_ano}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
