import type { PontoSaudeMapa } from '../types/pontoSaudeMapa';
import './ListaFarmacias.css';

interface ListaFarmaciasProps {
  farmacias: PontoSaudeMapa[];
  farmaciaSelecionada: PontoSaudeMapa | null;
  onSelecionar: (farmacia: PontoSaudeMapa) => void;
}

export function ListaFarmacias({
  farmacias,
  farmaciaSelecionada,
  onSelecionar,
}: ListaFarmaciasProps) {
  if (farmacias.length === 0) {
    return (
      <div className="lista-farmacias__vazia">
        Nenhuma farmácia encontrada.
      </div>
    );
  }

  return (
    <div className="lista-farmacias">
      {farmacias.map((farmacia) => (
        <button
          key={farmacia._id}
          type="button"
          className={`farmacia-card ${
            farmaciaSelecionada?._id === farmacia._id
              ? 'farmacia-card--ativa'
              : ''
          }`}
          onClick={() => onSelecionar(farmacia)}
        >
          <div className="farmacia-card__conteudo">
            <h3>{farmacia.nome}</h3>

            <p>{farmacia.tipo}</p>

            <span>{farmacia.endereco}</span>
          </div>

          <div className="farmacia-card__icone">
            📍
          </div>
        </button>
      ))}
    </div>
  );
}