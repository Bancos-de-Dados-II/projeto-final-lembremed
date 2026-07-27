import { Router } from 'express';
import { MedicamentoController } from '../controllers/MedicamentoController';
import { verifyToken } from '../middlewares/verifyToken';

const medicamentoRoutes = Router();

// Todas as rotas de medicamento são protegidas (precisa estar logado)
medicamentoRoutes.post('/', verifyToken, MedicamentoController.criar);
medicamentoRoutes.get('/', verifyToken, MedicamentoController.listar);
medicamentoRoutes.get('/:id', verifyToken, MedicamentoController.buscarPorId);
medicamentoRoutes.put('/:id', verifyToken, MedicamentoController.atualizar);
medicamentoRoutes.delete('/:id', verifyToken, MedicamentoController.deletar);

export { medicamentoRoutes };