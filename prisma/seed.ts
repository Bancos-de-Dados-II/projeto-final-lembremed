import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;

async function hash(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

async function main() {
  console.log('Iniciando seed do LembreMed...');

  // Ordem respeita as FKs: Medicamento depende de Usuario
  await prisma.medicamento.deleteMany();
  await prisma.vinculo_Cuidado.deleteMany();
  await prisma.usuario.deleteMany();

  // ===== MÉDICOS =====
  const medico1 = await prisma.usuario.create({
    data: {
      nome: 'Dra. Ana Beatriz Ferreira',
      email: 'ana.ferreira@lembremed.com',
      senha: await hash('Medico@123'),
      papel: 'MEDICO',
    },
  });

  const medico2 = await prisma.usuario.create({
    data: {
      nome: 'Dr. Carlos Eduardo Lima',
      email: 'carlos.lima@lembremed.com',
      senha: await hash('Medico@123'),
      papel: 'MEDICO',
    },
  });

  // ===== CUIDADORES =====
  const cuidador1 = await prisma.usuario.create({
    data: {
      nome: 'Juliana Alves',
      email: 'juliana.alves@lembremed.com',
      senha: await hash('Cuidador@123'),
      papel: 'CUIDADOR',
      telefone: '(83) 99111-2233',
    },
  });

  const cuidador2 = await prisma.usuario.create({
    data: {
      nome: 'Roberto Nascimento',
      email: 'roberto.nascimento@lembremed.com',
      senha: await hash('Cuidador@123'),
      papel: 'CUIDADOR',
      telefone: '(83) 99222-3344',
    },
  });

  // ===== IDOSOS (PACIENTES) =====
  const idoso1 = await prisma.usuario.create({
    data: {
      nome: 'Maria da Conceição Souza',
      email: 'maria.souza@lembremed.com',
      senha: await hash('Idoso@123'),
      papel: 'PACIENTE',
      latitude_atual: -6.8895,
      longitude_atual: -38.5586,
    },
  });

  const idoso2 = await prisma.usuario.create({
    data: {
      nome: 'José Antônio Pereira',
      email: 'jose.pereira@lembremed.com',
      senha: await hash('Idoso@123'),
      papel: 'PACIENTE',
      latitude_atual: -6.8901,
      longitude_atual: -38.5601,
    },
  });

  // ===== VÍNCULOS DE CUIDADO (NxN) =====
  await prisma.vinculo_Cuidado.createMany({
    data: [
      { pacienteId: idoso1.id, cuidadorId: cuidador1.id, status: 'ACEITO' },
      { pacienteId: idoso2.id, cuidadorId: cuidador1.id, status: 'ACEITO' },
      { pacienteId: idoso1.id, cuidadorId: cuidador2.id, status: 'ACEITO', nivel_acesso: 'LEITURA' },
    ],
  });

  // ===== MEDICAMENTOS =====
  // Maria (idoso1): 3 medicamentos diários em horários distintos
  await prisma.medicamento.createMany({
    data: [
      {
        pacienteId: idoso1.id,
        nome: 'Losartana Potássica 50mg',
        dosagem: '1 comprimido',
        horario: '07:00',
        frequencia: 'DIARIA',
      },
      {
        pacienteId: idoso1.id,
        nome: 'Metformina 500mg',
        dosagem: '1 comprimido',
        horario: '12:00',
        frequencia: 'DIARIA',
      },
      {
        pacienteId: idoso1.id,
        nome: 'Sinvastatina 20mg',
        dosagem: '1 comprimido',
        horario: '21:00',
        frequencia: 'DIARIA',
      },
    ],
  });

  // José (idoso2): 1 diário + 1 semanal (exercita o campo dias_semana)
  await prisma.medicamento.createMany({
    data: [
      {
        pacienteId: idoso2.id,
        nome: 'Atenolol 25mg',
        dosagem: '1 comprimido',
        horario: '08:00',
        frequencia: 'DIARIA',
      },
      {
        pacienteId: idoso2.id,
        nome: 'Alendronato de Sódio 70mg',
        dosagem: '1 comprimido em jejum',
        horario: '07:00',
        frequencia: 'SEMANAL',
        dias_semana: 'SEGUNDA',
      },
    ],
  });

  console.log('Seed concluído:');
  console.log('  2 médicos, 2 cuidadores, 2 idosos criados');
  console.log('  3 vínculos de cuidado (NxN) criados');
  console.log('  5 medicamentos criados (3 para Maria, 2 para José)');
  console.log('    -> inclui 1 medicamento SEMANAL com dias_semana preenchido');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });