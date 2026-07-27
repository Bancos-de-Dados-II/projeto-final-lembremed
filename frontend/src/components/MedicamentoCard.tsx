import type { RegistroDose } from '../types/registroDose';
import './MedicamentoCard.css';

interface MedicamentoCardProps {
  registro: RegistroDose;
  aoConfirmar: (registroId: string) => void;
  carregando: boolean;
}

export function MedicamentoCard({
  registro,
  aoConfirmar,
  carregando,
}: MedicamentoCardProps) {
  const { medicamento, status } = registro;
  const foiTomado = status === 'TOMADO';
  const estaAtrasado = status === 'ATRASADO';

  return (
    <article
      className={`card-medicamento ${foiTomado ? 'card-medicamento--tomado' : ''} ${
        estaAtrasado ? 'card-medicamento--atrasado' : ''
      }`}
    >
      <div className="card-medicamento__foto-wrap">
        {medicamento.foto_url ? (
          <img
            src={medicamento.foto_url}
            alt={medicamento.nome}
            className="card-medicamento__foto"
          />
        ) : (
          <div className="card-medicamento__foto-placeholder" aria-hidden="true">
            💊
          </div>
        )}
      </div>

      <div className="card-medicamento__info">
        <h3 className="card-medicamento__nome">{medicamento.nome}</h3>
        <p className="card-medicamento__horario">
          <span aria-hidden="true">🕐</span> {medicamento.horario}
        </p>
        {medicamento.dosagem && (
          <p className="card-medicamento__dosagem">{medicamento.dosagem}</p>
        )}
      </div>

      {foiTomado ? (
        <div className="card-medicamento__botao card-medicamento__botao--tomado">
          ✓ Tomado
        </div>
      ) : (
        <button
          type="button"
          className="card-medicamento__botao"
          onClick={() => aoConfirmar(registro.id)}
          disabled={carregando}
        >
          {carregando ? 'Confirmando...' : 'Marcar como Tomado'}
        </button>
      )}

      {estaAtrasado && (
        <p className="card-medicamento__aviso" role="status">
          Atrasado — confirme assim que possível
        </p>
      )}
    </article>
  );
}