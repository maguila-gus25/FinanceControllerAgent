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

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
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
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>Nenhum dado disponível</p>
      </div>
    )
  }

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
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
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
        />
        {topCategories.map((category, index) => (
          <Bar 
            key={category}
            dataKey={category} 
            fill={COLORS[index % COLORS.length]}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
