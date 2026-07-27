import { Request, Response } from "express";
import { z } from "zod";
import { RegistroDoseService } from "../services/RegistroDoseService";

const service = new RegistroDoseService();

const statusSchema = z.object({
  status: z.enum(["PENDENTE", "TOMADO", "ATRASADO"]),
});

export class RegistroDoseController {
  async listarDoDia(req: Request, res: Response) {
    const { pacienteId, data } = req.query;

    if (!pacienteId || !data) {
      return res.status(400).json({ erro: "pacienteId e data são obrigatórios" });
    }

    const registros = await service.listarOuGerarDoDia(
      String(pacienteId),
      String(data)
    );
    return res.json(registros);
  }

  async buscarPorId(req: Request, res: Response) {
    const { id } = req.params;
    const registro = await service.buscarPorId(id);

    if (!registro) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }
    return res.json(registro);
  }

  async confirmar(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const registro = await service.confirmarDose(id);
      return res.json(registro);
    } catch {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    const { id } = req.params;
    const parsed = statusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ erro: parsed.error.flatten() });
    }

    const registro = await service.atualizarStatus(id, parsed.data.status);
    return res.json(registro);
  }
}