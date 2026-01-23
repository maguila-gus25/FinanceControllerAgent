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
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  )
}
