// Tipagem alinhada ao formato retornado pela API (PontoSaudeMapaController)

export interface PontoSaudeMapa {
  _id: string;
  nome: string;
  tipo: string;
  endereco: string;
  localizacao: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude], padrão GeoJSON
  };
  createdAt: string;
  updatedAt: string;
}
