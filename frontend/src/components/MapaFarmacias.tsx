import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import marcadorIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import marcadorIcon from 'leaflet/dist/images/marker-icon.png';
import marcadorSombra from 'leaflet/dist/images/marker-shadow.png';
import { buscarPontosSaudeMapa } from '../services/api';
import type { PontoSaudeMapa } from '../types/pontoSaudeMapa';
import './MapaFarmacias.css';

// Correção necessária: o bundler (Vite) não resolve os ícones padrão do
// Leaflet automaticamente, então os caminhos são reatribuídos manualmente.
// (problema conhecido do Leaflet com bundlers modernos, não é bug do projeto)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marcadorIcon2x,
  iconUrl: marcadorIcon,
  shadowUrl: marcadorSombra,
});

// Centro inicial do mapa: região de Marizópolis-PB, área de abrangência
// social definida no documento de requisitos do LembreMed
const CENTRO_INICIAL: [number, number] = [-6.8906, -38.5615];
const ZOOM_INICIAL = 13;

export function MapaFarmacias() {
  const [pontos, setPontos] = useState<PontoSaudeMapa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarPontosSaudeMapa()
      .then((dados) => setPontos(dados))
      .catch((erroCapturado: Error) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="mapa-container">
      {carregando && (
        <div className="mapa-status mapa-status--carregando">
          Carregando pontos de saúde…
        </div>
      )}

      {erro && !carregando && (
        <div className="mapa-status mapa-status--erro">
          Não foi possível carregar o mapa: {erro}
        </div>
      )}

      <MapContainer
        center={CENTRO_INICIAL}
        zoom={ZOOM_INICIAL}
        className="mapa-leaflet"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pontos.map((ponto) => {
          const [longitude, latitude] = ponto.localizacao.coordinates;

          return (
            <Marker key={ponto._id} position={[latitude, longitude]}>
              <Popup>
                <strong>{ponto.nome}</strong>
                <br />
                {ponto.tipo}
                <br />
                {ponto.endereco}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
