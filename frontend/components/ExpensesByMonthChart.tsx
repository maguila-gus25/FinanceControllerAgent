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
      <div className="flex items-center justify-center h-64 text-slate-400">
        <p>Nenhum dado disponível</p>
      </div>
    )
  }

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-4 border border-slate-700/50 shadow-xl">
          <p className="text-label text-slate-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
              <span className="font-semibold">{entry.name}:</span>{' '}
              <span className="text-slate-100">{formatValue(entry.value)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
        <XAxis 
          dataKey="mes" 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#cbd5e1' }}
        />
        <YAxis 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#cbd5e1' }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
        />
        <Bar 
          dataKey="Total Entradas" 
          fill="#10B981" 
          radius={[8, 8, 0, 0]}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.3))' }}
        />
        <Bar 
          dataKey="Total Saídas" 
          fill="#EC4899" 
          radius={[8, 8, 0, 0]}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(236, 72, 153, 0.3))' }}
        />
        <Bar 
          dataKey="Saldo" 
          fill="#06B6D4" 
          radius={[8, 8, 0, 0]}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(6, 182, 212, 0.3))' }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
