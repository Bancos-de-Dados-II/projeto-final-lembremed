import { Request, Response } from 'express';
import { z } from 'zod';
import { criarReceitaMedicaSchema, atualizarReceitaMedicaSchema } from '../schemas/receitaMedicaSchema';
import { ReceitaMedicaService } from '../services/ReceitaMedicaService';

export class ReceitaMedicaController {
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      const arquivo_url = req.file
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        : undefined;

      const dadosValidados = criarReceitaMedicaSchema.parse({
        ...req.body,
        arquivo_url,
      });

      const novaReceita = await ReceitaMedicaService.criar(dadosValidados);

      res.status(201).json({
        mensagem: 'Receita médica cadastrada com sucesso!',
        receita: novaReceita,
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

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const { pacienteId } = req.query;
      if (!pacienteId) {
        res.status(400).json({ erro: 'O parâmetro pacienteId é obrigatório.' });
        return;
      }

      const receitas = await ReceitaMedicaService.listarPorPaciente(String(pacienteId));
      res.status(200).json(receitas);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar receitas médicas.' });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const receita = await ReceitaMedicaService.buscarPorId(id);
      res.status(200).json(receita);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const dadosValidados = atualizarReceitaMedicaSchema.parse(req.body);
      const receitaAtualizada = await ReceitaMedicaService.atualizar(id, dadosValidados);

      res.status(200).json({
        mensagem: 'Receita médica atualizada com sucesso!',
        receita: receitaAtualizada,
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
      res.status(500).json({ erro: 'Erro interno ao atualizar receita médica.' });
    }
  }

  static async deletar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await ReceitaMedicaService.deletar(id);
      res.status(200).json({ mensagem: 'Receita médica deletada com sucesso!' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }
      res.status(500).json({ erro: 'Erro interno ao deletar receita médica.' });
    }
  }
}