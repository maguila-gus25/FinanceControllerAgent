# CFO Agent - Financial Control Agent

## 📊 Problema Resolvido

CEOs e fundadores de startups frequentemente enfrentam o desafio de tomar decisões financeiras críticas sem ter acesso rápido e inteligente aos dados financeiros da empresa. Analisar extratos, identificar padrões de gastos, entender o fluxo de caixa e otimizar custos são tarefas que consomem tempo valioso que poderia ser investido em crescimento estratégico.

O **CFO Agent** resolve esse problema ao fornecer um assistente de IA especializado que:
- Analisa transações financeiras em tempo real
- Responde perguntas complexas sobre finanças usando linguagem natural
- Identifica padrões e tendências nos gastos
- Fornece insights acionáveis para otimização de custos
- Oferece uma visão clara do cashflow e saúde financeira

## 🛠 Stack Utilizada

### Backend
- **Python 3.10+**: Linguagem principal
- **FastAPI**: Framework web assíncrono para APIs de alta performance
- **LangChain**: Orquestração de agentes de IA e integração com LLMs
- **ChatGroq (Llama 3.1)**: Modelo de linguagem rápido e eficiente via Groq API
- **Pandas**: Manipulação e análise de dados financeiros
- **Pydantic**: Validação de dados e modelos tipados

### Frontend
- **Next.js 14+**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança de código
- **Tailwind CSS**: Estilização utilitária e design moderno
- **Vercel AI SDK**: Integração com streaming de respostas de IA
- **React Hooks**: Gerenciamento de estado e efeitos

### Arquitetura
- **DDD Lite**: Separação de responsabilidades (Domain/Application/Infrastructure)
- **SOLID Principles**: Código limpo e extensível
- **Streaming**: Respostas em tempo real para melhor UX

## 🚀 Como Este Agente Ajuda CEOs

### 1. **Decisões Baseadas em Dados**
O agente transforma dados brutos em insights acionáveis. Em vez de analisar planilhas manualmente, CEOs podem fazer perguntas diretas como:
- "Qual foi o gasto total com cloud este trimestre?"
- "Qual categoria está consumindo mais recursos?"
- "Dê um resumo do meu cashflow"

### 2. **Análise Automatizada**
O agente utiliza Pandas para realizar análises estatísticas complexas automaticamente, identificando:
- Tendências de gastos por categoria
- Padrões temporais (mensal, trimestral)
- Comparações entre períodos
- Projeções básicas de fluxo de caixa

### 3. **Insights Estratégicos**
Atuando como um CFO experiente, o agente não apenas fornece números, mas também:
- Sugere otimizações de custos
- Identifica oportunidades de economia
- Alerta sobre padrões preocupantes
- Recomenda ações baseadas em melhores práticas de startups

### 4. **Acesso Rápido e Conveniente**
Interface moderna e intuitiva que permite:
- Consultas em linguagem natural
- Respostas em tempo real (streaming)
- Visualização de saldo e métricas principais
- Histórico de conversas

## 📦 Instalação e Configuração

> **📖 Guia Completo**: Para instruções detalhadas passo a passo, incluindo instalação do Node.js, veja [SETUP.md](SETUP.md)

### Pré-requisitos
- Python 3.10 ou superior
- Node.js 18+ e npm/yarn
- Conta Groq API (gratuita em https://console.groq.com)

### Backend

1. **Instalar dependências**:
```bash
cd backend
pip install -r requirements.txt
```

**Nota para Windows**: Se encontrar erro ao instalar pandas, tente uma das seguintes soluções:

**Opção 1 (Recomendada)**: Usar o script de instalação:
```powershell
# Windows PowerShell
.\install.ps1
```

**Opção 2**: Instalar pandas separadamente primeiro:
```bash
pip install pandas
pip install -r requirements.txt
```

**Opção 3**: Usar conda (se tiver Anaconda/Miniconda instalado):
```bash
conda install pandas
pip install -r requirements.txt
```

**Opção 4**: Se estiver usando Python 3.13+, considere usar Python 3.10 ou 3.11 para melhor compatibilidade:
```bash
# Criar ambiente virtual com Python 3.11 (se tiver múltiplas versões)
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

2. **Gerar dados fictícios**:
```bash
python data_generator.py
```

3. **Configurar variáveis de ambiente**:
Crie um arquivo `.env` na raiz do projeto:
```env
GROQ_API_KEY=sua_chave_aqui
```

4. **Iniciar servidor FastAPI**:
```bash
uvicorn main:app --reload --port 8000
```

O servidor estará disponível em `http://localhost:8000`

### Frontend

1. **Instalar dependências**:
```bash
cd frontend
npm install
```

2. **Configurar variáveis de ambiente** (opcional):
Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

3. **Iniciar servidor de desenvolvimento**:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 💡 Exemplos de Uso

### Perguntas que o agente pode responder:

1. **Análise de Categorias**:
   - "Qual categoria tem o maior gasto?"
   - "Quanto gastamos com Marketing nos últimos 3 meses?"
   - "Compare os gastos de Cloud vs Software"

2. **Análise Temporal**:
   - "Qual foi o gasto total deste mês?"
   - "Como está a tendência de gastos?"
   - "Houve aumento nos custos de Cloud?"

3. **Insights e Recomendações**:
   - "Dê um resumo do meu cashflow"
   - "Quais são os principais gastos?"
   - "Onde posso reduzir custos?"

4. **Consultas Específicas**:
   - "Qual foi o gasto total com cloud?"
   - "Quantos salários foram pagos?"
   - "Qual é o custo médio por transação?"

## 🏗️ Estrutura do Projeto

```
FinanceControllerAgent/
├── backend/
│   ├── data_generator.py      # Gera CSV com transações fictícias
│   ├── main.py                 # FastAPI + LangChain Agent
│   ├── requirements.txt        # Dependências Python
│   └── transacoes.csv          # Dados financeiros (gerado)
├── frontend/
│   ├── app/
│   │   ├── api/chat/route.ts   # API route para proxy do FastAPI
│   │   ├── page.tsx            # Interface principal de chat
│   │   └── layout.tsx          # Layout base
│   ├── components/
│   │   └── Sidebar.tsx         # Componente de saldo
│   └── package.json
└── README.md
```

## 🔄 Fluxo de Dados

```
Usuário → Next.js API Route → FastAPI /chat → LangChain Agent → Pandas Tool → CSV
                                                                         ↓
Usuário vê streaming ← Next.js ← FastAPI Streaming ← LangChain Response ←
```

## 🎯 Próximos Passos

Este é o MVP do CFO Agent. Futuras melhorias podem incluir:
- Previsão de caixa usando modelos de ML
- Integração com APIs bancárias reais
- Dashboard com gráficos e visualizações
- Alertas automáticos de anomalias
- Suporte a múltiplas moedas
- Exportação de relatórios em PDF

## 📝 Licença

Este projeto faz parte da CEO Stack - um ecossistema de agentes de IA para gestão empresarial.

---

**Desenvolvido com foco em eficiência, escalabilidade e decisões baseadas em dados.**
