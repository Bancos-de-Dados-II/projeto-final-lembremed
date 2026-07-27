import { Router } from 'express';
import { PontoSaudeMapaController } from '../controllers/PontoSaudeMapaController';
import { verifyToken } from '../middlewares/verifyToken';

const pontoSaudeMapaRoutes = Router();

// Rota PROTEGIDA para cadastrar um novo Ponto de Saúde
pontoSaudeMapaRoutes.post('/', verifyToken, PontoSaudeMapaController.criar);

// Rota PROTEGIDA para listar todos os Pontos de Saúde
pontoSaudeMapaRoutes.get('/', verifyToken, PontoSaudeMapaController.listar);

// Rota PROTEGIDA para buscar um Ponto de Saúde por id
pontoSaudeMapaRoutes.get(
  '/:id',
  verifyToken,
  PontoSaudeMapaController.buscarPorId
);

// Rota PROTEGIDA para atualizar um Ponto de Saúde
pontoSaudeMapaRoutes.put(
  '/:id',
  verifyToken,
  PontoSaudeMapaController.atualizar
);

// Rota PROTEGIDA para deletar um Ponto de Saúde
pontoSaudeMapaRoutes.delete(
  '/:id',
  verifyToken,
  PontoSaudeMapaController.deletar
);

export { pontoSaudeMapaRoutes };