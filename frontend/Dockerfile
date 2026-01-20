# Frontend Dockerfile - Next.js
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json package-lock.json* ./
RUN npm install

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 3000

# Variável de ambiente para conectar ao backend
ENV FASTAPI_URL=http://backend:8000

# Comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]
