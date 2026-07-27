import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { CriarReceitaMedicaDTO, AtualizarReceitaMedicaDTO } from '../schemas/receitaMedicaSchema';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class ReceitaMedicaService {
  static async criar(dados: CriarReceitaMedicaDTO) {
    const paciente = await prisma.usuario.findUnique({ where: { id: dados.pacienteId } });
    if (!paciente) {
      throw new Error('Paciente não encontrado no sistema.');
    }

    const medico = await prisma.usuario.findUnique({ where: { id: dados.medicoId } });
    if (!medico) {
      throw new Error('Médico não encontrado no sistema.');
    }

    return prisma.receita_Medica.create({ data: dados });
  }

  static async listarPorPaciente(pacienteId: string) {
    return prisma.receita_Medica.findMany({
      where: { pacienteId },
      orderBy: { dataEmissao: 'desc' },
    });
  }

  static async buscarPorId(id: string) {
    const receita = await prisma.receita_Medica.findUnique({ where: { id } });
    if (!receita) {
      throw new Error('Receita médica não encontrada.');
    }
    return receita;
  }

  static async atualizar(id: string, dados: AtualizarReceitaMedicaDTO) {
    await this.buscarPorId(id);
    return prisma.receita_Medica.update({ where: { id }, data: dados });
  }

  static async deletar(id: string) {
    await this.buscarPorId(id);
    return prisma.receita_Medica.delete({ where: { id } });
  }
}