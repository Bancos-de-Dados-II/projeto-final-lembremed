import { PontoSaudeMapa } from '../models/PontoSaudeMapa';
import {
  CriarPontoSaudeMapaDTO,
  AtualizarPontoSaudeMapaDTO,
} from '../schemas/pontoSaudeMapaSchema';

export class PontoSaudeMapaService {
  // Cria um novo Ponto de Saúde no Mapa
  static async criarPontoSaudeMapa(dados: CriarPontoSaudeMapaDTO) {
    // Separa latitude/longitude do restante dos campos, pois elas não existem
    // diretamente no Model — são convertidas para o subdocumento GeoJSON
    const { latitude, longitude, ...resto } = dados;

    const novoPonto = await PontoSaudeMapa.create({
      ...resto,
      localizacao: {
        type: 'Point',
        coordinates: [longitude, latitude], // GeoJSON exige [longitude, latitude]
      },
    });

    return novoPonto;
  }

  // Lista todos os Pontos de Saúde cadastrados
  static async listarPontosSaudeMapa() {
    const pontos = await PontoSaudeMapa.find();
    return pontos;
  }

  // Busca um único Ponto de Saúde pelo id
  static async buscarPontoSaudeMapaPorId(id: string) {
    const ponto = await PontoSaudeMapa.findById(id);

    if (!ponto) {
      throw new Error('Ponto de Saúde não encontrado.');
    }

    return ponto;
  }

  // Atualiza um Ponto de Saúde existente
  static async atualizarPontoSaudeMapa(
    id: string,
    dados: AtualizarPontoSaudeMapaDTO
  ) {
    const pontoExiste = await PontoSaudeMapa.findById(id);

    if (!pontoExiste) {
      throw new Error('Ponto de Saúde não encontrado.');
    }

    const { latitude, longitude, ...resto } = dados;

    const dadosAtualizados: Record<string, unknown> = { ...resto };

    // Só remonta a localização se as duas coordenadas foram enviadas juntas,
    // evitando salvar um Point inconsistente com apenas uma das coordenadas
    if (latitude !== undefined && longitude !== undefined) {
      dadosAtualizados.localizacao = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const pontoAtualizado = await PontoSaudeMapa.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true } // retorna o documento já atualizado, não o antigo
    );

    return pontoAtualizado;
  }

  // Remove um Ponto de Saúde do banco
  static async deletarPontoSaudeMapa(id: string) {
    const pontoExiste = await PontoSaudeMapa.findById(id);

    if (!pontoExiste) {
      throw new Error('Ponto de Saúde não encontrado.');
    }

    await PontoSaudeMapa.findByIdAndDelete(id);

    return true;
  }
}