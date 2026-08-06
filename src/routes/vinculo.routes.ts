import { Router } from 'express';
import { VinculoController } from '../controllers/VinculoController';
import { verifyToken } from '../middlewares/verifyToken';

const vinculoRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Vínculos
 *   description: Associação de cuidadores aos pacientes.
 * /vinculos:
 *   post:
 *     summary: Vincula um paciente ao cuidador logado
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VinculoCriacao'
 *     responses:
 *       201:
 *         description: Paciente vinculado com sucesso.
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Paciente não encontrado.
 * /vinculos/meus-pacientes:
 *   get:
 *     summary: Lista os pacientes vinculados ao cuidador logado
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes vinculados.
 *       401:
 *         description: Usuário não autenticado.
 * /vinculos/{pacienteId}:
 *   delete:
 *     summary: Remove o vínculo com um paciente
 *     tags: [Vínculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vínculo removido com sucesso.
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Vínculo não encontrado.
 */

// Rota POST: O Cuidador usa para adicionar o paciente pelo e-mail
vinculoRoutes.post('/', verifyToken, VinculoController.criar);

// Rota GET: O Cuidador usa para carregar a tela com os cartões
vinculoRoutes.get('/meus-pacientes', verifyToken, VinculoController.listarPacientes);

vinculoRoutes.delete('/:pacienteId', verifyToken, VinculoController.desvincular);
export { vinculoRoutes };