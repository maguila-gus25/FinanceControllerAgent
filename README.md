# CFO Agent - Assistente Financeiro Pessoal com IA

## 📊 Problema Resolvido

Profissionais em ascensão frequentemente enfrentam o desafio de controlar suas finanças pessoais de forma inteligente. Analisar extratos bancários, identificar padrões de gastos, entender para onde o dinheiro está indo e otimizar despesas são tarefas que consomem tempo e exigem disciplina.

O **CFO Agent** resolve esse problema ao fornecer um assistente de IA especializado que:
- Analisa extratos bancários do **C6 Bank** automaticamente
- Responde perguntas sobre suas finanças usando linguagem natural
- Categoriza transações automaticamente (alimentação, transporte, lazer, etc.)
- Identifica padrões e tendências nos gastos
- Fornece insights para aumentar sua taxa de poupança
- Diferencia transferências pessoais de pagamentos a empresas
- **Dashboard interativo** com gráficos e visualizações por mês
- **Exportação de dados** para Excel (.xls) para análise externa

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
- **Recharts**: Biblioteca de gráficos para visualizações financeiras
- **XLSX**: Exportação de dados para Excel (.xls)

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

### 5. **Dashboard Visual Completo**
Dashboard interativo com:
- **Gráficos de pizza**: Distribuição de gastos por categoria
- **Gráficos de barras**: Evolução de entradas, saídas e saldo por mês
- **Gráficos comparativos**: Gastos por categoria ao longo do tempo
- **Tabelas detalhadas**: Lista completa de gastos por categoria com percentuais
- **Exportação Excel**: Download de dados em formato .xls para análise externa
- **Seletor de mês**: Análise específica por período

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

2. **Adicionar seu extrato C6 Bank**:

O agente utiliza extratos do C6 Bank no formato CSV. Você pode exportar seu extrato diretamente do app C6.

**Formato esperado do arquivo** (`backend/transacoesC6.csv`):
```csv
EXTRATO DE CONTA CORRENTE C6 BANK

Agência: 1 / Conta: 123456789
Extrato gerado em 20/01/2026 - as 17:33:57

Extrato de 01/01/2025 a 20/01/2026


Data Lançamento,Data Contábil,Título,Descrição,Entrada(R$),Saída(R$),Saldo do Dia(R$)
02/01/2025,02/01/2025,Pix recebido de EMPRESA ABC,Pix recebido de EMPRESA ABC,3500.00,0.00,3500.00
02/01/2025,02/01/2025,Pix enviado para SUPERMERCADO XYZ,TRANSF ENVIADA PIX,0.00,450.50,3049.50
...
```

> **📝 Nota**: Um arquivo de exemplo está disponível em `backend/transacoesC6_exemplo.csv` para referência.

> **⚠️ Importante**: O arquivo `transacoesC6.csv` está no `.gitignore` por conter dados financeiros sensíveis. Nunca faça commit de seus dados reais!

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

## 📊 Dashboard Financeiro

O Dashboard oferece uma visão completa e visual das suas finanças:

### Funcionalidades do Dashboard

1. **Visualização por Mês**
   - Selecione qualquer mês para análise detalhada
   - Cards de resumo: entradas, saídas, saldo e taxa de poupança

2. **Gráficos Interativos**
   - **Gráfico de Pizza**: Distribuição percentual de gastos por categoria no mês selecionado
   - **Gráfico de Barras Mensal**: Evolução de entradas, saídas e saldo ao longo dos meses
   - **Gráfico de Categorias**: Comparação de gastos por categoria ao longo do tempo (top 10)

3. **Tabela Detalhada**
   - Lista completa de categorias com valores e percentuais
   - Ordenação automática por valor (maior para menor)
   - **Exportação para Excel**: Baixe os dados em formato .xls com um clique

### Acessando o Dashboard

- Navegue para `/dashboard` ou clique em "📊 Dashboard" na sidebar
- Use o seletor de mês para analisar períodos específicos
- Clique em "Exportar para Excel (.xls)" na tabela para baixar os dados

## 💡 Exemplos de Uso

### Perguntas que o agente pode responder:

1. **Análise de Gastos**:
   - "Qual foi o total de gastos este mês?"
   - "Quanto gastei com alimentação fora de casa?"
   - "Quais são minhas maiores despesas?"

2. **Análise por Categoria**:
   - "Divida meus gastos por categoria"
   - "Quanto gastei com transporte?"
   - "Compare gastos de restaurantes vs supermercado"

3. **Análise de Entradas**:
   - "Qual foi o total de entradas no período?"
   - "De onde vem minha renda?"
   - "Qual minha taxa de poupança?"

4. **Transferências**:
   - "Quanto enviei de Pix para amigos?"
   - "Quais foram minhas transferências pessoais?"
   - "Liste os pagamentos para empresas"

5. **Insights Financeiros**:
   - "Dê um resumo das minhas finanças"
   - "Onde posso economizar?"
   - "Meus gastos com alimentação estão altos?"

## 🏗️ Estrutura do Projeto

```
FinanceControllerAgent/
├── backend/
│   ├── domain/                      # Camada de Domínio (DDD)
│   │   ├── entities.py              # Entidades (Transação, Categorias)
│   │   └── categorizer.py           # Lógica de categorização
│   ├── infrastructure/              # Camada de Infraestrutura
│   │   └── csv_reader.py            # Leitor de CSV C6 Bank
│   ├── application/                 # Camada de Aplicação
│   │   └── financial_service.py     # Serviços de análise financeira
│   ├── main.py                      # FastAPI + LangChain Agent
│   ├── requirements.txt             # Dependências Python
│   ├── transacoesC6.csv             # Seu extrato (não commitado)
│   └── transacoesC6_exemplo.csv     # Exemplo de formato
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # API route para chat
│   │   │   ├── balance/route.ts     # API route para saldo
│   │   │   └── monthly-summary/route.ts  # API route para dados mensais
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Página do Dashboard
│   │   ├── page.tsx                 # Interface principal (Chat)
│   │   └── layout.tsx               # Layout base
│   ├── components/
│   │   ├── Sidebar.tsx              # Dashboard lateral com navegação
│   │   ├── CategoryPieChart.tsx    # Gráfico de pizza por categoria
│   │   ├── ExpensesByMonthChart.tsx # Gráfico de barras mensal
│   │   ├── MonthlyExpensesChart.tsx  # Gráfico de categorias ao longo do tempo
│   │   └── ExpensesTable.tsx        # Tabela com exportação Excel
│   └── package.json
├── docker-compose.yml               # Orquestração de containers
└── README.md
```

## 📁 Categorias Automáticas

O agente categoriza automaticamente suas transações em:

| Categoria | Exemplos |
|-----------|----------|
| **Alimentação** | iFood, Uber Eats, lanchonetes, fast food |
| **Restaurantes/Bares** | Restaurantes, bares, pubs, cafeterias |
| **Supermercado** | Mercados, atacadões, hortifruti |
| **Transporte** | Uber, 99, combustível, estacionamento |
| **Saúde/Farmácia** | Farmácias, consultas, exames |
| **Lazer/Entretenimento** | Cinema, shows, viagens, streaming |
| **Compras** | Lojas, e-commerce, shopping |
| **Serviços** | Barbearia, academia, lavanderia |
| **Assinaturas/Apps** | Netflix, Spotify, apps |
| **Tarifas Bancárias** | Tarifas, taxas, IOF |
| **Transferência Pessoal** | Pix para amigos/família |
| **Pix Enviado** | Pix para empresas |
| **Pix Recebido** | Recebimentos via Pix |
| **Saque** | Saques em caixas eletrônicos |

## 🔄 Fluxo de Dados

```
Usuário → Next.js API Route → FastAPI /chat → LangChain Agent → Pandas Tool → CSV
                                                                         ↓
Usuário vê streaming ← Next.js ← FastAPI Streaming ← LangChain Response ←
```

## 🐳 Executando com Docker

A forma mais fácil de executar o projeto é usando Docker:

```bash
# Configurar a chave da API Groq
export GROQ_API_KEY=sua_chave_aqui  # Linux/Mac
$env:GROQ_API_KEY="sua_chave_aqui"  # Windows PowerShell

# Subir os containers
docker-compose up --build
```

Acesse:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 🎯 Próximos Passos

Este é o MVP do CFO Agent. Futuras melhorias podem incluir:
- Suporte a extratos de outros bancos (Nubank, Itaú, etc.)
- Metas de economia e alertas personalizados
- Previsão de gastos usando ML
- Exportação de relatórios em PDF
- Filtros avançados no dashboard (por categoria, período, valor)
- Comparação entre períodos (mês a mês, ano a ano)
- App mobile


**Desenvolvido para ajudar você a construir riqueza e ter controle total das suas finanças.**
