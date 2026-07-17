import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Puxa a chave secreta do .env (ou usa um fallback de segurança)
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao_lembremed_123';

export class AuthService {
  // 1. Criptografa a senha antes de salvar no banco
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // 2. Compara a senha digitada no login com a do banco
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // 3. Gera o Token JWT com o ID e o Papel do usuário
  static generateToken(userId: string, papel: string): string {
    return jwt.sign({ id: userId, papel }, JWT_SECRET, {
      expiresIn: '1d', // O token expira em 1 dia
    });
  }
}