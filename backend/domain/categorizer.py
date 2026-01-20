"""
Domain Service - Lógica de categorização de transações.
Regras de negócio para classificar transações do extrato C6 Bank.
"""

import re
from typing import Tuple
from .entities import CategoriaTransacao, TipoTransacao


class CategorizadorTransacao:
    """
    Serviço de domínio responsável por categorizar transações
    baseado no título e descrição do extrato C6 Bank.
    """
    
    # Padrões para identificar categorias (case-insensitive)
    PADROES_CATEGORIA = {
        # === ENTRADAS ===
        CategoriaTransacao.SALARIO: [
            r'salario', r'salário', r'pagamento\s+de\s+salario',
            r'folha\s+de\s+pagamento', r'pro-labore', r'prolabore'
        ],
        CategoriaTransacao.ESTORNO: [
            r'estorno', r'devolucao', r'devolução', r'reembolso',
            r'credito\s+de\s+devolucao'
        ],
        
        # === SAÍDAS - ESSENCIAIS ===
        CategoriaTransacao.ALIMENTACAO: [
            r'ifood', r'i\s*food', r'rappi', r'uber\s*eats',
            r'lanchonete', r'padaria', r'hot\s*dog', r'hamburgueria',
            r'burger', r'mcdonalds', r'mc\s*donalds', r'arcos\s+dourados',
            r'subway', r'pizza', r'sushi', r'açaí', r'acai',
            r'sorvete', r'doceria', r'confeitaria', r'cafe', r'café',
            r'bakery', r'lanche', r'fast\s*food', r'cozinha',
            r'cowboy\s+burger', r'poke', r'restaurante\s+do',
            r'galo\s+ko', r'ab7\s+lanchonete'
        ],
        CategoriaTransacao.SUPERMERCADO: [
            r'supermercado', r'mercado', r'angeloni', r'imperatriz',
            r'bistek', r'giassi', r'big', r'carrefour', r'extra',
            r'pao\s+de\s+acucar', r'hipermercado', r'atacadao',
            r'assai', r'atacado', r'vitamar', r'mundialmix',
            r'comercio\s+de\s+alimentos', r'mercado\s+\d+hs'
        ],
        CategoriaTransacao.TRANSPORTE: [
            r'uber(?!\s*eats)', r'99\s*(?:pop|taxi)', r'taxi', r'táxi',
            r'combustivel', r'combustível', r'gasolina', r'alcool',
            r'etanol', r'diesel', r'posto', r'shell', r'ipiranga',
            r'br\s+distribuidora', r'petrobras', r'estacionamento',
            r'parking', r'park', r'passagem', r'onibus', r'ônibus',
            r'metro', r'metrô', r'brt', r'raizen', r'quero\s+passagem',
            r'redpark'
        ],
        CategoriaTransacao.SAUDE: [
            r'farmacia', r'farmácia', r'drogaria', r'panvel',
            r'droga\s*raia', r'pacheco', r'pague\s*menos',
            r'drogasil', r'hospital', r'clinica', r'clínica',
            r'medico', r'médico', r'laboratorio', r'laboratório',
            r'exame', r'consulta', r'dentista', r'odonto',
            r'plano\s+de\s+saude', r'unimed', r'hapvida', r'amil'
        ],
        CategoriaTransacao.MORADIA: [
            r'aluguel', r'condominio', r'condomínio', r'iptu',
            r'agua', r'água', r'luz', r'energia', r'celesc',
            r'eletricidade', r'gas', r'gás', r'internet',
            r'telefone', r'celular', r'vivo', r'claro', r'tim', r'oi'
        ],
        CategoriaTransacao.TARIFAS_BANCARIAS: [
            r'tarifa', r'tar\s+saque', r'taxa', r'manutencao\s+cp',
            r'manutencao\s+conta', r'manutenção', r'anuidade',
            r'iof', r'juros', r'multa\s+bancaria'
        ],
        
        # === SAÍDAS - ESTILO DE VIDA ===
        CategoriaTransacao.LAZER: [
            r'cinema', r'cinemark', r'redecine', r'teatro', r'show',
            r'ingresso', r'evento', r'festa', r'balada', r'boate',
            r'parque', r'museu', r'turismo', r'viagem', r'hotel',
            r'pousada', r'airbnb', r'booking', r'comedy\s+club',
            r'pensa\s+entretenimento', r'aventura\s+na\s+ilha'
        ],
        CategoriaTransacao.RESTAURANTES: [
            r'restaurante', r'bar\b', r'pub\b', r'boteco', r'buteco',
            r'churrascaria', r'pizzaria', r'rodizio', r'rodízio',
            r'bistr[oô]', r'trattoria', r'outback', r'madero',
            r'coco\s+bambu', r'espartano', r'balburdia', r'santo\s+gole',
            r'coffee\s+shop', r'bacio\s+di\s+latte', r'il\s+campanar',
            r'vacuno', r'afonso\s+burguer', r'tenente\s+restaurante'
        ],
        CategoriaTransacao.COMPRAS: [
            r'shopping', r'loja', r'store', r'americanas', r'amazon',
            r'magazine', r'magalu', r'casas\s+bahia', r'renner',
            r'riachuelo', r'cea', r'zara', r'hering', r'centauro',
            r'netshoes', r'mercado\s+livre', r'shopee', r'aliexpress',
            r'john\s+john', r'sephora', r'kiko\s+cosmetics', r'cosmeticos',
            r'like\s+case', r'noclass', r'hemera'
        ],
        CategoriaTransacao.SERVICOS: [
            r'barbearia', r'barbeiro', r'cabeleireiro', r'salao',
            r'salão', r'estetica', r'estética', r'manicure',
            r'lavanderia', r'conserto', r'reparo', r'assistencia',
            r'tecnico', r'técnico', r'servico', r'serviço',
            r'academia', r'gym', r'fitness', r'crossfit',
            r'copias', r'impressos', r'lusandro'
        ],
        CategoriaTransacao.ASSINATURAS: [
            r'netflix', r'spotify', r'amazon\s+prime', r'disney',
            r'hbo', r'globoplay', r'youtube\s+premium', r'deezer',
            r'apple\s+music', r'xbox', r'playstation', r'steam',
            r'twitch', r'patreon', r'onlyfans', r'boacompra',
            r'okto\s+tech', r'mooz', r'afinz', r'ip\s+afinz'
        ],
        
        # === SAQUE ===
        CategoriaTransacao.SAQUE: [
            r'saque', r'banco\s+24h', r'terminal\s+tecban',
            r'caixa\s+eletronico', r'atm'
        ],
    }
    
    # Pessoas conhecidas (para identificar transferências pessoais vs pagamentos)
    # Estas são identificadas pelo padrão de nomes próprios
    PADROES_EMPRESAS = [
        r'ltda', r's\.?a\.?', r'eireli', r'me\b', r'epp',
        r'comercio', r'comércio', r'loja', r'servicos', r'serviços',
        r'restaurante', r'supermercado', r'farmacia', r'farmácia',
        r'posto', r'hotel', r'pousada', r'academia', r'clinica',
        r'clínica', r'hospital', r'ifood', r'uber', r'rappi',
        r'pagseguro', r'mercado\s+pago', r'picpay', r'nubank',
        r'tesouro\s+nacional'
    ]

    @classmethod
    def categorizar(cls, titulo: str, descricao: str, 
                    valor_entrada: float, valor_saida: float) -> Tuple[TipoTransacao, CategoriaTransacao]:
        """
        Categoriza uma transação baseado no título e descrição.
        
        Args:
            titulo: Título da transação do extrato
            descricao: Descrição da transação do extrato
            valor_entrada: Valor de entrada (crédito)
            valor_saida: Valor de saída (débito)
            
        Returns:
            Tupla com (TipoTransacao, CategoriaTransacao)
        """
        # Determina se é entrada ou saída
        tipo = TipoTransacao.ENTRADA if valor_entrada > 0 else TipoTransacao.SAIDA
        
        # Combina título e descrição para análise
        texto = f"{titulo} {descricao}".lower()
        
        # Verifica se é PIX recebido
        if tipo == TipoTransacao.ENTRADA:
            if re.search(r'pix\s+recebido', texto):
                return tipo, CategoriaTransacao.PIX_RECEBIDO
        
        # Verifica se é PIX enviado (transferência)
        if tipo == TipoTransacao.SAIDA:
            if re.search(r'pix\s+enviado|transf\s+enviada\s+pix', texto):
                # Verifica se é para empresa ou pessoa
                if cls._is_empresa(texto):
                    # Tenta categorizar pelo destino
                    categoria = cls._categorizar_por_padrao(texto)
                    if categoria != CategoriaTransacao.OUTROS:
                        return tipo, categoria
                    return tipo, CategoriaTransacao.PIX_ENVIADO
                else:
                    return tipo, CategoriaTransacao.TRANSFERENCIA_PESSOAL
        
        # Tenta categorizar por padrões conhecidos
        categoria = cls._categorizar_por_padrao(texto)
        
        return tipo, categoria
    
    @classmethod
    def _categorizar_por_padrao(cls, texto: str) -> CategoriaTransacao:
        """Tenta categorizar o texto usando os padrões definidos."""
        for categoria, padroes in cls.PADROES_CATEGORIA.items():
            for padrao in padroes:
                if re.search(padrao, texto, re.IGNORECASE):
                    return categoria
        return CategoriaTransacao.OUTROS
    
    @classmethod
    def _is_empresa(cls, texto: str) -> bool:
        """Verifica se o texto indica uma empresa (vs pessoa física)."""
        for padrao in cls.PADROES_EMPRESAS:
            if re.search(padrao, texto, re.IGNORECASE):
                return True
        return False
