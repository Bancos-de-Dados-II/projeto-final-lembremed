# 🏥 LembreMed API - Back-end

Esta é a API do LembreMed, construída com **Node.js, Express, TypeScript, Prisma (PostgreSQL) e Zod**. 
Esta base inicial já contém a estrutura de pastas, configuração de banco de dados, JWT e o CRUD de Usuários/Vínculos.

## 🚀 Como rodar o projeto na sua máquina

Siga o passo a passo abaixo para baixar as dependências e configurar o ambiente localmente.

### 1. Pré-requisitos
* [Node.js](https://nodejs.org/) instalado (versão 18+ recomendada)
* [PostgreSQL](https://www.postgresql.org/) rodando na sua máquina

### 2. Instalar as dependências
Abra o terminal na pasta raiz do projeto e baixe todas as bibliotecas necessárias:
\`\`\`bash
npm install
\`\`\`

### 3. Variáveis de Ambiente (.env)
Crie um arquivo chamado \`.env\` na raiz do projeto. Copie o modelo abaixo e coloque as suas credenciais do banco:

\`\`\`env
# URL de conexão com o PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/lembremed_db?schema=public"

# Chave secreta para o Token JWT (Pode colocar qualquer texto aqui para testes)
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
\`\`\`

### 4. Rodar as Migrations do Prisma
Para criar as tabelas automaticamente no seu banco de dados, rode:
\`\`\`bash
npx prisma migrate dev
\`\`\`
*(Se pedir um nome para a migration, pode digitar "init")*

### 5. Iniciar o Servidor
Para rodar a API em modo de desenvolvimento (reinicia sozinho quando você salva um arquivo):
\`\`\`bash
npx tsx watch src/server.ts
\`\`\`
O servidor estará rodando em \`http://localhost:3333\`.

---

## 🗂️ Testando as Rotas

Vocês podem usar o Insomnia ou Postman para bater nas rotas da API.

* **Usuários:** CRUD completo em \`/usuarios\` (POST, GET, PUT, DELETE).
* **Autenticação:** Faça um POST em \`/login\` com e-mail e senha para receber o Token JWT.
* **Vínculos:** Rota protegida em \`/vinculos\`. Copie o token recebido no login e envie no *Header de Autenticação (Bearer Token)* para criar um vínculo entre Paciente e Cuidador.