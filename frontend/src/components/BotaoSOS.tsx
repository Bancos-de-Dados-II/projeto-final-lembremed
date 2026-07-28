import { useEffect, useState } from 'react';
import { criarAlertaEmergencia } from '../services/api';
import './BotaoSOS.css';

// Chave já estabelecida pelo restante do time (tela do paciente) para
// identificar o paciente logado — reaproveitada aqui, sem duplicar
// a responsabilidade de "quem é o paciente atual".
const CHAVE_PACIENTE_ID = 'lembremed_paciente_id';

export function BotaoSOS() {
  const [pacienteId, setPacienteId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false);
  const [enviandoAlerta, setEnviandoAlerta] = useState(false);

  // Checagem defensiva: lê o localStorage uma única vez, ao montar.
  //
  // LIMITAÇÃO TEMPORÁRIA: como isso roda só na montagem (array de
  // dependências vazio), se o pacienteId for salvo DEPOIS que este
  // componente já estiver montado (ex: usuário loga enquanto o botão
  // já está na tela), o estado aqui não é atualizado automaticamente —
  // seria necessário um F5 (recarregar a página) para o botão
  // reconhecer o novo valor. Isso deixa de ser um problema assim que
  // existir um fluxo de autenticação real integrado (ex: um Context de
  // sessão, ou um evento "storage" ouvido globalmente), o que está
  // fora do escopo deste componente.
  useEffect(() => {
    setPacienteId(localStorage.getItem(CHAVE_PACIENTE_ID));
  }, []);

  // Traduz o código de erro do navigator.geolocation em uma mensagem
  // amigável em português — não usa error.message, que varia de
  // navegador para navegador e não é confiável para exibir ao usuário.
  function obterMensagemErroGeolocalizacao(codigo: number): string {
    switch (codigo) {
      case GeolocationPositionError.PERMISSION_DENIED:
        return 'Permissão de localização negada. Habilite a localização para usar o Botão SOS.';
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        return 'Não foi possível determinar sua localização no momento.';
      case GeolocationPositionError.TIMEOUT:
        return 'Tempo esgotado ao tentar obter sua localização. Tente novamente.';
      default:
        return 'Não foi possível obter sua localização.';
    }
  }

  // Envia o alerta para a API depois que a localização já foi obtida.
  // Isolado do handleClick só para manter o callback de sucesso do
  // getCurrentPosition mais legível.
  async function enviarAlerta(latitude: number, longitude: number) {
    if (!pacienteId) return; // guarda extra; nunca deveria chegar aqui sem pacienteId

    setEnviandoAlerta(true);

    try {
      await criarAlertaEmergencia(pacienteId, latitude, longitude);
      setMensagem('Alerta enviado com sucesso.');

      // Some sozinha depois de ~4s — mas só se ainda for essa mesma
      // mensagem de sucesso (evita apagar por engano uma mensagem mais
      // nova, caso o usuário já tenha clicado de novo nesse meio-tempo).
      setTimeout(() => {
        setMensagem((mensagemAtual) =>
          mensagemAtual === 'Alerta enviado com sucesso.'
            ? null
            : mensagemAtual
        );
      }, 4000);
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível enviar o alerta de emergência.'
      );
    } finally {
      setEnviandoAlerta(false);
    }
  }

  function handleClick() {
    if (!pacienteId) {
      setMensagem(
        'Paciente não identificado. Faça login para usar o Botão SOS.'
      );
      return;
    }

    if (!('geolocation' in navigator)) {
      setMensagem('Seu navegador não suporta geolocalização.');
      return;
    }

    setMensagem(null);
    setObtendoLocalizacao(true);

    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        setObtendoLocalizacao(false);
        setMensagem(null);

        const { latitude, longitude } = posicao.coords;
        await enviarAlerta(latitude, longitude);
      },
      (erro) => {
        setObtendoLocalizacao(false);
        setMensagem(obterMensagemErroGeolocalizacao(erro.code));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return (
    <div className="botao-sos-wrapper">
      {mensagem && (
        <div className="botao-sos-mensagem" role="alert">
          {mensagem}
          <button
            type="button"
            className="botao-sos-mensagem-fechar"
            onClick={() => setMensagem(null)}
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        className={
          obtendoLocalizacao || enviandoAlerta
            ? 'botao-sos botao-sos--carregando'
            : 'botao-sos'
        }
        onClick={handleClick}
        disabled={obtendoLocalizacao || enviandoAlerta}
        aria-label="Acionar SOS"
      >
        {obtendoLocalizacao
          ? 'Localizando...'
          : enviandoAlerta
          ? 'Enviando...'
          : 'SOS'}
      </button>
    </div>
  );
}