import { Router } from "express";
import { RegistroDoseController } from "../controllers/RegistroDoseController";

const router = Router();
const controller = new RegistroDoseController();

router.get("/registros-dose", (req, res) => controller.listarDoDia(req, res));
router.get("/registros-dose/:id", (req, res) => controller.buscarPorId(req, res));
router.patch("/registros-dose/:id/confirmar", (req, res) => controller.confirmar(req, res));
router.patch("/registros-dose/:id/status", (req, res) => controller.atualizarStatus(req, res));

export default router;