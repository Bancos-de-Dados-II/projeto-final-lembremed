import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectMongo } from './config/mongo';
import { connectRedis } from './config/redis';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🚀 LembreMed API rodando com 3 bancos de dados!' });
});

// Inicializando o servidor e conectando aos bancos NoSQL
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // O Prisma se conecta sozinho na primeira query, mas o Mongo e Redis precisam ser chamados
  await connectMongo();
  await connectRedis();
});