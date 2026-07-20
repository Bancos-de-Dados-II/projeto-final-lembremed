import { createClient } from 'redis';

// Cria a instância do cliente usando a URL do .env
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Fica escutando erros para avisar no console se a conexão cair
redisClient.on('error', (err) => {
  console.error("❌ Erro no Redis Cliente:", err);
});

// Fica escutando o evento de sucesso
redisClient.on('connect', () => {
  console.log("✅ Conectado ao Redis com sucesso!");
});

// Função para iniciar a conexão de fato
const conectarRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("❌ Falha ao iniciar a conexão com o Redis:", error);
  }
};

//redisClient' para fazer o Snooze Adaptativo
export { redisClient, conectarRedis };