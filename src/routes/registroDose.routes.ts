import { Router } from "express";
import { RegistroDoseController } from "../controllers/RegistroDoseController";

const router = Router();
const controller = new RegistroDoseController();

/**
 * @swagger
 * tags:
 *   name: Registros de Dose
 *   description: Consulta e atualização dos registros diários de dose.
 * /registros-dose:
 *   get:
 *     summary: Lista ou gera os registros de dose do dia
 *     tags: [Registros de Dose]
 *     parameters:
 *       - in: query
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           example: '2026-08-06'
 *     responses:
 *       200:
 *         description: Lista de registros de dose.
 *       400:
 *         description: pacienteId e data são obrigatórios.
 * /registros-dose/{id}:
 *   get:
 *     summary: Busca um registro de dose pelo ID
 *     tags: [Registros de Dose]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro encontrado.
 *       404:
 *         description: Registro não encontrado.
 * /registros-dose/{id}/confirmar:
 *   patch:
 *     summary: Confirma a tomada da dose
 *     tags: [Registros de Dose]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dose confirmada com sucesso.
 *       404:
 *         description: Registro não encontrado.
 * /registros-dose/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um registro de dose
 *     tags: [Registros de Dose]
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
 *             $ref: '#/components/schemas/RegistroDoseStatusRequest'
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso.
 *       400:
 *         description: Corpo inválido.
 *       404:
 *         description: Registro não encontrado.
 */

router.get("/registros-dose", (req, res) => controller.listarDoDia(req, res));
router.get("/registros-dose/:id", (req, res) => controller.buscarPorId(req, res));
router.patch("/registros-dose/:id/confirmar", (req, res) => controller.confirmar(req, res));
router.patch("/registros-dose/:id/status", (req, res) => controller.atualizarStatus(req, res));

export default router;