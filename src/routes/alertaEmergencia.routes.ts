import { Router } from 'express';
import { AlertaEmergenciaController } from '../controllers/AlertaEmergenciaController';
import { verifyToken } from '../middlewares/verifyToken';

const alertaEmergenciaRoutes = Router();

// Rota PROTEGIDA para registrar um novo Alerta de Emergência
alertaEmergenciaRoutes.post(
  '/',
  verifyToken,
  AlertaEmergenciaController.criar
);

// Rota PROTEGIDA para listar todos os Alertas de Emergência
alertaEmergenciaRoutes.get(
  '/',
  verifyToken,
  AlertaEmergenciaController.listar
);

// Rota PROTEGIDA para buscar um Alerta de Emergência por id
alertaEmergenciaRoutes.get(
  '/:id',
  verifyToken,
  AlertaEmergenciaController.buscarPorId
);

// Rota PROTEGIDA para atualizar um Alerta de Emergência
alertaEmergenciaRoutes.put(
  '/:id',
  verifyToken,
  AlertaEmergenciaController.atualizar
);

// Rota PROTEGIDA para deletar um Alerta de Emergência
alertaEmergenciaRoutes.delete(
  '/:id',
  verifyToken,
  AlertaEmergenciaController.deletar
);

export { alertaEmergenciaRoutes };