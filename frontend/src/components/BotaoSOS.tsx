import { useEffect, useState } from 'react';
import { criarAlertaEmergencia } from '../services/api';
import { obterEnderecoPorCoordenadas } from '../services/geocodificacao';
import { ModalEmergencia } from './ModalEmergencia';
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
    const [modalAberto, setModalAberto] = useState(false);
    const [endereco, setEndereco] = useState<string | null>(null);
    const [carregandoEndereco, setCarregandoEndereco] = useState(false);

    // Checagem defensiva: lê o localStorage uma única vez, ao montar.
    //
    // Desde a integração do fluxo real de Login/Cadastro (App.tsx), o
    // pacienteId já é salvo no localStorage ANTES deste componente
    // existir na árvore (o shell só renderiza pós-login) — então, na
    // prática, a limitação de "precisar de F5" descrita originalmente
    // aqui deixou de acontecer no fluxo normal do app.
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

            // Sucesso vira modal (protótipo), não mais a mensagem simples —
            // essa continua existindo, mas só para os casos de erro abaixo.
            setModalAberto(true);
            setEndereco(null);
            setCarregandoEndereco(true);

            // Falha na geocodificação não deve derrubar o modal: o alerta já
            // foi salvo com sucesso nesse ponto, então só cai no fallback de
            // texto ("Endereço não disponível") dentro do próprio modal.
            obterEnderecoPorCoordenadas(latitude, longitude)
                .then((enderecoObtido) => setEndereco(enderecoObtido))
                .catch(() => setEndereco(null))
                .finally(() => setCarregandoEndereco(false));
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
        <>
            {mensagem && (
                <div className="botao-sos-mensagem-wrapper">
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
                </div>
            )}

            {modalAberto && (
                <ModalEmergencia
                    endereco={endereco}
                    carregandoEndereco={carregandoEndereco}
                    aoFechar={() => setModalAberto(false)}
                />
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
                title="Acionar SOS"
            >
                {obtendoLocalizacao || enviandoAlerta ? (
                    <span className="botao-sos-spinner" aria-hidden="true" />
                ) : (
                    <span className="botao-sos-icone" aria-hidden="true">
                        !
                    </span>
                )}
            </button>
        </>
    );
}
