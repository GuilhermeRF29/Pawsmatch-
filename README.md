# Paws & Match 🐾

> O Tinder da adoção responsável: Conectando corações solitários a patas necessitadas.

---

## 📌 O Problema que Resolvemos

A superlotação de abrigos e o abandono de animais são problemas críticos na sociedade atual. Muitas vezes, potenciais adotantes desistem do processo por acharem burocrático ou por não encontrarem um pet que se encaixe no seu estilo de vida.

O **Paws & Match** resolve isso gamificando a adoção: através de uma interface intuitiva estilo **"swipe"**, facilitamos o encontro ideal (**match**) entre humanos e animais. Além disso, incluímos um chat inteligente onde o adotante pode interagir com a inteligência artificial do pet antes da visita física, criando um vínculo emocional antecipado e promovendo a adoção consciente.

---

## 🚀 Funcionalidades

* **Feed Interativo (Swipe):** Sistema de cards deslizáveis para dar "Like" ou "Dislike" nos pets disponíveis.
* **Cadastro e Login Seguros:** Autenticação completa de usuários (adotantes e ONGs/doadores) com senhas criptografadas.
* **Painel do Doador:** Ferramenta para ONGs e protetores cadastrarem novos animais rapidamente no sistema.
* **Chat com IA:** Integração com o Google Gemini, permitindo que o usuário "converse" com o pet (a IA assume a personalidade do animal com base em sua bio e características).
* **Filtros de Busca:** Filtre os pets por espécie (cachorro/gato), porte ou sexo.

---

## 🛠️ Stack Tecnológica

O projeto é uma aplicação **Full-Stack** construída para resolver problemas reais com tecnologias modernas.

### Front-end

* HTML5 Semântico
* CSS Responsivo (Mobile-first)
* React.js + Vite
* Tailwind CSS
* Framer Motion

### Back-end & Segurança

* Node.js
* Express
* bcryptjs (hash de senhas)
* express-validator (validação server-side)
* helmet
* express-rate-limit

### Banco de Dados

* MySQL
* mysql2
* Queries parametrizadas com placeholders `?`
* Proteção contra SQL Injection

### Infraestrutura

* Docker
* Docker Compose

---

## 📂 Estrutura do Projeto

```text
/
├── server.ts          # Servidor Back-end (Express, Rotas da API, Segurança e IA)
├── schema.sql         # Script SQL oficial de criação das tabelas do banco
├── migrate.ts         # Script TypeScript automatizado para migração do DB
├── docker-compose.yml # Configuração dos containers (App + MySQL)
├── src/
│   ├── App.tsx        # Componente principal e rotas do Front-end (React)
│   ├── components/    # Componentes modulares (SwipeCard, Filters, etc)
│   ├── index.css      # Estilos globais Tailwind
│   └── types.ts       # Tipagens globais do sistema
├── .env.example       # Exemplo seguro das variáveis de ambiente exigidas
└── package.json       # Dependências e atalhos de script do projeto
```

---

## ▶️ Executar Localmente

Para facilitar o desenvolvimento e garantir que o projeto rode exatamente da mesma forma em qualquer máquina, utilizamos Docker.

### 1. Clone o Repositório

```bash
git clone https://github.com/GuilhermeRF29/Pawsmatch-
cd Pawsmatch-
```

### 2. Configure as Variáveis de Ambiente

Faça uma cópia do arquivo `.env.example` e renomeie para `.env`.

```bash
cp .env.example .env
```

Preencha as variáveis com:

* Credenciais do banco de dados
* API Key do Google Gemini

Exemplo:

```env
# Banco de dados
MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=petmatch

# Backend (Conexão usando o HOST "db" em vez de localhost)
DATABASE_URL="mysql://root:123456@db:3306/petmatch"
JWT_SECRET="YKdTuh6NyB6ykV35hd1Dfz2AoORapgPqIU9KSCaArtD"

# Frontend
VITE_API_URL="http://localhost:3001"

```

### 3. Suba os Containers

Certifique-se de que o Docker Desktop está em execução.

```bash
docker-compose up -d
```

Esse comando irá:

* Baixar as imagens necessárias
* Criar o banco de dados MySQL
* Executar as migrações (`npm run db:migrate`)
* Iniciar a aplicação automaticamente

### 4. Acesse o Projeto

A aplicação estará disponível em:

```text
http://localhost:3000
```

---

### Banco de Dados

MySQL hospedado na nuvem pública via Railway.

---

## 👨‍💻 Equipe

Conforme as diretrizes do projeto de Engenharia da Computação, a equipe dividiu as responsabilidades para garantir que todos contribuíssem ativamente no repositório.

### Guilherme Rodrigues

**Líder Técnico & Full-Stack Developer**

Responsável pela arquitetura do Back-end (Express), integração com a API do Gemini e estruturação dos componentes dinâmicos do React.

### Integrante 2 (Guilherme Souza)

**Dev Front-end & UX/UI**

Responsável pelo HTML5 Semântico, estilização mobile-first com Tailwind CSS, animações do swipe e validações de formulário via JavaScript no cliente.

### Integrante 3 (Bernardo Affonso)

**DBA & Data Engineer**

Responsável pela modelagem do banco MySQL (mínimo de 3 tabelas relacionadas com JOINs), criação do script oficial de migração (`npm run db:migrate`) e queries seguras.

### Integrante 4 (Daniel Barbosa Alves)

**Dev Back-end & Security Specialist**

Responsável pelas rotas, validações server-side com express-validator, implementação de sessões/cookies e segurança com bcryptjs, helmet e express-rate-limit.

### Integrante 5 (Isabela Tessarin)

**DevOps & Quality Assurance**

Responsável pela containerização do projeto com Docker, configuração do docker-compose.yml, ambiente de deploy no Render/Railway e testes de responsividade.

---

## 📄 Licença

Este projeto é de cunho acadêmico e de código aberto sob a licença MIT.

Sinta-se livre para usar, estudar e modificar o código para fins educacionais e de aprendizado.

---

## ❤️ Missão

Nosso objetivo é utilizar a tecnologia para reduzir o abandono animal e incentivar a adoção responsável, conectando pessoas e pets através de uma experiência moderna, intuitiva e emocionalmente significativa.

**Porque todo pet merece um lar. 🐶🐱**
