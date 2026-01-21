'use client'

import { useMemo } from 'react'
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
      <div className="text-center text-gray-400 py-8">
        <p>Nenhum gasto registrado neste mês</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar para Excel (.xls)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-gray-300 font-semibold">Categoria</th>
              <th className="px-4 py-3 text-gray-300 font-semibold text-right">Valor (R$)</th>
              <th className="px-4 py-3 text-gray-300 font-semibold text-right">Percentual (%)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr
                key={item.categoria}
                className={`border-b border-gray-700 hover:bg-gray-700/50 ${
                  index % 2 === 0 ? 'bg-gray-800/50' : ''
                }`}
              >
                <td className="px-4 py-3 text-gray-200">{item.categoria}</td>
                <td className="px-4 py-3 text-gray-200 text-right font-medium">
                  R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-gray-400 text-right">
                  {item.percentual.toFixed(2)}%
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-600 bg-gray-700/30 font-bold">
              <td className="px-4 py-3 text-gray-200">TOTAL</td>
              <td className="px-4 py-3 text-gray-200 text-right">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-gray-200 text-right">100.00%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
