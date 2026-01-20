import { NextRequest } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${FASTAPI_URL}/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('[API] Erro ao buscar balance:', error)
    return Response.json(
      { error: 'Erro ao buscar saldo do backend' },
      { status: 500 }
    )
  }
}
