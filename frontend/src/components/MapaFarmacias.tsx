import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import marcadorIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import marcadorIcon from 'leaflet/dist/images/marker-icon.png';
import marcadorSombra from 'leaflet/dist/images/marker-shadow.png';
import { buscarPontosSaudeMapa } from '../services/api';
import type { PontoSaudeMapa } from '../types/pontoSaudeMapa';
import './MapaFarmacias.css';

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
function CentralizarMapa({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], 16, {
      duration: 1.2,
    });
  }, [latitude, longitude, map]);

  return null;
}

export function MapaFarmacias() {
  const [pontos, setPontos] = useState<PontoSaudeMapa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionado, setSelecionado] =
    useState<PontoSaudeMapa | null>(null);

  useEffect(() => {
    buscarPontosSaudeMapa()
      .then((dados) => {

        setPontos(dados);

        if (dados.length) {

          setSelecionado(dados[0]);
        }
      })
      .catch((erroCapturado: Error) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }, []);

  console.log(pontos);
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '20px',
          height: '600px',
        }}
      >

        <div
          style={{
            overflowY: 'auto',
            background: '#fff',
            borderRadius: '16px',
            padding: '16px'
          }}
        >

          {pontos.map((ponto) => {

            const [longitude, latitude] = ponto.localizacao.coordinates;

            const ativo = selecionado?._id === ponto._id;
            
            return (

              <div
                key={ponto._id}
                onClick={() => setSelecionado(ponto)}
                style={{
                  padding: '14px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: ativo ? '2px solid #5b4fe0' : '1px solid #ddd',
                  background: ativo ? '#f5f3ff' : 'white'
                }}
              >

                <strong>{ponto.nome}</strong>

                <div>{ponto.tipo}</div>

                <div
                  style={{
                    fontSize: 13,
                    color: '#666'
                  }}
                >

                  {ponto.endereco}

                </div>

              </div>

            );

          })}

        </div>

        <MapContainer
          center={
            selecionado
              ? [
                selecionado.localizacao.coordinates[1],
                selecionado.localizacao.coordinates[0]
              ]
              : CENTRO_INICIAL
          }
          zoom={16}
          className="mapa-leaflet"
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selecionado && (

            <CentralizarMapa
              latitude={selecionado.localizacao.coordinates[1]}
              longitude={selecionado.localizacao.coordinates[0]}
            />

          )}

          {pontos.map((ponto) => {

            const [longitude, latitude] =
              ponto.localizacao.coordinates;

            return (

              <Marker
                key={ponto._id}
                position={[latitude, longitude]}
              >

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
    </div>
  );
}
