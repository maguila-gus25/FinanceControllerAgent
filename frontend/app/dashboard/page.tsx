'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart'
import CategoryPieChart from '@/components/CategoryPieChart'
import ExpensesByMonthChart from '@/components/ExpensesByMonthChart'
import ExpensesTable from '@/components/ExpensesTable'

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
        
        // Selecionar o último mês por padrão
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

  // Preparar dados agregados para gráficos
  const allCategoriesData = monthlyData.reduce((acc, month) => {
    Object.entries(month.gastos_por_categoria).forEach(([category, value]) => {
      acc[category] = (acc[category] || 0) + value
    })
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-100">Dashboard Financeiro</h1>
          <p className="text-sm text-gray-400">Visualização detalhada dos seus gastos por mês</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Carregando dados...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900 text-red-100 border border-red-700 rounded-lg px-4 py-3">
              <div className="font-semibold mb-1">Erro:</div>
              <div className="text-sm">{error}</div>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>Nenhum dado disponível</p>
            </div>
          ) : (
            <>
              {/* Seletor de Mês */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selecionar Mês:
                </label>
                <select
                  value={selectedMonth || ''}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-gray-700 text-gray-100 rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              {/* Cards de Resumo */}
              {selectedMonthData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Total Entradas</p>
                    <p className="text-2xl font-bold text-green-400">
                      R$ {selectedMonthData.total_entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Total Saídas</p>
                    <p className="text-2xl font-bold text-red-400">
                      R$ {selectedMonthData.total_saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Saldo do Mês</p>
                    <p className={`text-2xl font-bold ${
                      selectedMonthData.saldo >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      R$ {selectedMonthData.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Taxa de Poupança</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {selectedMonthData.taxa_poupanca.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico de Pizza - Categorias do Mês Selecionado */}
                {selectedMonthData && (
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">
                      Gastos por Categoria - {new Date(selectedMonthData.mes_ano + '-01').toLocaleDateString('pt-BR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h2>
                    <CategoryPieChart data={selectedMonthData.gastos_por_categoria} />
                  </div>
                )}

                {/* Gráfico de Barras - Gastos por Mês */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    Evolução de Gastos por Mês
                  </h2>
                  <ExpensesByMonthChart data={monthlyData} />
                </div>
              </div>

              {/* Gráfico de Barras - Comparação de Categorias ao Longo do Tempo */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                  Gastos por Categoria ao Longo do Tempo
                </h2>
                <MonthlyExpensesChart data={monthlyData} />
              </div>

              {/* Tabela de Gastos Detalhados */}
              {selectedMonthData && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
