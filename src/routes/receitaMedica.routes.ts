import { Router } from 'express';
import { ReceitaMedicaController } from '../controllers/ReceitaMedicaController';
import { verifyToken } from '../middlewares/verifyToken';
import { upload } from '../config/multer';

const receitaMedicaRoutes = Router();

receitaMedicaRoutes.post('/', verifyToken, upload.single('arquivo'), ReceitaMedicaController.criar);
receitaMedicaRoutes.get('/', verifyToken, ReceitaMedicaController.listar);
receitaMedicaRoutes.get('/:id', verifyToken, ReceitaMedicaController.buscarPorId);
receitaMedicaRoutes.put('/:id', verifyToken, ReceitaMedicaController.atualizar);
receitaMedicaRoutes.delete('/:id', verifyToken, ReceitaMedicaController.deletar);

export { receitaMedicaRoutes };