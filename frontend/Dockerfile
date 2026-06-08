# Usar uma imagem oficial do Node.js como base
FROM node:18-alpine

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de manifesto de dependências
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante dos arquivos da aplicação
COPY . .

# Expor a porta padrão do frontend (Ex: Vite usa 3000)
EXPOSE 3000

# Comando para rodar o frontend em modo de desenvolvimento
CMD ["npm", "run", "dev"]
