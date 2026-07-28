import { useEffect, useState } from 'react';
import { MedicamentoCard } from './MedicamentoCard';
import { MapaFarmacias } from './MapaFarmacias';
import { buscarRegistrosDoDia, confirmarDose } from '../services/api';
import type { RegistroDose } from '../types/registroDose';
import './MeusRemedios.css';

// Enquanto a tela de login do time não estiver pronta, o pacienteId pode ser
// colado manualmente no localStorage do navegador (chave "lembremed_paciente_id"),
// copiando o "id" retornado pelo POST /usuarios cadastrado como PACIENTE.
function obterPacienteId(): string | null {
  return localStorage.getItem('lembremed_paciente_id');
}

function formatarDataParaApi(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function formatarDataPorExtenso(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(data);
}

export function MeusRemedios() {
  const [registros, setRegistros] = useState<RegistroDose[]>([]);
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const pacienteId = obterPacienteId();

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

  return (
    <main className="meus-remedios">
      <header className="meus-remedios__cabecalho">
        <div>
          <h1 className="meus-remedios__titulo">Meus Remédios</h1>

          <p className="meus-remedios__data">
            {formatarDataPorExtenso(new Date())}
          </p>
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
    </main>
  );
}