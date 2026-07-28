import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

// Mesmo padrão de adapter já usado em UsuarioService, VinculoService etc.
// Se o resto do time usa DATABASE_URL em vez de DIRECT_URL nesses arquivos,
// troca a env var aqui pra manter consistência.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;

async function hash(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

async function main() {
  console.log('Iniciando seed do LembreMed...');

  // Limpa dados existentes. Vínculo primeiro (depende de Usuario via FK).
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
      // Cajazeiras-PB, usado pelo botão SOS / mapa de farmácias
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
  // idoso1 tem 2 cuidadores, cuidador1 cuida de 2 idosos -> NxN de verdade.
  // status "ACEITO" simula um vínculo já confirmado (não "PENDENTE", o default).
  await prisma.vinculo_Cuidado.createMany({
    data: [
      { pacienteId: idoso1.id, cuidadorId: cuidador1.id, status: 'ACEITO' },
      { pacienteId: idoso2.id, cuidadorId: cuidador1.id, status: 'ACEITO' },
      { pacienteId: idoso1.id, cuidadorId: cuidador2.id, status: 'ACEITO', nivel_acesso: 'LEITURA' },
    ],
  });

  console.log('Seed concluído:');
  console.log('  2 médicos, 2 cuidadores, 2 idosos criados');
  console.log('  3 vínculos de cuidado (NxN) criados');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });