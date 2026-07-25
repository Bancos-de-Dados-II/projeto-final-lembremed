import { Request, Response } from 'express';
import { z } from 'zod';
import {
  criarPontoSaudeMapaSchema,
  atualizarPontoSaudeMapaSchema,
} from '../schemas/pontoSaudeMapaSchema';
import { PontoSaudeMapaService } from '../services/PontoSaudeMapaService';

export class PontoSaudeMapaController {
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      // 1. O Zod intercepta e valida o que veio do Insomnia/Frontend
      const dadosValidados = criarPontoSaudeMapaSchema.parse(req.body);

      // 2. Passa os dados limpos para o Service salvar no banco
      const novoPonto = await PontoSaudeMapaService.criarPontoSaudeMapa(
        dadosValidados
      );

      // 3. Devolve sucesso (Status 201: Created)
      res.status(201).json({
        mensagem: 'Ponto de Saúde cadastrado com sucesso!',
        pontoSaudeMapa: novoPonto,
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

      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const pontos = await PontoSaudeMapaService.listarPontosSaudeMapa();
      res.status(200).json(pontos);
    } catch (error) {
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const ponto = await PontoSaudeMapaService.buscarPontoSaudeMapaPorId(id);

      res.status(200).json(ponto);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }

      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const dadosValidados = atualizarPontoSaudeMapaSchema.parse(req.body);

      const pontoAtualizado = await PontoSaudeMapaService.atualizarPontoSaudeMapa(
        id,
        dadosValidados
      );

      res.status(200).json({
        mensagem: 'Ponto de Saúde atualizado com sucesso!',
        pontoSaudeMapa: pontoAtualizado,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ erros_de_validacao: error.issues });
        return;
      }

      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }

      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }

  static async deletar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      await PontoSaudeMapaService.deletarPontoSaudeMapa(id);

      res.status(200).json({ mensagem: 'Ponto de Saúde deletado com sucesso!' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }

      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }
}