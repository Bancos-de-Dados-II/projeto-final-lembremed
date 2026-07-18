import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao_lembremed_123';

// Estendemos a interface do Express para guardar os dados do usuário logado
export interface AuthRequest extends Request {
  usuario?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    return;
  }

  const [, token] = authHeader.split(' ');

  try {
    // Tenta abrir o token com a chave secreta
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // Salva os dados na requisição para o Controller usar
    next(); // Libera a catraca, a requisição pode continuar
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};