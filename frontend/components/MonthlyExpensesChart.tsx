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

interface MonthlyExpensesChartProps {
  data: MonthlyData[]
}

// Premium color palette
const COLORS = [
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#EC4899', // rose
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#EF4444', // red
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
]

export default function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  // Coletar todas as categorias únicas
  const allCategories = new Set<string>()
  data.forEach(month => {
    Object.keys(month.gastos_por_categoria).forEach(cat => allCategories.add(cat))
  })

  // Preparar dados para o gráfico
  const chartData = data.map(month => {
    const entry: Record<string, any> = {
      mes: new Date(month.mes_ano + '-01').toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      }),
    }
    
    allCategories.forEach(category => {
      entry[category] = month.gastos_por_categoria[category] || 0
    })
    
    return entry
  })

  // Ordenar categorias por total (maior para menor)
  const categoryTotals = Array.from(allCategories).map(category => ({
    name: category,
    total: data.reduce((sum, month) => sum + (month.gastos_por_categoria[category] || 0), 0)
  })).sort((a, b) => b.total - a.total)

  // Limitar a top 10 categorias para não sobrecarregar o gráfico
  const topCategories = categoryTotals.slice(0, 10).map(c => c.name)

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
          <p className="text-label text-slate-400 mb-2 font-semibold">{label}</p>
          {payload
            .filter((entry: any) => entry.value > 0)
            .map((entry: any, index: number) => (
              <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span>{' '}
                <span className="text-slate-100">{formatValue(entry.value)}</span>
              </p>
            ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
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
          iconType="square"
        />
        {topCategories.map((category, index) => (
          <Bar 
            key={category}
            dataKey={category} 
            fill={COLORS[index % COLORS.length]}
            radius={[8, 8, 0, 0]}
            style={{ filter: `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))` }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
