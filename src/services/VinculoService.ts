import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Configuração do Prisma com o adaptador do Postgres
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class VinculoService {
  static async criarVinculo(dados: { pacienteId: string; cuidadorId: string }) {
    // 1. Busca os dois usuários no banco para garantir que existem
    const paciente = await prisma.usuario.findUnique({
      where: { id: dados.pacienteId }
    });

    const cuidador = await prisma.usuario.findUnique({
      where: { id: dados.cuidadorId }
    });

    // Se um dos dois não existir, trava a operação aqui
    if (!paciente || !cuidador) {
      throw new Error('Paciente ou Cuidador não encontrado no sistema.');
    }

    // Verifica se a dupla já tem um vínculo criado
    const vinculoExistente = await prisma.vinculo_Cuidado.findFirst({
      where: {
        pacienteId: dados.pacienteId,
        cuidadorId: dados.cuidadorId
      }
    });

    if (vinculoExistente) {
      throw new Error('Este vínculo já existe no sistema.');
    }

    // 2. Cria a ligação na tabela Vinculo_Cuidado
    // regra @@unique, o Prisma não vai deixar criar dois vínculos iguais
    const novoVinculo = await prisma.vinculo_Cuidado.create({
      data: {
        pacienteId: dados.pacienteId,
        cuidadorId: dados.cuidadorId,
        status: 'PENDENTE' // Status inicial 
      }
    });

    return novoVinculo;
  }
}