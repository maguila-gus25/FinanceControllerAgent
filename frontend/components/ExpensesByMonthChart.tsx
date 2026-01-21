'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MonthlyData {
  mes_ano: string
  total_entradas: number
  total_saidas: number
  saldo: number
  taxa_poupanca: number
  gastos_por_categoria: Record<string, number>
}

interface ExpensesByMonthChartProps {
  data: MonthlyData[]
}

export default function ExpensesByMonthChart({ data }: ExpensesByMonthChartProps) {
  const chartData = data.map(item => ({
    mes: new Date(item.mes_ano + '-01').toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    }),
    'Total Entradas': item.total_entradas,
    'Total Saídas': item.total_saidas,
    'Saldo': item.saldo,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>Nenhum dado disponível</p>
      </div>
    )
  }

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="mes" 
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value: number) => formatValue(value)}
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F3F4F6'
          }}
        />
        <Legend />
        <Bar dataKey="Total Entradas" fill="#10B981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Total Saídas" fill="#EF4444" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Saldo" fill="#3B82F6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
