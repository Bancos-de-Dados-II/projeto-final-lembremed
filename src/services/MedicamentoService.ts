import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { CriarMedicamentoDTO, AtualizarMedicamentoDTO } from '../schemas/medicamentoSchema';

// Configuração do Prisma com o adaptador do Postgres (mesmo padrão do resto do projeto)
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class MedicamentoService {
  // Cria um novo medicamento vinculado a um paciente
  static async criar(dados: CriarMedicamentoDTO) {
    // Garante que o paciente informado realmente existe
    const paciente = await prisma.usuario.findUnique({
      where: { id: dados.pacienteId },
    });

    if (!paciente) {
      throw new Error('Paciente não encontrado no sistema.');
    }

    return prisma.medicamento.create({ data: dados });
  }

  // Lista todos os medicamentos de um paciente específico
  static async listarPorPaciente(pacienteId: string) {
    return prisma.medicamento.findMany({
      where: { pacienteId },
      orderBy: { horario: 'asc' },
    });
  }

  // Busca um único medicamento pelo ID
  static async buscarPorId(id: string) {
    const medicamento = await prisma.medicamento.findUnique({ where: { id } });

    if (!medicamento) {
      throw new Error('Medicamento não encontrado.');
    }

    return medicamento;
  }

  // Atualiza dados de um medicamento existente
  static async atualizar(id: string, dados: AtualizarMedicamentoDTO) {
    await this.buscarPorId(id); // Reaproveita a checagem de existência

    return prisma.medicamento.update({
      where: { id },
      data: dados,
    });
  }

  // Remove um medicamento
  static async deletar(id: string) {
    await this.buscarPorId(id);

    return prisma.medicamento.delete({ where: { id } });
  }
}