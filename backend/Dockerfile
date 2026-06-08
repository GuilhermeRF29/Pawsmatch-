# Usar uma imagem oficial do Node.js como base
FROM node:18-alpine

# Instalar dependências necessárias para o Prisma funcionar no Alpine
RUN apk add --no-cache openssl

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de manifesto de dependências
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante dos arquivos da aplicação
COPY . .

# Expor a porta que o backend utiliza
EXPOSE 3001

# Comando padrão (será sobrescrito pelo Docker Compose em desenvolvimento)
CMD ["npm", "run", "dev"]
