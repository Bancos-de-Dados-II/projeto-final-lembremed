import './ModalEmergencia.css';

interface ModalEmergenciaProps {
  endereco: string | null;
  carregandoEndereco: boolean;
  aoFechar: () => void;
}

export function ModalEmergencia({
  endereco,
  carregandoEndereco,
  aoFechar,
}: ModalEmergenciaProps) {
  return (
    <div className="modal-emergencia-overlay">
      <div className="modal-emergencia-card" role="dialog" aria-modal="true">
        <div className="modal-emergencia-icone">!</div>

        <h2 className="modal-emergencia-titulo">Emergência Ativada</h2>
        <p className="modal-emergencia-subtitulo">
          Sua localização está sendo compartilhada com seus contatos de
          emergência.
        </p>

        <div className="modal-emergencia-endereco-box">
          <span className="modal-emergencia-endereco-label">
            Localização Atual:
          </span>
          <strong className="modal-emergencia-endereco-valor">
            {carregandoEndereco
              ? 'Obtendo endereço...'
              : endereco ?? 'Endereço não disponível'}
          </strong>
        </div>

        <a
          href="tel:192"
          className="modal-emergencia-botao modal-emergencia-botao--samu"
        >
          Ligar para 192 (SAMU)
        </a>

        {/* Sem número disponível ainda (fora do escopo atual) — fica só
            visual, sem link/ação, como combinado. */}
        <button
          type="button"
          className="modal-emergencia-botao modal-emergencia-botao--contato"
          disabled
        >
          Ligar para Contato de Emergência
        </button>

        <button
          type="button"
          className="modal-emergencia-botao modal-emergencia-botao--cancelar"
          onClick={aoFechar}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
