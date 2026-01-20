"""
Infrastructure Layer - Leitura e processamento do CSV do C6 Bank.
"""

import pandas as pd
import chardet
from pathlib import Path
from typing import Optional
from datetime import datetime

from domain.entities import Transacao, TipoTransacao
from domain.categorizer import CategorizadorTransacao


class C6BankCSVReader:
    """
    Leitor especializado para extratos CSV do C6 Bank.
    
    O formato do extrato C6 tem um cabeçalho com informações do banco
    nas primeiras linhas, seguido pelos dados da transação.
    """
    
    # Colunas esperadas do extrato C6
    COLUNAS_ESPERADAS = [
        'Data Lançamento',
        'Data Contábil', 
        'Título',
        'Descrição',
        'Entrada(R$)',
        'Saída(R$)',
        'Saldo do Dia(R$)'
    ]
    
    def __init__(self, caminho_csv: str):
        """
        Inicializa o leitor com o caminho do arquivo CSV.
        
        Args:
            caminho_csv: Caminho para o arquivo CSV do extrato C6
        """
        self.caminho_csv = Path(caminho_csv)
        self._df: Optional[pd.DataFrame] = None
        self._transacoes: Optional[list[Transacao]] = None
    
    def _detectar_encoding(self) -> str:
        """Detecta automaticamente o encoding do arquivo."""
        with open(self.caminho_csv, 'rb') as f:
            resultado = chardet.detect(f.read())
        return resultado.get('encoding', 'utf-8')
    
    def _encontrar_linha_cabecalho(self) -> int:
        """
        Encontra a linha onde começa o cabeçalho dos dados.
        O extrato C6 tem informações do banco nas primeiras linhas.
        """
        encoding = self._detectar_encoding()
        
        with open(self.caminho_csv, 'r', encoding=encoding) as f:
            for i, linha in enumerate(f):
                if 'Data Lançamento' in linha:
                    return i
        
        # Se não encontrou, assume que é a primeira linha
        return 0
    
    def carregar(self) -> pd.DataFrame:
        """
        Carrega o CSV do C6 Bank e retorna um DataFrame processado.
        
        Returns:
            DataFrame com as transações processadas
        """
        if self._df is not None:
            return self._df
        
        encoding = self._detectar_encoding()
        linha_cabecalho = self._encontrar_linha_cabecalho()
        
        # Lê o CSV pulando as linhas de cabeçalho do banco
        # Formato americano: ponto como decimal (300.00 = trezentos reais)
        self._df = pd.read_csv(
            self.caminho_csv,
            encoding=encoding,
            skiprows=linha_cabecalho,
        )
        
        # Renomeia colunas para padronizar
        self._df.columns = self._df.columns.str.strip()
        
        # Converte colunas de valores para numérico (formato americano - ponto é decimal)
        for col in ['Entrada(R$)', 'Saída(R$)', 'Saldo do Dia(R$)']:
            if col in self._df.columns:
                self._df[col] = pd.to_numeric(
                    self._df[col],
                    errors='coerce'
                ).fillna(0)
        
        # Converte datas
        for col in ['Data Lançamento', 'Data Contábil']:
            if col in self._df.columns:
                self._df[col] = pd.to_datetime(
                    self._df[col],
                    format='%d/%m/%Y',
                    errors='coerce'
                )
        
        # Remove linhas sem data válida
        self._df = self._df.dropna(subset=['Data Lançamento'])
        
        # Adiciona colunas de categorização
        self._adicionar_categorias()
        
        return self._df
    
    def _adicionar_categorias(self) -> None:
        """Adiciona colunas de tipo e categoria às transações."""
        tipos = []
        categorias = []
        
        for _, row in self._df.iterrows():
            tipo, categoria = CategorizadorTransacao.categorizar(
                titulo=str(row.get('Título', '')),
                descricao=str(row.get('Descrição', '')),
                valor_entrada=float(row.get('Entrada(R$)', 0)),
                valor_saida=float(row.get('Saída(R$)', 0))
            )
            tipos.append(tipo.value)
            categorias.append(categoria.value)
        
        self._df['Tipo'] = tipos
        self._df['Categoria'] = categorias
    
    def obter_transacoes(self) -> list[Transacao]:
        """
        Retorna lista de objetos Transacao.
        
        Returns:
            Lista de entidades Transacao
        """
        if self._transacoes is not None:
            return self._transacoes
        
        df = self.carregar()
        self._transacoes = []
        
        for _, row in df.iterrows():
            tipo, categoria = CategorizadorTransacao.categorizar(
                titulo=str(row.get('Título', '')),
                descricao=str(row.get('Descrição', '')),
                valor_entrada=float(row.get('Entrada(R$)', 0)),
                valor_saida=float(row.get('Saída(R$)', 0))
            )
            
            transacao = Transacao(
                data_lancamento=row['Data Lançamento'],
                data_contabil=row['Data Contábil'],
                titulo=str(row.get('Título', '')),
                descricao=str(row.get('Descrição', '')),
                valor_entrada=float(row.get('Entrada(R$)', 0)),
                valor_saida=float(row.get('Saída(R$)', 0)),
                saldo_dia=float(row.get('Saldo do Dia(R$)', 0)),
                tipo=tipo,
                categoria=categoria
            )
            self._transacoes.append(transacao)
        
        return self._transacoes
    
    def obter_dataframe_para_analise(self) -> pd.DataFrame:
        """
        Retorna DataFrame otimizado para análise pelo agente LLM.
        
        Returns:
            DataFrame com colunas renomeadas para português claro
        """
        df = self.carregar().copy()
        
        # Renomeia colunas para serem mais claras
        df = df.rename(columns={
            'Data Lançamento': 'Data',
            'Data Contábil': 'Data_Contabil',
            'Título': 'Titulo',
            'Descrição': 'Descricao',
            'Entrada(R$)': 'Entrada',
            'Saída(R$)': 'Saida',
            'Saldo do Dia(R$)': 'Saldo'
        })
        
        # Adiciona coluna de mês/ano para facilitar agrupamentos
        df['Mes_Ano'] = df['Data'].dt.to_period('M').astype(str)
        df['Mes'] = df['Data'].dt.month
        df['Ano'] = df['Data'].dt.year
        
        return df
