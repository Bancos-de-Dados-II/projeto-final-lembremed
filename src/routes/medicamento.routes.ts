import { Router } from 'express';
import { MedicamentoController } from '../controllers/MedicamentoController';
import { verifyToken } from '../middlewares/verifyToken';
import { upload } from '../config/multer';

const medicamentoRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Medicamentos
 *   description: Cadastro e gerenciamento de medicamentos do paciente.
 * /medicamentos:
 *   post:
 *     summary: Cadastra um novo medicamento com upload opcional de foto
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [pacienteId, nome, horario]
 *             properties:
 *               pacienteId:
 *                 type: string
 *                 format: uuid
 *               nome:
 *                 type: string
 *               dosagem:
 *                 type: string
 *               horario:
 *                 type: string
 *                 example: '08:00'
 *               frequencia:
 *                 type: string
 *                 enum: [DIARIA, SEMANAL]
 *               dias_semana:
 *                 type: string
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Medicamento cadastrado com sucesso.
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Token ausente ou inválido.
 *   get:
 *     summary: Lista os medicamentos de um paciente
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de medicamentos.
 *       400:
 *         description: Parâmetro pacienteId obrigatório.
 *       401:
 *         description: Token ausente ou inválido.
 * /medicamentos/{id}:
 *   get:
 *     summary: Busca um medicamento pelo ID
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento encontrado.
 *       404:
 *         description: Medicamento não encontrado.
 *   put:
 *     summary: Atualiza um medicamento pelo ID
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicamentoAtualizacao'
 *     responses:
 *       200:
 *         description: Medicamento atualizado com sucesso.
 *       400:
 *         description: Erro de validação.
 *       404:
 *         description: Medicamento não encontrado.
 *   delete:
 *     summary: Remove um medicamento pelo ID
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento deletado com sucesso.
 *       404:
 *         description: Medicamento não encontrado.
 */

// Todas as rotas de medicamento são protegidas (precisa estar logado)
medicamentoRoutes.post('/', verifyToken, upload.single('foto'), MedicamentoController.criar);
medicamentoRoutes.get('/', verifyToken, MedicamentoController.listar);
medicamentoRoutes.get('/:id', verifyToken, MedicamentoController.buscarPorId);
medicamentoRoutes.put('/:id', verifyToken, MedicamentoController.atualizar);
medicamentoRoutes.delete('/:id', verifyToken, MedicamentoController.deletar);

export { medicamentoRoutes };