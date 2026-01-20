"""
FastAPI server com LangChain Agent para análise financeira pessoal.
O agente atua como um CFO pessoal para ajudar no controle financeiro.

Arquitetura DDD:
- Domain: Entidades e regras de categorização
- Infrastructure: Leitura do CSV C6 Bank  
- Application: Serviços de análise financeira
- API: Endpoints FastAPI (este arquivo)
"""

import os
import sys
from pathlib import Path

# Adiciona o diretório backend ao path para imports
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_experimental.agents import create_pandas_dataframe_agent
import json

from infrastructure.csv_reader import C6BankCSVReader
from application.financial_service import FinancialAnalysisService

# Carregar variáveis de ambiente
load_dotenv()

app = FastAPI(title="CFO Agent API - Finanças Pessoais")

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
    taxa_poupanca: float
    num_transacoes: int


# Caminho do CSV do C6 Bank
CSV_PATH = "transacoesC6.csv"

# Cache para o serviço financeiro
_financial_service: Optional[FinancialAnalysisService] = None
_df_cache: Optional[pd.DataFrame] = None


def get_financial_service() -> FinancialAnalysisService:
    """Retorna instância do serviço financeiro (singleton)."""
    global _financial_service
    if _financial_service is None:
        if not os.path.exists(CSV_PATH):
            raise FileNotFoundError(
                f"Arquivo {CSV_PATH} não encontrado. "
                "Faça upload do seu extrato C6 Bank."
            )
        _financial_service = FinancialAnalysisService(CSV_PATH)
    return _financial_service


def get_dataframe() -> pd.DataFrame:
    """Retorna DataFrame para análise (com cache)."""
    global _df_cache
    if _df_cache is None:
        service = get_financial_service()
        _df_cache = service.df
    return _df_cache


# System Prompt do CFO Pessoal - será formatado dinamicamente com info do DataFrame
SYSTEM_PROMPT_TEMPLATE = """Você é um CFO pessoal experiente, focado em ajudar o usuário a aumentar seu patrimônio e alcançar independência financeira.

## SUA MISSÃO
Ajudar o usuário a tomar decisões financeiras inteligentes baseadas nos dados reais do extrato bancário dele.

## DADOS DISPONÍVEIS - EXTRATO C6 BANK
O DataFrame `df` já está carregado e contém {num_transacoes} transações reais do período de {data_inicio} a {data_fim}.

**IMPORTANTE: O DataFrame `df` já existe! NÃO crie um novo DataFrame. Use diretamente o `df` existente.**

Resumo dos dados:
- Total de Entradas: R$ {total_entradas:,.2f}
- Total de Saídas: R$ {total_saidas:,.2f}
- Saldo do Período: R$ {saldo:,.2f}

Colunas disponíveis no `df`:
- Data: Data da transação (datetime)
- Titulo: Título/descrição principal da transação
- Descricao: Descrição detalhada
- Entrada: Valor recebido (crédito) em R$
- Saida: Valor gasto (débito) em R$
- Saldo: Saldo do dia
- Categoria: Categoria automática (Alimentação, Restaurantes/Bares, Transferência Pessoal, Pix Recebido, etc.)
- Tipo: 'entrada' ou 'saida'
- Mes_Ano: Mês/ano no formato YYYY-MM
- Mes: Número do mês
- Ano: Ano

## COMO USAR O DATAFRAME
Sempre use o `df` existente. Exemplos:
- Total de gastos: `df['Saida'].sum()`
- Gastos por categoria: `df.groupby('Categoria')['Saida'].sum()`
- Filtrar por mês: `df[df['Mes_Ano'] == '2025-01']`

## CATEGORIAS DE TRANSAÇÃO
- **Entradas**: Pix Recebido, Salário/Renda, Estorno/Devolução
- **Gastos Essenciais**: Alimentação, Supermercado, Transporte, Saúde/Farmácia, Moradia, Tarifas Bancárias
- **Estilo de Vida**: Lazer/Entretenimento, Restaurantes/Bares, Compras, Serviços, Assinaturas/Apps
- **Transferências**: Transferência Pessoal (para amigos/família), Pix Enviado (para empresas)
- **Outros**: Saque, Outros

## TOM E ESTILO
- Seja direto e profissional, como um CFO real
- Use números específicos sempre que possível
- Formate valores como R$ X.XXX,XX
- Responda sempre em português brasileiro

Você é um parceiro financeiro do usuário. Ajude-o a construir riqueza!"""


@app.get("/")
def root():
    return {"message": "CFO Agent API - Finanças Pessoais está rodando"}


@app.get("/balance", response_model=BalanceResponse)
def get_balance_endpoint():
    """Endpoint para obter o resumo financeiro."""
    try:
        service = get_financial_service()
        resumo = service.obter_resumo_geral()
        
        return BalanceResponse(
            saldo_total=resumo.saldo_periodo,
            total_receitas=resumo.total_entradas,
            total_despesas=resumo.total_saidas,
            taxa_poupanca=resumo.taxa_poupanca,
            num_transacoes=resumo.num_transacoes
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular saldo: {str(e)}")


@app.get("/insights")
def get_insights():
    """Endpoint para obter insights automáticos."""
    try:
        service = get_financial_service()
        insights = service.gerar_insights()
        gastos_categoria = service.obter_gastos_por_categoria()
        alimentacao = service.obter_gastos_alimentacao_fora()
        
        return {
            "insights": insights,
            "gastos_por_categoria": gastos_categoria,
            "analise_alimentacao": alimentacao
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


@app.get("/resumo-mensal")
def get_resumo_mensal():
    """Endpoint para obter resumo mês a mês."""
    try:
        service = get_financial_service()
        resumos = service.obter_resumo_por_mes()
        
        return {
            "resumos": [
                {
                    "mes_ano": r.mes_ano,
                    "total_entradas": r.total_entradas,
                    "total_saidas": r.total_saidas,
                    "saldo": r.saldo,
                    "taxa_poupanca": r.taxa_poupanca,
                    "gastos_por_categoria": r.gastos_por_categoria
                }
                for r in resumos
            ]
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


@app.post("/chat")
async def chat(request: ChatRequest):
    """Endpoint de chat que retorna streaming de respostas do agente CFO."""
    try:
        # Verificar se a API key do Groq está configurada
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY não configurada. Configure no arquivo .env",
            )
        
        # Carregar transações e serviço
        df = get_dataframe()
        service = get_financial_service()
        resumo = service.obter_resumo_geral()
        
        # Debug: mostrar info do DataFrame
        print(f"[DEBUG] DataFrame shape: {df.shape}")
        print(f"[DEBUG] Colunas: {df.columns.tolist()}")
        print(f"[DEBUG] Data min: {df['Data'].min()}, Data max: {df['Data'].max()}")
        
        # Obter datas com tratamento de NaT
        data_min = df['Data'].min()
        data_max = df['Data'].max()
        data_inicio_str = data_min.strftime('%d/%m/%Y') if pd.notna(data_min) else 'N/A'
        data_fim_str = data_max.strftime('%d/%m/%Y') if pd.notna(data_max) else 'N/A'
        
        print(f"[DEBUG] Data inicio: {data_inicio_str}, Data fim: {data_fim_str}")
        
        # Gerar o prompt dinamicamente com informações reais do DataFrame
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            num_transacoes=len(df),
            data_inicio=data_inicio_str,
            data_fim=data_fim_str,
            total_entradas=resumo.total_entradas,
            total_saidas=resumo.total_saidas,
            saldo=resumo.saldo_periodo
        )
        
        print(f"[DEBUG] System prompt gerado com sucesso")
        
        # Configurar o LLM
        llm = ChatGroq(
            model_name="llama-3.3-70b-versatile",  # Modelo mais capaz para análise
            groq_api_key=groq_api_key,
            temperature=0.3,
        )
        
        # Criar agente com Pandas DataFrame
        agent = create_pandas_dataframe_agent(
            llm=llm,
            df=df,
            verbose=True,
            agent_type="tool-calling",
            allow_dangerous_code=True,
            prefix=system_prompt,
            number_of_head_rows=0,  # Não mostrar preview do df
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
