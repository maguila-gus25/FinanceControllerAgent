'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryPieChartProps {
  data: Record<string, number>
}

// Premium color palette - emerald for income, rose for expenses, cyan/indigo for others
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
  '#14B8A6', // teal
  '#A855F7', // purple
]

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="glass-card rounded-lg p-4 border border-slate-700/50 shadow-xl">
          <p className="text-label text-slate-400 mb-1">{data.name}</p>
          <p className="text-executive text-lg text-slate-100">
            {formatValue(data.value)}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% do total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => 
            percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
          }
          outerRadius={120}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          stroke="rgba(15, 23, 42, 0.5)"
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => {
            const item = chartData.find(d => d.name === value)
            return (
              <span className="text-slate-300 text-sm">
                {value}: {item ? formatValue(item.value) : ''}
              </span>
            )
          }}
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
