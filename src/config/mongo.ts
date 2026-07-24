import mongoose from 'mongoose';

const conectarMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    // Trava de segurança caso a variável não seja encontrada
    if (!mongoUri) {
      throw new Error("A variável MONGO_URI não está definida no arquivo .env");
    }

    // Tenta realizar a conexão
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado ao MongoDB com sucesso!");

  } catch (error) {
    console.error("❌ Erro ao conectar no MongoDB:", error);
  }
};

export default conectarMongoDB;