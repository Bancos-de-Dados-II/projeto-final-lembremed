import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

export class RegistroDoseService {
  // Gera os registros do dia com base nos medicamentos do paciente, se ainda não existirem
  async listarOuGerarDoDia(pacienteId: string, data: string) {
    const dataAlvo = new Date(`${data}T00:00:00`);
    const diaSemana = this.obterDiaSemana(dataAlvo);

    const medicamentos = await prisma.medicamento.findMany({
      where: { pacienteId },
    });

    for (const medicamento of medicamentos) {
      const deveGerarHoje =
        medicamento.frequencia === "DIARIA" ||
        (medicamento.frequencia === "SEMANAL" &&
          medicamento.dias_semana?.includes(diaSemana));

      if (!deveGerarHoje) continue;

      await prisma.registro_Dose.upsert({
        where: {
          medicamentoId_data: {
            medicamentoId: medicamento.id,
            data: dataAlvo,
          },
        },
        update: {},
        create: {
          medicamentoId: medicamento.id,
          data: dataAlvo,
          status: "PENDENTE",
        },
      });
    }

    return prisma.registro_Dose.findMany({
      where: {
        data: dataAlvo,
        medicamento: { pacienteId },
      },
      include: { medicamento: true },
      orderBy: { medicamento: { horario: "asc" } },
    });
  }

  async buscarPorId(id: string) {
    return prisma.registro_Dose.findUnique({
      where: { id },
      include: { medicamento: true },
    });
  }

  async confirmarDose(id: string) {
    return prisma.registro_Dose.update({
      where: { id },
      data: {
        status: "TOMADO",
        horario_confirmado: new Date(),
      },
    });
  }

  async atualizarStatus(id: string, status: "PENDENTE" | "TOMADO" | "ATRASADO") {
    return prisma.registro_Dose.update({
      where: { id },
      data: { status },
    });
  }

  private obterDiaSemana(data: Date): string {
    const dias = [
      "DOMINGO", "SEGUNDA", "TERCA", "QUARTA",
      "QUINTA", "SEXTA", "SABADO",
    ];
    return dias[data.getDay()];
  }
}