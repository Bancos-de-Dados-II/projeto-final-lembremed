import { createClient } from 'redis';
import 'dotenv/config';

export const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('🔴 Erro no Redis:', err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('🟢 Conectado ao Redis com sucesso!');
  } catch (error) {
    console.error('🔴 Erro ao conectar no Redis:', error);
  }
};