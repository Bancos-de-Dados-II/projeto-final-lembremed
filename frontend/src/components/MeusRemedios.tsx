import { useEffect, useState, useCallback } from 'react';
import { MedicamentoCard } from './MedicamentoCard';
import { MapaFarmacias } from './MapaFarmacias';
import { BotaoSOS } from './BotaoSOS';
import { AlarmeModal } from '../components/AlarmeModal';
import { buscarRegistrosDoDia, confirmarDose } from '../services/api';
import { useAlarmeDose } from '../hooks/useAlarmeDose';
import type { RegistroDose } from '../types/registroDose';
import type { UsuarioLogado } from '../services/api';
import './MeusRemedios.css';

interface MeusRemediosProps {
  usuario: UsuarioLogado;
  aoSair: () => void;
}

function obterPacienteId(): string | null {
  return localStorage.getItem('lembremed_paciente_id');
}

function formatarDataParaApi(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarDataPorExtenso(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(data);
}

export function MeusRemedios({ usuario, aoSair }: MeusRemediosProps) {
  const [registros, setRegistros] = useState<RegistroDose[]>([]);
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [registroAlerta, setRegistroAlerta] = useState<RegistroDose | null>(null);

  const pacienteId = obterPacienteId();

  const handleDispararAlarme = useCallback((registro: RegistroDose) => {
    setRegistroAlerta(registro);
  }, []);

  const { pararAlarme } = useAlarmeDose(registros, handleDispararAlarme);

  useEffect(() => {
    if (!pacienteId) {
      setErro(
        'Nenhum paciente configurado. Salve o pacienteId em localStorage ("lembremed_paciente_id") para testar.'
      );
      setCarregandoLista(false);
      return;
    }

    const hoje = formatarDataParaApi(new Date());

    buscarRegistrosDoDia(pacienteId, hoje)
      .then(setRegistros)
      .catch((erroCapturado: Error) => setErro(erroCapturado.message))
      .finally(() => setCarregandoLista(false));
  }, [pacienteId]);

  async function handleConfirmar(registroId: string) {
    setCarregandoId(registroId);
    setErro(null);

    try {
      const registroAtualizado = await confirmarDose(registroId);

      pararAlarme();
      setRegistroAlerta(null);

      setRegistros((atual) =>
        atual.map((registro) =>
          registro.id === registroId ? registroAtualizado : registro
        )
      );
    } catch (erroCapturado) {
      setErro((erroCapturado as Error).message);
    } finally {
      setCarregandoId(null);
    }
  }

  function handleFecharAlarme() {
    pararAlarme();
    setRegistroAlerta(null);
  }

  return (
    <main className="meus-remedios">
      <header className="meus-remedios__cabecalho">
        <div>
          <h1 className="meus-remedios__titulo">Meus Remédios</h1>
          <p className="meus-remedios__data">
            {formatarDataPorExtenso(new Date())}
          </p>
        </div>

        <div className="meus-remedios__acoes">
          <span className="meus-remedios__saudacao">Olá, {usuario.nome}</span>
          <button
            type="button"
            className="meus-remedios__botao-sair"
            onClick={aoSair}
            title="Sair"
            aria-label="Sair"
          >
            ↪
          </button>
          <BotaoSOS />
        </div>
      </header>

      {erro && (
        <p className="meus-remedios__erro" role="alert">
          {erro}
        </p>
      )}

      <section aria-labelledby="horarios-titulo">
        <h2 id="horarios-titulo" className="meus-remedios__subtitulo">
          🕐 Horários de Hoje
        </h2>

        {carregandoLista ? (
          <p className="meus-remedios__carregando">
            Carregando remédios...
          </p>
        ) : (
          <div className="meus-remedios__grade">
            {registros.map((registro) => (
              <MedicamentoCard
                key={registro.id}
                registro={registro}
                aoConfirmar={handleConfirmar}
                carregando={carregandoId === registro.id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="meus-remedios__farmacias">
        <h2 className="meus-remedios__subtitulo">
          📍 Farmácias Próximas
        </h2>
        <div className="meus-remedios__mapa">
          <MapaFarmacias />
        </div>
      </section>

      {/* Modal renderizado diretamente no document.body via Portal */}
      <AlarmeModal
        registro={registroAlerta}
        onConfirmar={handleConfirmar}
        onFechar={handleFecharAlarme}
      />
    </main>
  );
}