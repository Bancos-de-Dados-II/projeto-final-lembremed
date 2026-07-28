import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PontoSaudeMapa } from '../models/PontoSaudeMapa';

dotenv.config();

// Consulta Overpass: busca farmácias (amenity=pharmacy) dentro da área da Paraíba (OSM area id)
// area["ISO3166-2"="BR-PB"] filtra pelo estado da Paraíba usando o código ISO
const QUERY_OVERPASS = `
  [out:json][timeout:90];
  (
    node["amenity"="pharmacy"](-8.3,-38.8,-6.0,-34.7);
    way["amenity"="pharmacy"](-8.3,-38.8,-6.0,-34.7);
  );
  out center;
`;

interface ElementoOverpass {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:suburb'?: string;
    'addr:city'?: string;
    'addr:full'?: string;
  };
}

async function buscarFarmaciasNaParaiba(): Promise<ElementoOverpass[]> {
  const resposta = await fetch('https://overpass.kumi.systems/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'LembreMed-App/1.0 (projeto acadêmico UFCG - Bancos de Dados II)',
    },
    body: `data=${encodeURIComponent(QUERY_OVERPASS)}`,
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.text().catch(() => '');
    throw new Error(`Overpass API retornou erro: ${resposta.status} - ${corpoErro}`);
  }

  const dados = await resposta.json();
  return dados.elements as ElementoOverpass[];
}

function montarEndereco(tags: ElementoOverpass['tags']): string {
  if (!tags) return 'Endereço não informado';

  const rua = tags['addr:street'] ?? '';
  const numero = tags['addr:housenumber'] ?? '';
  const bairro = tags['addr:suburb'] ?? '';
  const cidade = tags['addr:city'] ?? '';
  const enderecoCompleto = tags['addr:full'] ?? '';

  // Se o OSM já tiver o endereço pronto, usa direto
  if (enderecoCompleto) return enderecoCompleto;

  const ruaComNumero = rua && numero ? `${rua}, ${numero}` : rua;

  const partes = [ruaComNumero, bairro, cidade].filter(Boolean);

  return partes.length > 0 ? partes.join(' - ') : 'Endereço não informado';
}

async function seedFarmacias() {
  const uriMongo = process.env.MONGO_URI;
  if (!uriMongo) {
    throw new Error('MONGO_URI não definida no .env');
  }

  console.log('Conectando ao MongoDB...');
  await mongoose.connect(uriMongo);

  console.log('Buscando farmácias da Paraíba na Overpass API...');
  const elementos = await buscarFarmaciasNaParaiba();
  console.log(`Encontradas ${elementos.length} farmácias.`);

  const documentos = elementos
    .map((elemento) => {
      const lat = elemento.lat ?? elemento.center?.lat;
      const lon = elemento.lon ?? elemento.center?.lon;

      if (lat === undefined || lon === undefined) return null;

      return {
        nome: elemento.tags?.name ?? 'Farmácia sem nome cadastrado',
        tipo: 'Farmácia',
        endereco: montarEndereco(elemento.tags),
        localizacao: {
          type: 'Point' as const,
          coordinates: [lon, lat] as [number, number], // GeoJSON é [longitude, latitude]
        },
      };
    })
    .filter((doc) => doc !== null);

  console.log(`Inserindo ${documentos.length} farmácias válidas no banco...`);

  // Limpa farmácias antigas antes de povoar de novo (evita duplicar em re-execuções)
  await PontoSaudeMapa.deleteMany({ tipo: 'Farmácia' });
  await PontoSaudeMapa.insertMany(documentos);

  console.log('✅ Seed concluído com sucesso!');
  await mongoose.disconnect();
}

seedFarmacias().catch((erro) => {
  console.error('❌ Erro ao popular farmácias:', erro);
  process.exit(1);
});