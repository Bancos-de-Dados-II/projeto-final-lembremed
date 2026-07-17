import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json()); 

// Rota de Teste para garantir que o servidor está de pé
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API LembreMed rodando perfeitamente! 🚀' });
});

// Middleware Global de Captura de Erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor!' });
});

// Inicialização
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});