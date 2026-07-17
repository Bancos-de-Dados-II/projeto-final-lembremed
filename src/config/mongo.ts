import mongoose from 'mongoose';
import 'dotenv/config';

export const connectMongo = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI não definida no .env");
    
    await mongoose.connect(uri);
    console.log('🟢 Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('🔴 Erro ao conectar no MongoDB:', error);
  }
};