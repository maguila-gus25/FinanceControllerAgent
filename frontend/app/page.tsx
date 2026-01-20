'use client'

import { useChat } from 'ai/react'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Erro no chat:', error)
    },
  })

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-100">CFO Agent</h1>
          <p className="text-sm text-gray-400">Seu assistente financeiro inteligente</p>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold text-gray-200 mb-2">
                  Bem-vindo ao CFO Agent
                </h2>
                <p className="text-gray-400 mb-4">
                  Faça perguntas sobre suas finanças. Exemplos:
                </p>
                <ul className="text-left text-sm text-gray-400 space-y-2">
                  <li>• "Qual foi o gasto total com cloud?"</li>
                  <li>• "Qual categoria é a mais cara?"</li>
                  <li>• "Dê um resumo do meu cashflow"</li>
                  <li>• "Quanto gastamos com Marketing este mês?"</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-900 text-red-100 border border-red-700 rounded-lg px-4 py-3 max-w-3xl">
                <div className="font-semibold mb-1">Erro:</div>
                <div className="text-sm">{error.message || 'Erro desconhecido ao processar sua mensagem'}</div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 border border-gray-700 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-400">Pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua pergunta sobre finanças..."
              className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
