import { NextRequest } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    
    // Pegar a última mensagem do usuário
    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage?.content || ''
    
    console.log('[API] Recebida mensagem:', userMessage)
    
    if (!userMessage) {
      return new Response('Mensagem vazia', { status: 400 })
    }
    
    // Fazer requisição para o FastAPI
    console.log('[API] Fazendo requisição para:', `${FASTAPI_URL}/chat`)
    
    let response: Response
    try {
      // Criar AbortController para timeout (compatível com versões mais antigas do Node)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos
      
      response = await fetch(`${FASTAPI_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
    } catch (fetchError) {
      console.error('[API] Erro ao fazer fetch:', fetchError)
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout ao conectar com o backend. Verifique se o backend está rodando.')
        }
        if (fetchError.message.includes('ECONNREFUSED') || fetchError.message.includes('fetch failed')) {
          throw new Error(`Não foi possível conectar ao backend em ${FASTAPI_URL}. Verifique se o backend está rodando na porta 8000.`)
        }
        throw new Error(`Erro de conexão: ${fetchError.message}`)
      }
      throw new Error('Erro desconhecido ao conectar com o backend')
    }
    
    console.log('[API] Status da resposta:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro do FastAPI:', errorText)
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`)
    }
    
    // Criar um stream reader
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Não foi possível obter o stream de resposta')
    }
    
    const decoder = new TextDecoder()
    
    // Criar um ReadableStream para repassar ao Vercel AI SDK
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              controller.close()
              break
            }
            
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                
                if (data === '[DONE]') {
                  controller.close()
                  return
                }
                
                try {
                  const parsed = JSON.parse(data)
                  
                  if (parsed.error) {
                    console.error('[API] Erro recebido do backend:', parsed.error)
                    controller.enqueue(new TextEncoder().encode(`Erro: ${parsed.error}`))
                    controller.close()
                    return
                  }
                  
                  if (parsed.content) {
                    controller.enqueue(new TextEncoder().encode(parsed.content))
                  }
                } catch (e) {
                  // Se não for JSON válido, pode ser texto direto
                  if (data && data.trim() && data !== '[DONE]') {
                    console.warn('[API] Dados não-JSON recebidos:', data)
                    controller.enqueue(new TextEncoder().encode(data))
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('[API] Erro no stream:', error)
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido no stream'
          controller.enqueue(new TextEncoder().encode(`Erro: ${errorMsg}`))
          controller.close()
        }
      },
    })
    
    console.log('[API] Stream criado com sucesso')
    // Retornar resposta de streaming diretamente
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('[API] Erro no route.ts:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[API] Detalhes do erro:', errorMessage)
    console.error('[API] Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    // Mensagem mais amigável para o usuário
    let userFriendlyMessage = errorMessage
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed') || errorMessage.includes('conectar')) {
      userFriendlyMessage = `Não foi possível conectar ao backend em ${FASTAPI_URL}. Verifique se o servidor FastAPI está rodando. Execute: cd backend && uvicorn main:app --reload --port 8000`
    } else if (errorMessage.includes('Timeout')) {
      userFriendlyMessage = 'O backend demorou muito para responder. Verifique se está processando corretamente.'
    }
    
    return new Response(
      JSON.stringify({ error: userFriendlyMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
