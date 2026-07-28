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

// Raio usado para filtrar a lista lateral — o mapa continua mostrando
// todos os pontos, só a lista é filtrada por proximidade
const RAIO_LISTA_KM = 15;

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

// Fórmula de Haversine: calcula a distância em km entre duas coordenadas
function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const raioTerraKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return raioTerraKm * c;
}

function obterMensagemErroGeolocalizacao(codigo: number): string {
  switch (codigo) {
    case GeolocationPositionError.PERMISSION_DENIED:
      return 'Permissão de localização negada. Mostrando todas as farmácias na lista.';
    case GeolocationPositionError.POSITION_UNAVAILABLE:
      return 'Não foi possível determinar sua localização no momento.';
    case GeolocationPositionError.TIMEOUT:
      return 'Tempo esgotado ao tentar obter sua localização.';
    default:
      return 'Não foi possível obter sua localização.';
  }
}

export function MapaFarmacias() {
  const [pontos, setPontos] = useState<PontoSaudeMapa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionado, setSelecionado] =
    useState<PontoSaudeMapa | null>(null);

  const [localizacaoUsuario, setLocalizacaoUsuario] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState<string | null>(null);

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

  // Pede a localização do usuário assim que o componente monta, seguindo
  // o mesmo padrão do BotaoSOS (getCurrentPosition com alta precisão)
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setMensagemLocalizacao('Seu navegador não suporta geolocalização.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLocalizacaoUsuario({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        });
      },
      (erroCapturado) => {
        setMensagemLocalizacao(
          obterMensagemErroGeolocalizacao(erroCapturado.code)
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Lista filtrada por proximidade — usada só no painel lateral.
  // Sem localização do usuário, cai de volta para a lista completa.
  const pontosProximos = localizacaoUsuario
    ? pontos.filter((ponto) => {
        const [longitude, latitude] = ponto.localizacao.coordinates;
        const distancia = calcularDistanciaKm(
          localizacaoUsuario.latitude,
          localizacaoUsuario.longitude,
          latitude,
          longitude
        );
        return distancia <= RAIO_LISTA_KM;
      })
    : pontos;

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

      {mensagemLocalizacao && (
        <div className="mapa-status mapa-status--aviso">
          {mensagemLocalizacao}
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
          {pontosProximos.length === 0 && !carregando && (
            <div style={{ color: '#666', fontSize: 14 }}>
              Nenhuma farmácia encontrada num raio de {RAIO_LISTA_KM} km.
            </div>
          )}

          {pontosProximos.map((ponto) => {
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
            localizacaoUsuario
              ? [localizacaoUsuario.latitude, localizacaoUsuario.longitude]
              : selecionado
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

          {/* Mapa sempre exibe TODOS os pontos, sem filtro de raio */}
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
    </div>
  );
}