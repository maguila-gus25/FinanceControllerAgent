'use client'

import { useEffect, useState } from 'react'

interface BalanceData {
  saldo_total: number
  total_receitas: number
  total_despesas: number
}

export default function Sidebar() {
  const [balance, setBalance] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true)
        // Usar API route interna ao invés de acessar backend diretamente
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
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-gray-200">Dashboard Financeiro</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Saldo Total</p>
          {loading ? (
            <p className="text-lg font-semibold text-gray-300">Carregando...</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : balance ? (
            <p className={`text-2xl font-bold ${
              balance.saldo_total >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              R$ {balance.saldo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          ) : null}
        </div>

        {balance && (
          <>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Receitas</p>
              <p className="text-lg font-semibold text-green-400">
                R$ {balance.total_receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Despesas</p>
              <p className="text-lg font-semibold text-red-400">
                R$ {balance.total_despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Atualizado automaticamente a cada 30s
        </p>
      </div>
    </div>
  )
}
