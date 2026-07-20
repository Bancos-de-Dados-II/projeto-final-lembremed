import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { usuarioRoutes } from './routes/usuario.routes';
import { vinculoRoutes } from './routes/vinculo.routes';

// Importando as conexões da infraestrutura poliglota
import conectarMongoDB from './config/mongo';
import { conectarRedis } from './config/redis';

const app = express();

app.use(cors());
app.use(express.json()); 

// --- CONECTANDO AOS BANCOS NÃO-RELACIONAIS ---
conectarMongoDB();
conectarRedis();

// --- CONECTANDO AS ROTAS ---
app.use('/usuarios', usuarioRoutes); // <-- 1. TODA ROTA DE USUÁRIO PASSA POR AQUI
app.use('/vinculos', vinculoRoutes); // <-- 2. TODA ROTA DE VÍNCULO PASSA POR AQUI

// Rota de Teste 
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API LembreMed rodando perfeitamente! 🚀' });
});

// Middleware Global de Captura de Erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor!' });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});