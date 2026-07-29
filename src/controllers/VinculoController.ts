import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export class VinculoController {
  
  static async criar(req: Request, res: Response) {
    try {
      // 🚀 AQUI ESTÁ A CORREÇÃO: Buscando de req.usuario.id
      const cuidadorId = (req as any).usuario?.id; 
      
      if (!cuidadorId) {
        return res.status(401).json({ erro: "ID do cuidador não encontrado no token. Verifique o middleware!" });
      }

      const { emailPaciente } = req.body;

      if (!emailPaciente) {
        return res.status(400).json({ erro: "O e-mail do paciente é obrigatório." });
      }

      const paciente = await prisma.usuario.findUnique({
        where: { email: emailPaciente }
      });

      if (!paciente || paciente.papel !== 'PACIENTE') {
        return res.status(404).json({ erro: "Paciente não encontrado." });
      }

      const novoVinculo = await prisma.vinculo_Cuidado.create({
        data: {
          status: 'ACEITO', 
          nivel_acesso: 'TOTAL',
          cuidador: {
            connect: { id: cuidadorId }
          },
          paciente: {
            connect: { id: paciente.id }
          }
        }
      });

      return res.status(201).json({
        mensagem: "Paciente vinculado com sucesso!",
        vinculo: novoVinculo
      });

    } catch (error: any) {
      console.error("ERRO AO CRIAR VÍNCULO:", error);

      if (error.code === 'P2002') {
        return res.status(400).json({ erro: "Este paciente já está vinculado a você." });
      }
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  }

  static async listarPacientes(req: Request, res: Response) {
    try {
      // 🚀 AQUI TAMBÉM: Buscando de req.usuario.id para a listagem funcionar amanhã
      const cuidadorId = (req as any).usuario?.id;

      const vinculos = await prisma.vinculo_Cuidado.findMany({
        where: { cuidadorId: cuidadorId },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              _count: {
                select: { medicamentos: true }
              }
            }
          }
        }
      });

      const pacientes = vinculos.map((v: any) => ({
        id: v.paciente.id,
        nome: v.paciente.nome,
        email: v.paciente.email,
        telefone: v.paciente.telefone,
        quantidadeMedicamentos: v.paciente._count.medicamentos
      }));

      return res.json(pacientes);

    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar pacientes vinculados." });
    }
  }

  static async desvincular(req: Request, res: Response) {
  try {
    const cuidadorId = (req as any).usuario?.id;
    const pacienteId = req.params.pacienteId as string;

    if (!cuidadorId) {
      return res.status(401).json({
        erro: "Usuário não autenticado."
      });
    }

    const vinculo = await prisma.vinculo_Cuidado.findFirst({
      where: {
        cuidadorId,
        pacienteId
      }
    });

    if (!vinculo) {
      return res.status(404).json({
        erro: "Vínculo não encontrado."
      });
    }

    await prisma.vinculo_Cuidado.delete({
      where: {
        id: vinculo.id
      }
    });

    return res.status(200).json({
      mensagem: "Paciente removido com sucesso."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: "Erro ao remover paciente."
    });
  }
}
}