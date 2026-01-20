"""
Domain Entities - Representação das transações financeiras.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


class TipoTransacao(Enum):
    """Tipo da transação: entrada ou saída de dinheiro."""
    ENTRADA = "entrada"
    SAIDA = "saida"


class CategoriaTransacao(Enum):
    """Categorias de transação para análise financeira."""
    # Entradas
    SALARIO = "Salário/Renda"
    PIX_RECEBIDO = "Pix Recebido"
    ESTORNO = "Estorno/Devolução"
    
    # Saídas - Essenciais
    ALIMENTACAO = "Alimentação"
    SUPERMERCADO = "Supermercado"
    TRANSPORTE = "Transporte"
    SAUDE = "Saúde/Farmácia"
    MORADIA = "Moradia"
    TARIFAS_BANCARIAS = "Tarifas Bancárias"
    
    # Saídas - Estilo de Vida
    LAZER = "Lazer/Entretenimento"
    RESTAURANTES = "Restaurantes/Bares"
    COMPRAS = "Compras"
    SERVICOS = "Serviços"
    ASSINATURAS = "Assinaturas/Apps"
    
    # Transferências
    TRANSFERENCIA_PESSOAL = "Transferência Pessoal"
    PIX_ENVIADO = "Pix Enviado"
    
    # Outros
    SAQUE = "Saque"
    OUTROS = "Outros"


@dataclass
class Transacao:
    """Entidade que representa uma transação financeira."""
    data_lancamento: datetime
    data_contabil: datetime
    titulo: str
    descricao: str
    valor_entrada: float
    valor_saida: float
    saldo_dia: float
    tipo: TipoTransacao
    categoria: CategoriaTransacao
    
    @property
    def valor(self) -> float:
        """Retorna o valor da transação (positivo para entrada, negativo para saída)."""
        if self.tipo == TipoTransacao.ENTRADA:
            return self.valor_entrada
        return -self.valor_saida
    
    @property
    def valor_absoluto(self) -> float:
        """Retorna o valor absoluto da transação."""
        return self.valor_entrada if self.valor_entrada > 0 else self.valor_saida
