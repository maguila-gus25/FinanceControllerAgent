
# 🚀 Guia de Instalação - CFO Agent

## 🐳 Usando Docker (Recomendado)

A forma mais fácil de rodar o projeto.

### Pré-requisitos
- Docker Desktop instalado (https://www.docker.com/products/docker-desktop/)
- Conta Groq API (gratuita - https://console.groq.com)

### Passos

1. **Criar arquivo `.env`** na raiz do projeto:
   ```
   GROQ_API_KEY=sua_chave_groq_aqui
   ```

2. **Iniciar os containers**:
   ```bash
   docker-compose up --build
   ```

3. **Acessar a aplicação**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

4. **Para parar**:
   ```bash
   docker-compose down
   ```

### Comandos úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar um serviço
docker-compose restart backend

# Rebuild após mudanças
docker-compose up --build

# Limpar tudo (volumes, containers, imagens)
docker-compose down -v --rmi all
```

---

## 🔧 Instalação Manual (Alternativa)

Se preferir não usar Docker:

### Pré-requisitos
- Python 3.10+
- Node.js 18+ e npm
- Conta Groq API

### Backend

```bash
cd backend
pip install -r requirements.txt
python data_generator.py
```

Criar arquivo `.env` na raiz:
```
GROQ_API_KEY=sua_chave_aqui
```

Iniciar:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend

Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```

### Acessar

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## 🎯 Testando a Aplicação

Faça perguntas como:
- "Qual foi o gasto total com cloud?"
- "Qual categoria é a mais cara?"
- "Dê um resumo do meu cashflow"
- "Quanto gastamos com Marketing?"

---

## 🔍 Resolução de Problemas

### Docker

| Problema | Solução |
|----------|---------|
| "Cannot connect to Docker daemon" | Verifique se Docker Desktop está rodando |
| Porta em uso | Pare outros containers ou mude as portas no docker-compose.yml |
| Erro de build | Execute `docker-compose down -v` e tente novamente |

### Geral

| Problema | Solução |
|----------|---------|
| "GROQ_API_KEY não configurada" | Verifique o arquivo `.env` na raiz do projeto |
| Chat não responde | Verifique os logs com `docker-compose logs -f` |
| Erro 500 no backend | Verifique se a API key do Groq é válida |
---

**Pronto! Agora você pode usar o CFO Agent! 🎉**
