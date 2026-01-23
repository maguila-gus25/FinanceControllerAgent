'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExpensesTableProps {
  data: Record<string, number>
  month: string
}

export default function ExpensesTable({ data, month }: ExpensesTableProps) {
  const tableData = useMemo(() => {
    return Object.entries(data)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: 0, // Será calculado abaixo
      }))
      .sort((a, b) => b.valor - a.valor)
      .map((item, _, array) => {
        const total = array.reduce((sum, i) => sum + i.valor, 0)
        return {
          ...item,
          percentual: total > 0 ? (item.valor / total) * 100 : 0,
        }
      })
  }, [data])

  const total = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.valor, 0)
  }, [tableData])

  const exportToExcel = () => {
    // Preparar dados para exportação
    const exportData = [
      ['Categoria', 'Valor (R$)', 'Percentual (%)'],
      ...tableData.map(item => [
        item.categoria,
        item.valor,
        item.percentual.toFixed(2),
      ]),
      ['TOTAL', total, '100.00'],
    ]

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(exportData)

    // Ajustar largura das colunas
    ws['!cols'] = [
      { wch: 30 }, // Categoria
      { wch: 15 }, // Valor
      { wch: 15 }, // Percentual
    ]

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Gastos por Categoria')

    // Formatar o mês para o nome do arquivo
    const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
    const fileName = `Gastos_${monthName.replace(/\s+/g, '_')}.xls`

    // Salvar arquivo
    XLSX.writeFile(wb, fileName)
  }

  if (tableData.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        <p>Nenhum gasto registrado neste mês</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <motion.button
          onClick={exportToExcel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-card border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-5 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar para Excel (.xls)
        </motion.button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700/50">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50">
              <th className="px-5 py-4 text-label text-slate-300 font-semibold">Categoria</th>
              <th className="px-5 py-4 text-label text-slate-300 font-semibold text-right">Valor (R$)</th>
              <th className="px-5 py-4 text-label text-slate-300 font-semibold text-right">Percentual (%)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <motion.tr
                key={item.categoria}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-900/30' : ''
                }`}
              >
                <td className="px-5 py-4 text-slate-200">{item.categoria}</td>
                <td className="px-5 py-4 text-executive text-slate-100 text-right">
                  R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-4 text-slate-400 text-right">
                  {item.percentual.toFixed(2)}%
                </td>
              </motion.tr>
            ))}
            <tr className="border-t-2 border-slate-600 bg-slate-800/70 font-bold">
              <td className="px-5 py-4 text-executive text-slate-100">TOTAL</td>
              <td className="px-5 py-4 text-executive text-cyan-400 text-right">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-4 text-executive text-slate-100 text-right">100.00%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
