import { Request, Response } from 'express';
import { loginSchema } from '../schemas/usuarioSchema';
import { criarUsuarioSchema } from '../schemas/usuarioSchema';
import { UsuarioService } from '../services/UsuarioService';
import { z } from 'zod';

export class UsuarioController {
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      // 1. O Zod intercepta e valida o que veio do Insomnia/Frontend
      const dadosValidados = criarUsuarioSchema.parse(req.body);

      // 2. Passa os dados limpos para o Service salvar no banco
      const novoUsuario = await UsuarioService.criarUsuario(dadosValidados);

      // 3. Devolve sucesso (Status 201: Created)
      res.status(201).json({
        mensagem: 'Usuário cadastrado com sucesso!',
        usuario: novoUsuario
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ erros_de_validacao: error.issues });
        return;
      }
      
      if (error instanceof Error) {
        res.status(400).json({ erro: error.message });
        return;
      }

      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      // 1. Valida se mandaram e-mail e senha certinhos
      const dadosValidados = loginSchema.parse(req.body);

      // 2. Chama o Service (aquela regra de negócio que você já fez)
      const resultado = await UsuarioService.login(dadosValidados);

      // 3. Devolve 200 (OK) com o Token na tela
      res.status(200).json(resultado);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ erros_de_validacao: error.issues }); 
        return;
      } 
      
      if (error instanceof Error) {
        // Captura o erro de "Credenciais inválidas"
        res.status(401).json({ erro: error.message });
        return;
      }

      // Erro genérico para falhas inesperadas (ex: banco de dados caiu)
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
}