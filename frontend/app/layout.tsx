import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CFO Agent - Financial Control',
  description: 'Agente de controle financeiro para CEOs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="dark bg-gray-900 text-gray-100">{children}</body>
    </html>
  )
}
