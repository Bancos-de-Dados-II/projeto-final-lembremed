import { redisClient } from "./redis";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

const PREFIXO_CHAVE_SNOOZE = "snooze:";

// Liga a notificação de expiração de chaves no Redis (evento "Ex" = expired).
async function ativarNotificacoesDeExpiracao() {
  await redisClient.sendCommand([
    "CONFIG",
    "SET",
    "notify-keyspace-events",
    "Ex",
  ]);
}

// Fica "escutando" toda vez que uma chave expira no Redis
export async function iniciarListenerDeSnooze() {
  await ativarNotificacoesDeExpiracao();

  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe("__keyevent@0__:expired", async (chaveExpirada) => {
    if (!chaveExpirada.startsWith(PREFIXO_CHAVE_SNOOZE)) return;

    const registroId = chaveExpirada.replace(PREFIXO_CHAVE_SNOOZE, "");
    await marcarComoAtrasadoSeAindaPendente(registroId);
  });

  console.log("✅ Listener de Snooze Adaptativo (Redis) ativo!");
}

async function marcarComoAtrasadoSeAindaPendente(registroId: string) {
  const registro = await prisma.registro_Dose.findUnique({
    where: { id: registroId },
  });

  if (registro?.status === "PENDENTE") {
    await prisma.registro_Dose.update({
      where: { id: registroId },
      data: { status: "ATRASADO" },
    });
    console.log(`⏰ Registro ${registroId} marcado como ATRASADO.`);
  }
}

// Calcula quantos segundos faltam até o "limite de atraso"
export function calcularSegundosAteAtraso(data: Date, horario: string): number {
  const [horas, minutos] = horario.split(":").map(Number);

  const horarioPrevisto = new Date(data);
  
  horarioPrevisto.setUTCHours(horas + 3, minutos, 0, 0);

  const limiteDeAtraso = new Date(horarioPrevisto.getTime() + 30 * 60 * 1000);

  return Math.floor((limiteDeAtraso.getTime() - Date.now()) / 1000);
}

// Agenda o snooze de um registro recém-criado.
export async function agendarSnoozeDoRegistro(
  registroId: string,
  data: Date,
  horario: string
) {
  const segundos = calcularSegundosAteAtraso(data, horario);

  if (segundos <= 0) {
    await marcarComoAtrasadoSeAindaPendente(registroId);
    return;
  }

  await redisClient.set(`${PREFIXO_CHAVE_SNOOZE}${registroId}`, "1", {
    EX: segundos,
  });
}

// Cancela o snooze quando o paciente confirma a dose.
export async function cancelarSnoozeDoRegistro(registroId: string) {
  await redisClient.del(`${PREFIXO_CHAVE_SNOOZE}${registroId}`);
}