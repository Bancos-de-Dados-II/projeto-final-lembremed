import { useState } from 'react';
import { criarMedicamento } from '../services/api';
import './ModalAdicionarMedicamento.css';

interface ModalAdicionarMedicamentoProps {
  pacienteId: string;
  aoFechar: () => void;
  aoSalvar: () => void;
}

export function ModalAdicionarMedicamento({
  pacienteId,
  aoFechar,
  aoSalvar,
}: ModalAdicionarMedicamentoProps) {
  const [nome, setNome] = useState('');
  const [horario, setHorario] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoSubmeter(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!nome || !horario) {
      setErro('Nome e horário são obrigatórios.');
      return;
    }

    try {
      setSalvando(true);
      await criarMedicamento({
        pacienteId,
        nome,
        horario,
        dosagem: dosagem || undefined,
        foto,
      });
      aoSalvar();
      aoFechar();
    } catch (erroCapturado) {
      setErro((erroCapturado as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">Adicionar Novo Medicamento</h2>

        <form onSubmit={aoSubmeter}>
          <label className="modal-campo">
            <span>Nome do Medicamento</span>
            <input
              type="text"
              placeholder="Ex: Losartana"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>

          <div className="modal-linha">
            <label className="modal-campo">
              <span>Horário</span>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </label>

            <label className="modal-campo">
              <span>Dosagem</span>
              <input
                type="text"
                placeholder="1 comprimido"
                value={dosagem}
                onChange={(e) => setDosagem(e.target.value)}
              />
            </label>
          </div>

          <label className="modal-campo">
            <span>Foto do Medicamento</span>
            <label className="modal-dropzone">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              />
              <span className="modal-dropzone__icone">📷</span>
              <span>
                {foto ? foto.name : 'Clique para tirar foto ou escolher da galeria'}
              </span>
              <small>Foto da caixa do remédio ou da pílula</small>
            </label>
          </label>

          {erro && <p className="modal-erro" role="alert">{erro}</p>}

          <div className="modal-acoes">
            <button type="button" className="modal-botao-cancelar" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="modal-botao-salvar" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Medicamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}