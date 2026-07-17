import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares globais básicos
app.use(cors());
app.use(express.json());

// Rota de teste para garantir que tudo está funcionando
app.get('/', (req, res) => {
  res.json({ 
    status: 'sucesso',
    message: '🚀 LembreMed API está rodando perfeitamente!' 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});