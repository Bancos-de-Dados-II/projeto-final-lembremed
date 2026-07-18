import { Request, Response } from 'express';
import { z } from 'zod';
import { criarVinculoSchema } from '../schemas/vinculoSchema';
import { VinculoService } from '../services/VinculoService';

export class VinculoController {
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      // 1. Passa o body da requisição pela validação rigorosa do Zod
      const dadosValidados = criarVinculoSchema.parse(req.body);

      // 2. Envia os dados limpos e validados para o Service fazer o trabalho pesado
      const vinculo = await VinculoService.criarVinculo(dadosValidados);

      // 3. Devolve a resposta de sucesso com status 201 (Created)
      res.status(201).json({
        mensagem: 'Vínculo criado com sucesso!',
        vinculo
      });

    } catch (error) {
      // Tratamento de erros: Se for erro do Zod (ex: não é um UUID válido)
      if (error instanceof z.ZodError) {
        res.status(400).json({ erros_de_validacao: error.issues });
        return;
      }
      // Tratamento de erros: Se for erro do nosso Service (ex: Paciente não existe)
      if (error instanceof Error) {
        res.status(404).json({ erro: error.message });
        return;
      }
      // Qualquer outro erro inesperado do servidor
      res.status(500).json({ erro: 'Erro interno ao criar vínculo.' });
    }
  }
}