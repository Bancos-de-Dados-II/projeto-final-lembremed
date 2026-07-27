import { AlertaEmergencia } from '../models/AlertaEmergencia';
import {
  CriarAlertaEmergenciaDTO,
  AtualizarAlertaEmergenciaDTO,
} from '../schemas/alertaEmergenciaSchema';

export class AlertaEmergenciaService {
  // Registra o acionamento de um novo Alerta de Emergência
  static async criarAlertaEmergencia(dados: CriarAlertaEmergenciaDTO) {
    // Separa latitude/longitude do restante dos campos, pois elas não existem
    // diretamente no Model — são convertidas para o subdocumento GeoJSON
    const { latitude, longitude, ...resto } = dados;

    const novoAlerta = await AlertaEmergencia.create({
      ...resto,
      localizacao: {
        type: 'Point',
        coordinates: [longitude, latitude], // GeoJSON exige [longitude, latitude]
      },
      // status e dataHoraAcionamento usam os defaults definidos no Model
      // ('ativo' e Date.now) quando não vierem preenchidos no DTO
    });

    return novoAlerta;
  }

  // Lista todos os Alertas de Emergência registrados
  static async listarAlertasEmergencia() {
    const alertas = await AlertaEmergencia.find();
    return alertas;
  }

  // Busca um único Alerta de Emergência pelo id
  static async buscarAlertaEmergenciaPorId(id: string) {
    const alerta = await AlertaEmergencia.findById(id);

    if (!alerta) {
      throw new Error('Alerta de Emergência não encontrado.');
    }

    return alerta;
  }

  // Atualiza um Alerta de Emergência existente (ex: status ou localização)
  static async atualizarAlertaEmergencia(
    id: string,
    dados: AtualizarAlertaEmergenciaDTO
  ) {
    const alertaExiste = await AlertaEmergencia.findById(id);

    if (!alertaExiste) {
      throw new Error('Alerta de Emergência não encontrado.');
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

    const alertaAtualizado = await AlertaEmergencia.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true } // retorna o documento já atualizado, não o antigo
    );

    return alertaAtualizado;
  }

  // Remove um Alerta de Emergência do banco
  static async deletarAlertaEmergencia(id: string) {
    const alertaExiste = await AlertaEmergencia.findById(id);

    if (!alertaExiste) {
      throw new Error('Alerta de Emergência não encontrado.');
    }

    await AlertaEmergencia.findByIdAndDelete(id);

    return true;
  }
}