import { Router } from 'express';
import { VinculoController } from '../controllers/VinculoController';
import { verifyToken } from '../middlewares/verifyToken';

const vinculoRoutes = Router();

// Rota PROTEGIDA: Só quem tem o Token (fez login) pode criar o vínculo
vinculoRoutes.post('/', verifyToken, VinculoController.criar);

export { vinculoRoutes };