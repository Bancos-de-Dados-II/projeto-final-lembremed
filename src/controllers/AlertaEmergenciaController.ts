import { Request, Response } from 'express';
import { z } from 'zod';
import {
  criarAlertaEmergenciaSchema,
  atualizarAlertaEmergenciaSchema,
} from '../schemas/alertaEmergenciaSchema';
import { AlertaEmergenciaService } from '../services/AlertaEmergenciaService';

export class AlertaEmergenciaController {
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      // 1. O Zod intercepta e valida o que veio do Insomnia/Frontend
      const dadosValidados = criarAlertaEmergenciaSchema.parse(req.body);

      // 2. Passa os dados limpos para o Service salvar no banco
      const novoAlerta = await AlertaEmergenciaService.criarAlertaEmergencia(
        dadosValidados
      );

      // 3. Devolve sucesso (Status 201: Created)
      res.status(201).json({
        mensagem: 'Alerta de Emergência registrado com sucesso!',
        alertaEmergencia: novoAlerta,
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
      const alertas = await AlertaEmergenciaService.listarAlertasEmergencia();
      res.status(200).json(alertas);
    } catch (error) {
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const alerta = await AlertaEmergenciaService.buscarAlertaEmergenciaPorId(
        id
      );

      res.status(200).json(alerta);
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

      const dadosValidados = atualizarAlertaEmergenciaSchema.parse(req.body);

      const alertaAtualizado =
        await AlertaEmergenciaService.atualizarAlertaEmergencia(
          id,
          dadosValidados
        );

      res.status(200).json({
        mensagem: 'Alerta de Emergência atualizado com sucesso!',
        alertaEmergencia: alertaAtualizado,
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

      await AlertaEmergenciaService.deletarAlertaEmergencia(id);

      res
        .status(200)
        .json({ mensagem: 'Alerta de Emergência deletado com sucesso!' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }

      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }
}