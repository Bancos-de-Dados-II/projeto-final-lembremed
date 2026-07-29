import { Router } from 'express';
import { VinculoController } from '../controllers/VinculoController';
import { verifyToken } from '../middlewares/verifyToken';

const vinculoRoutes = Router();

// Rota POST: O Cuidador usa para adicionar o paciente pelo e-mail
vinculoRoutes.post('/', verifyToken, VinculoController.criar);

// Rota GET: O Cuidador usa para carregar a tela com os cartões
vinculoRoutes.get('/meus-pacientes', verifyToken, VinculoController.listarPacientes);

vinculoRoutes.delete('/:pacienteId', verifyToken, VinculoController.desvincular);
export { vinculoRoutes };