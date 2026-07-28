# 🏥 LembreMed API - Back-end

Esta é a API do LembreMed, construída com **Node.js, Express, TypeScript, Prisma (PostgreSQL) e Zod**.
O projeto usa também **MongoDB** (dados não-estruturados) e **Redis** (cache/snooze adaptativo de lembretes).

## 🚀 Como rodar o projeto na sua máquina

Siga o passo a passo abaixo para baixar as dependências e configurar o ambiente localmente.

### 1. Pré-requisitos
* [Node.js](https://nodejs.org/) instalado (versão 18+ recomendada)
* [PostgreSQL](https://www.postgresql.org/) rodando na sua máquina
* **MongoDB** e **Redis** rodando (mais fácil via Docker, veja abaixo)
* ⚠️ Evite rodar o projeto dentro de pastas sincronizadas (OneDrive, Google Drive), pois isso pode causar erros na geração do Prisma Client

### 2. Instalar as dependências
Abra o terminal na pasta raiz do projeto e baixe todas as bibliotecas necessárias:
```bash
npm install
```

### 3. Subir o MongoDB e o Redis (via Docker)
Se não tiver os dois já instalados/rodando, o jeito mais rápido é subir via Docker:
```bash
docker run -d --name redis-lembremed -p 6379:6379 redis
docker run -d --name mongo-lembremed -p 27017:27017 mongo
```

### 4. Variáveis de Ambiente (.env)
Crie um arquivo chamado `.env` na raiz do projeto. Copie o modelo abaixo e coloque as suas credenciais:

```env
# URL de conexão com o PostgreSQL (usada pelo Prisma Client em runtime)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/lembremed_db?schema=public"

# URL de conexão com o PostgreSQL (usada pelo prisma.config.ts nas migrations)
DIRECT_URL="postgresql://usuario:senha@localhost:5432/lembremed_db?schema=public"

# Chave secreta para o Token JWT (Pode colocar qualquer texto aqui para testes)
JWT_SECRET="sua_chave_secreta_super_segura_aqui"

# Conexão com o Redis (snooze adaptativo de lembretes)
REDIS_URL="redis://localhost:6379"

# Conexão com o MongoDB
MONGO_URI="mongodb://localhost:27017/lembremed"
```

> 💡 Se já tiver outro Postgres/Redis/Mongo rodando nessas portas padrão (ex: de outro projeto em Docker), ajuste a porta na URL (ex: `5433`) e configure o serviço correspondente na mesma porta.

### 5. Rodar as Migrations do Prisma
Para criar as tabelas automaticamente no seu banco de dados, rode:
```bash
npx prisma migrate dev
```
*(Se pedir um nome para a migration, pode digitar "init")*

### 6. Iniciar o Servidor
Para rodar a API em modo de desenvolvimento (reinicia sozinho quando você salva um arquivo):
```bash
npm run dev
```
O servidor estará rodando em `http://localhost:3333`. Se tudo estiver certo, você verá:

Servidor rodando na porta 3333
✅ Conectado ao Redis com sucesso!
✅ Conectado ao MongoDB com sucesso!
✅ Listener de Snooze Adaptativo (Redis) ativo!


---

## 🗂️ Testando as Rotas

Vocês podem usar o Insomnia ou Postman para bater nas rotas da API.

* **Usuários:** CRUD completo em `/usuarios` (POST, GET, PUT, DELETE).
* **Autenticação:** Faça um POST em `/usuarios/login` com e-mail e senha para receber o Token JWT.
* **Vínculos:** Rota protegida em `/vinculos`. Copie o token recebido no login e envie no *Header de Autenticação (Bearer Token)* para criar um vínculo entre Paciente e Cuidador.
* **Medicamentos:** CRUD completo e protegido em `/medicamentos`. Requer `pacienteId` (UUID de um usuário existente) no corpo da requisição ao criar.
* **Receitas Médicas:** CRUD completo e protegido em `/receitas-medicas`.
* **Upload de Arquivos:** rotas de Medicamento e Receita_Medica aceitam upload de foto/PDF (Multer), retornando a URL do arquivo salvo para gravação no banco.

Todas as rotas protegidas exigem o header:

Authorization: Bearer <token recebido no login>


---

## 💻 Front-end

O front-end (Vite + React) fica na pasta `frontend/`.

### Rodando o front

```bash
cd frontend
npm install
```

Crie o `frontend/.env` a partir do `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:3333
```

Depois:
```bash
npm run dev
```
Acesse em `http://localhost:5173`.

> ⚠️ Enquanto a tela de login não está pronta, configure manualmente no `localStorage` do navegador (F12 → Console) o token e o ID do paciente de teste:
> ```javascript
> localStorage.setItem('lembremed_token', 'SEU_TOKEN_AQUI');
> localStorage.setItem('lembremed_paciente_id', 'ID_DO_PACIENTE_AQUI');
> ```

### Telas disponíveis
* **Meus Remédios** — visão do paciente, com os horários do dia e confirmação de doses.
* **Dashboard** — painel administrativo (Médico/Cuidador), com a grade horária dos medicamentos e um gráfico de adesão ao tratamento dos últimos 7 dias.