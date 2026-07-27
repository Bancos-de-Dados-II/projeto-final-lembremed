import { Request, Response } from 'express';
import { z } from 'zod';
import { criarMedicamentoSchema, atualizarMedicamentoSchema } from '../schemas/medicamentoSchema';
import { MedicamentoService } from '../services/MedicamentoService';

export class MedicamentoController {
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      const dadosValidados = criarMedicamentoSchema.parse(req.body);
      const novoMedicamento = await MedicamentoService.criar(dadosValidados);

      res.status(201).json({
        mensagem: 'Medicamento cadastrado com sucesso!',
        medicamento: novoMedicamento,
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

      const medicamentos = await MedicamentoService.listarPorPaciente(String(pacienteId));
      res.status(200).json(medicamentos);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar medicamentos.' });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const medicamento = await MedicamentoService.buscarPorId(id);
      res.status(200).json(medicamento);
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
      const dadosValidados = atualizarMedicamentoSchema.parse(req.body);

      const medicamentoAtualizado = await MedicamentoService.atualizar(id, dadosValidados);

      res.status(200).json({
        mensagem: 'Medicamento atualizado com sucesso!',
        medicamento: medicamentoAtualizado,
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
      res.status(500).json({ erro: 'Erro interno ao atualizar medicamento.' });
    }
  }

  static async deletar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await MedicamentoService.deletar(id);
      res.status(200).json({ mensagem: 'Medicamento deletado com sucesso!' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }
      res.status(500).json({ erro: 'Erro interno ao deletar medicamento.' });
    }
  }
}