"""
Application Layer - Serviço de análise financeira.
Contém toda a lógica de análise separada da API.
"""

import pandas as pd
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from infrastructure.csv_reader import C6BankCSVReader


@dataclass
class ResumoFinanceiro:
    """Resumo financeiro do período."""
    total_entradas: float
    total_saidas: float
    saldo_periodo: float
    taxa_poupanca: float  # Percentual poupado
    media_diaria_gastos: float
    maior_gasto: float
    maior_entrada: float
    num_transacoes: int


@dataclass
class ResumoMensal:
    """Resumo financeiro de um mês específico."""
    mes_ano: str
    total_entradas: float
    total_saidas: float
    saldo: float
    taxa_poupanca: float
    gastos_por_categoria: Dict[str, float]


class FinancialAnalysisService:
    """
    Serviço de análise financeira.
    Responsável por processar dados e gerar insights.
    """
    
    def __init__(self, csv_path: str):
        """
        Inicializa o serviço com o caminho do CSV.
        
        Args:
            csv_path: Caminho para o arquivo CSV do extrato
        """
        self._reader = C6BankCSVReader(csv_path)
        self._df: Optional[pd.DataFrame] = None
    
    @property
    def df(self) -> pd.DataFrame:
        """Retorna o DataFrame de transações."""
        if self._df is None:
            self._df = self._reader.obter_dataframe_para_analise()
        return self._df
    
    def obter_resumo_geral(self) -> ResumoFinanceiro:
        """
        Calcula o resumo financeiro geral do período.
        
        Returns:
            ResumoFinanceiro com métricas do período
        """
        df = self.df
        
        total_entradas = float(df['Entrada'].sum())
        total_saidas = float(df['Saida'].sum())
        
        # Saldo real = último saldo do extrato (não calculado)
        # Ordenar por data e pegar o saldo da última transação
        df_sorted = df.sort_values('Data')
        saldo_atual = float(df_sorted['Saldo'].iloc[-1])
        
        # Taxa de poupança: quanto % das entradas foi poupado
        saldo_calculado = total_entradas - total_saidas
        taxa_poupanca = (saldo_calculado / total_entradas * 100) if total_entradas > 0 else 0
        
        # Média diária de gastos
        dias_periodo = (df['Data'].max() - df['Data'].min()).days or 1
        media_diaria = total_saidas / dias_periodo
        
        return ResumoFinanceiro(
            total_entradas=round(total_entradas, 2),
            total_saidas=round(total_saidas, 2),
            saldo_periodo=round(saldo_atual, 2),  # Usar saldo real do extrato
            taxa_poupanca=round(taxa_poupanca, 2),
            media_diaria_gastos=round(media_diaria, 2),
            maior_gasto=round(df['Saida'].max(), 2),
            maior_entrada=round(df['Entrada'].max(), 2),
            num_transacoes=len(df)
        )
    
    def obter_resumo_por_mes(self) -> list[ResumoMensal]:
        """
        Calcula resumo financeiro por mês.
        
        Returns:
            Lista de ResumoMensal para cada mês
        """
        df = self.df
        resumos = []
        
        for mes_ano in df['Mes_Ano'].unique():
            df_mes = df[df['Mes_Ano'] == mes_ano]
            
            total_entradas = df_mes['Entrada'].sum()
            total_saidas = df_mes['Saida'].sum()
            saldo = total_entradas - total_saidas
            taxa_poupanca = (saldo / total_entradas * 100) if total_entradas > 0 else 0
            
            # Gastos por categoria
            gastos_categoria = df_mes[df_mes['Saida'] > 0].groupby('Categoria')['Saida'].sum().to_dict()
            
            resumos.append(ResumoMensal(
                mes_ano=mes_ano,
                total_entradas=round(total_entradas, 2),
                total_saidas=round(total_saidas, 2),
                saldo=round(saldo, 2),
                taxa_poupanca=round(taxa_poupanca, 2),
                gastos_por_categoria={k: round(v, 2) for k, v in gastos_categoria.items()}
            ))
        
        return sorted(resumos, key=lambda x: x.mes_ano)
    
    def obter_gastos_por_categoria(self) -> Dict[str, float]:
        """
        Retorna total de gastos agrupados por categoria.
        
        Returns:
            Dicionário com categoria -> valor total
        """
        df = self.df
        gastos = df[df['Saida'] > 0].groupby('Categoria')['Saida'].sum()
        return {str(k): round(float(v), 2) for k, v in gastos.sort_values(ascending=False).items()}
    
    def obter_entradas_por_categoria(self) -> Dict[str, float]:
        """
        Retorna total de entradas agrupadas por categoria.
        
        Returns:
            Dicionário com categoria -> valor total
        """
        df = self.df
        entradas = df[df['Entrada'] > 0].groupby('Categoria')['Entrada'].sum()
        return {str(k): round(float(v), 2) for k, v in entradas.sort_values(ascending=False).items()}
    
    def obter_gastos_alimentacao_fora(self) -> Dict[str, Any]:
        """
        Analisa especificamente gastos com alimentação fora de casa.
        Inclui restaurantes, delivery, lanchonetes, etc.
        
        Returns:
            Dicionário com análise de gastos com alimentação
        """
        df = self.df
        
        categorias_alimentacao = ['Alimentação', 'Restaurantes/Bares']
        df_alimentacao = df[df['Categoria'].isin(categorias_alimentacao)]
        
        total = float(df_alimentacao['Saida'].sum())
        num_transacoes = int(len(df_alimentacao))
        media_por_transacao = total / num_transacoes if num_transacoes > 0 else 0
        
        # Por mês
        por_mes = df_alimentacao.groupby('Mes_Ano')['Saida'].sum().to_dict()
        
        # Percentual do total de gastos
        total_gastos = float(df['Saida'].sum())
        percentual = (total / total_gastos * 100) if total_gastos > 0 else 0
        
        return {
            'total': round(total, 2),
            'num_transacoes': num_transacoes,
            'media_por_transacao': round(media_por_transacao, 2),
            'percentual_dos_gastos': round(percentual, 2),
            'por_mes': {str(k): round(float(v), 2) for k, v in por_mes.items()}
        }
    
    def obter_maiores_gastos(self, limite: int = 10) -> pd.DataFrame:
        """
        Retorna os maiores gastos do período.
        
        Args:
            limite: Número máximo de transações a retornar
            
        Returns:
            DataFrame com os maiores gastos
        """
        df = self.df
        return df[df['Saida'] > 0].nlargest(limite, 'Saida')[
            ['Data', 'Titulo', 'Descricao', 'Saida', 'Categoria']
        ]
    
    def obter_maiores_entradas(self, limite: int = 10) -> pd.DataFrame:
        """
        Retorna as maiores entradas do período.
        
        Args:
            limite: Número máximo de transações a retornar
            
        Returns:
            DataFrame com as maiores entradas
        """
        df = self.df
        return df[df['Entrada'] > 0].nlargest(limite, 'Entrada')[
            ['Data', 'Titulo', 'Descricao', 'Entrada', 'Categoria']
        ]
    
    def obter_transferencias_pessoais(self) -> Dict[str, Any]:
        """
        Analisa transferências pessoais (Pix para pessoas).
        
        Returns:
            Dicionário com análise de transferências
        """
        df = self.df
        
        df_transf = df[df['Categoria'] == 'Transferência Pessoal']
        
        total_enviado = df_transf['Saida'].sum()
        
        # Agrupa por destinatário (título contém o nome)
        por_pessoa = df_transf.groupby('Titulo')['Saida'].sum().sort_values(ascending=False)
        
        return {
            'total_enviado': round(total_enviado, 2),
            'num_transferencias': len(df_transf),
            'por_pessoa': {k: round(v, 2) for k, v in por_pessoa.head(10).items()}
        }
    
    def gerar_insights(self) -> list[str]:
        """
        Gera insights automáticos sobre as finanças.
        
        Returns:
            Lista de strings com insights
        """
        insights = []
        resumo = self.obter_resumo_geral()
        gastos_cat = self.obter_gastos_por_categoria()
        alimentacao = self.obter_gastos_alimentacao_fora()
        
        # Insight sobre taxa de poupança
        if resumo.taxa_poupanca < 0:
            insights.append(
                f"⚠️ ALERTA: Você gastou mais do que ganhou no período. "
                f"Déficit de R$ {abs(resumo.saldo_periodo):.2f}"
            )
        elif resumo.taxa_poupanca < 10:
            insights.append(
                f"📊 Sua taxa de poupança está em {resumo.taxa_poupanca:.1f}%. "
                f"O recomendado é poupar pelo menos 20% da renda."
            )
        elif resumo.taxa_poupanca >= 20:
            insights.append(
                f"✅ Excelente! Sua taxa de poupança de {resumo.taxa_poupanca:.1f}% "
                f"está acima do recomendado."
            )
        
        # Insight sobre alimentação fora
        if alimentacao['percentual_dos_gastos'] > 25:
            insights.append(
                f"🍔 Gastos com alimentação fora representam "
                f"{alimentacao['percentual_dos_gastos']:.1f}% dos seus gastos totais. "
                f"Considere preparar mais refeições em casa."
            )
        
        # Insight sobre maior categoria de gasto
        if gastos_cat:
            maior_cat = list(gastos_cat.items())[0]
            insights.append(
                f"💰 Sua maior categoria de gasto é '{maior_cat[0]}' "
                f"com R$ {maior_cat[1]:.2f} no período."
            )
        
        return insights
