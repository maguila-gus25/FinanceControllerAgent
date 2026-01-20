"""
FastAPI server com LangChain Agent para análise financeira.
O agente atua como um CFO experiente e pode analisar transações usando Pandas.
"""

import os
import pandas as pd
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_experimental.agents import create_pandas_dataframe_agent
import io
import json

# Carregar variáveis de ambiente
load_dotenv()

app = FastAPI(title="CFO Agent API")

# CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class BalanceResponse(BaseModel):
    saldo_total: float
    total_receitas: float
    total_despesas: float


# Carregar dados de transações
CSV_PATH = "transacoes.csv"
df: Optional[pd.DataFrame] = None


def load_transactions() -> pd.DataFrame:
    """Carrega o DataFrame de transações do CSV."""
    global df
    if df is None:
        if not os.path.exists(CSV_PATH):
            raise FileNotFoundError(
                f"Arquivo {CSV_PATH} não encontrado. Execute data_generator.py primeiro."
            )
        df = pd.read_csv(CSV_PATH)
        df["data"] = pd.to_datetime(df["data"])
    return df


def get_balance() -> BalanceResponse:
    """Calcula o saldo total das transações."""
    try:
        transactions_df = load_transactions()
        # Assumindo que Salários são receitas e o resto são despesas
        receitas = transactions_df[transactions_df["categoria"] == "Salários"]["valor"].sum()
        despesas = transactions_df[transactions_df["categoria"] != "Salários"]["valor"].sum()
        saldo_total = receitas - despesas
        
        return BalanceResponse(
            saldo_total=round(saldo_total, 2),
            total_receitas=round(receitas, 2),
            total_despesas=round(despesas, 2),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular saldo: {str(e)}")


@app.get("/")
def root():
    return {"message": "CFO Agent API está rodando"}


@app.get("/balance", response_model=BalanceResponse)
def get_balance_endpoint():
    """Endpoint para obter o saldo total."""
    return get_balance()


@app.post("/chat")
async def chat(request: ChatRequest):
    """Endpoint de chat que retorna streaming de respostas do agente."""
    try:
        # Verificar se a API key do Groq está configurada
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY não configurada. Configure no arquivo .env",
            )
        
        # Carregar transações
        transactions_df = load_transactions()
        
        # Configurar o LLM
        llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            groq_api_key=groq_api_key,
            temperature=0.3,
        )
        
        # System prompt do CFO
        system_prompt = """Você é um CFO experiente focado em eficiência e escalabilidade de startups. 
Sua missão é ajudar CEOs a tomar decisões financeiras baseadas em dados.

Você tem acesso a um DataFrame de transações financeiras com as seguintes colunas:
- data: Data da transação
- categoria: Categoria da transação (Marketing, Cloud, Salários, Café, Software)
- valor: Valor da transação em reais
- descricao: Descrição da transação

Ao analisar os dados:
1. Seja preciso e objetivo
2. Forneça números específicos quando possível
3. Identifique padrões e tendências
4. Sugira otimizações quando relevante
5. Use linguagem clara e profissional

Responda sempre em português brasileiro."""

        # Criar agente com Pandas DataFrame
        # allow_dangerous_code=True é necessário para o agente executar código Python
        # No nosso caso é seguro pois estamos usando dados locais controlados
        agent = create_pandas_dataframe_agent(
            llm=llm,
            df=transactions_df,
            verbose=True,
            agent_type="tool-calling",  # Tipo compatível com modelos que suportam tool calling
            allow_dangerous_code=True,  # Necessário para executar código Python no DataFrame
            prefix=system_prompt,  # Usar prefix ao invés de system_message
        )
        
        # Criar função de streaming
        async def generate_response():
            try:
                print(f"[DEBUG] Processando mensagem: {request.message}")
                
                # Executar o agente
                result = await agent.ainvoke({"input": request.message})
                
                print(f"[DEBUG] Resultado do agente: {result}")
                
                # Retornar a resposta em chunks para simular streaming
                response_text = result.get("output", "Desculpe, não consegui processar sua solicitação.")
                
                if not response_text or len(response_text.strip()) == 0:
                    response_text = "Desculpe, não recebi uma resposta válida do agente."
                
                print(f"[DEBUG] Resposta final: {response_text[:100]}...")
                
                # Dividir em chunks menores para streaming
                chunk_size = 20
                for i in range(0, len(response_text), chunk_size):
                    chunk = response_text[i : i + chunk_size]
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                
                yield "data: [DONE]\n\n"
            except Exception as e:
                import traceback
                error_msg = f"Erro ao processar: {str(e)}"
                print(f"[ERROR] {error_msg}")
                print(f"[ERROR] Traceback: {traceback.format_exc()}")
                yield f"data: {json.dumps({'error': error_msg})}\n\n"
                yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
