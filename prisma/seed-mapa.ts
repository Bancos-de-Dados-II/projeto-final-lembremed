import mongoose from 'mongoose';
import 'dotenv/config';

// 1. Defina o Schema focado no formato GeoJSON exigido pelo Mongo
const pontoSaudeSchema = new mongoose.Schema({
  nome: String,
  categoria: String, // ex: 'farmacia_popular', 'hospital', 'posto_saude'
  localizacao: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // OBRIGATÓRIO: [longitude, latitude]
  }
});

// 2. O índice que salva a nota: permite buscas de proximidade ($near)
pontoSaudeSchema.index({ localizacao: '2dsphere' });

// Se o model já existir em outro arquivo, você pode só importar ele. 
// Se não, o Mongoose cria aqui mesmo.
const PontoSaude = mongoose.model('Ponto_Saude_Mapa', pontoSaudeSchema);

async function popularMapaParaiba() {
  try {
    console.log('Conectando ao MongoDB...');
    // Garanta que a sua URL do Mongo está no .env (ex: MONGO_URL=mongodb://localhost:27017/lembremed)
    await mongoose.connect(process.env.MONGO_URI as string);

    // Limpa a coleção para não duplicar os dados se você rodar o script duas vezes
    await PontoSaude.deleteMany({});
    console.log('Coleção antiga limpa.');

    console.log('Baixando dados do OpenStreetMap (isso pode levar uns 10 segundos)...');
    
    // URL da API do OpenStreetMap (Overpass)
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    
    // Essa query busca hospitais, clínicas e farmácias dentro da Paraíba
    const query = `
      [out:json][timeout:25];
      area["name"="Paraíba"]["admin_level"="4"]->.searchArea;
      (
        node["amenity"~"hospital|clinic|pharmacy"](area.searchArea);
      );
      out center;
    `;

    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query
    });
    
    const dados = await response.json();
    const dadosBrutos = dados.elements; // O Overpass entrega os locais dentro desse array 'elements'

    console.log(`Encontrados ${dadosBrutos.length} locais. Formatando para GeoJSON...`);

    // 3. A Regra de Ouro: Transformação dos dados
    const pontosFormatados = dadosBrutos
      .filter((local: any) => local.lat && local.lon) // Filtra para evitar erro se algum vier sem coordenada
      .map((local: any) => {
        
        // Converte o tipo do OpenStreetMap para o nosso padrão do banco
        let categoriaMapeada = 'hospital';
        if (local.tags?.amenity === 'pharmacy') categoriaMapeada = 'farmacia_popular';
        if (local.tags?.amenity === 'clinic') categoriaMapeada = 'posto_saude';

        return {
          nome: local.tags?.name || 'Unidade de Saúde (Nome não cadastrado)',
          categoria: categoriaMapeada, 
          localizacao: {
            type: 'Point',
            coordinates: [
              parseFloat(local.lon), // LONGITUDE PRIMEIRO
              parseFloat(local.lat)  // LATITUDE DEPOIS
            ]
          }
        };
      });

    console.log('Injetando lote massivo no MongoDB...');
    await PontoSaude.insertMany(pontosFormatados);

    console.log('Seed espacial da Paraíba concluído com sucesso! 🚀');
    process.exit(0);

  } catch (erro) {
    console.error('Deu erro ao popular o banco espacial:', erro);
    process.exit(1);
  }
}

popularMapaParaiba();