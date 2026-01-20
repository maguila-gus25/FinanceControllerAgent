"""
Gerador de dados fictícios para transações financeiras.
Gera um CSV com transações distribuídas nos últimos 3 meses.
"""

import pandas as pd
import random
from datetime import datetime, timedelta
from typing import List, Dict


def generate_transactions(num_transactions: int = 80) -> pd.DataFrame:
    """
    Gera um DataFrame com transações financeiras fictícias.
    
    Args:
        num_transactions: Número de transações a gerar
        
    Returns:
        DataFrame com colunas: data, categoria, valor, descricao
    """
    categorias = {
        "Marketing": {
            "descriptions": [
                "Google Ads - Campanha Q4",
                "Facebook Ads - Conversão",
                "LinkedIn Ads - B2B",
                "Influencer Marketing",
                "Conteúdo Patrocinado",
                "Email Marketing Tool",
                "SEO Tools",
            ],
            "valor_range": (500, 5000),
        },
        "Cloud": {
            "descriptions": [
                "AWS EC2 Instances",
                "AWS S3 Storage",
                "AWS RDS Database",
                "Cloudflare CDN",
                "Vercel Hosting",
                "MongoDB Atlas",
                "Redis Cloud",
            ],
            "valor_range": (200, 3000),
        },
        "Salários": {
            "descriptions": [
                "Salário Desenvolvedor Senior",
                "Salário Product Manager",
                "Salário Designer",
                "Salário DevOps",
                "Salário CEO",
                "Salário CTO",
            ],
            "valor_range": (8000, 15000),
        },
        "Café": {
            "descriptions": [
                "Café para o escritório",
                "Café da manhã da equipe",
                "Café especial para reuniões",
                "Máquina de café",
                "Café para eventos",
            ],
            "valor_range": (50, 300),
        },
        "Software": {
            "descriptions": [
                "Licença GitHub Enterprise",
                "Slack Premium",
                "Notion Business",
                "Figma Professional",
                "JetBrains All Products",
                "Adobe Creative Cloud",
                "Microsoft 365 Business",
            ],
            "valor_range": (100, 2000),
        },
    }
    
    transactions: List[Dict[str, any]] = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    
    for _ in range(num_transactions):
        # Data aleatória nos últimos 3 meses
        days_ago = random.randint(0, 90)
        data = start_date + timedelta(days=days_ago)
        
        # Categoria aleatória
        categoria = random.choice(list(categorias.keys()))
        categoria_info = categorias[categoria]
        
        # Descrição aleatória da categoria
        descricao = random.choice(categoria_info["descriptions"])
        
        # Valor aleatório dentro do range da categoria
        min_valor, max_valor = categoria_info["valor_range"]
        valor = round(random.uniform(min_valor, max_valor), 2)
        
        transactions.append({
            "data": data.strftime("%Y-%m-%d"),
            "categoria": categoria,
            "valor": valor,
            "descricao": descricao,
        })
    
    df = pd.DataFrame(transactions)
    # Ordenar por data
    df["data"] = pd.to_datetime(df["data"])
    df = df.sort_values("data")
    df["data"] = df["data"].dt.strftime("%Y-%m-%d")
    
    return df


if __name__ == "__main__":
    print("Gerando transações fictícias...")
    df = generate_transactions()
    df.to_csv("transacoes.csv", index=False, encoding="utf-8")
    print(f"✅ {len(df)} transações geradas e salvas em transacoes.csv")
    print(f"\nResumo por categoria:")
    print(df.groupby("categoria")["valor"].sum().to_string())
    print(f"\nTotal: R$ {df['valor'].sum():,.2f}")
