import { useEffect, useState } from 'react';
import { buscarMeusPacientes, vincularPaciente } from '../services/api';
import type { PacienteVinculado } from '../services/api';
import { DetalhePaciente } from './DetalhePaciente';
import './PainelCuidador.css';

interface PainelCuidadorProps {
  aoSair: () => void;
}

export function PainelCuidador({ aoSair }: PainelCuidadorProps) {
  const [pacientes, setPacientes] = useState<PacienteVinculado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState('');
  const [enviandoVinculo, setEnviandoVinculo] = useState(false);
  const [erroVinculo, setErroVinculo] = useState<string | null>(null);
  const [sucessoVinculo, setSucessoVinculo] = useState<string | null>(null);

  async function carregarPacientes() {
    try {
      setCarregando(true);
      const lista = await buscarMeusPacientes();
      setPacientes(lista);
      setErro(null);
    } catch (erroCapturado) {
      setErro((erroCapturado as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function handleAdicionarPaciente(evento: React.FormEvent) {
    evento.preventDefault();
    setErroVinculo(null);
    setSucessoVinculo(null);

    if (!emailInput.trim()) {
      setErroVinculo('Digite o e-mail do paciente.');
      return;
    }

    setEnviandoVinculo(true);
    try {
      await vincularPaciente(emailInput.trim());
      setSucessoVinculo('Paciente vinculado com sucesso!');
      setEmailInput('');
      await carregarPacientes();
    } catch (erroCapturado) {
      setErroVinculo((erroCapturado as Error).message);
    } finally {
      setEnviandoVinculo(false);
    }
  }

  // Enquanto um paciente estiver selecionado, mostra a tela de detalhe dele
  if (pacienteSelecionadoId) {
    const pacienteSelecionado = pacientes.find((p) => p.id === pacienteSelecionadoId);
    if (pacienteSelecionado) {
      return (
        <DetalhePaciente
          paciente={pacienteSelecionado}
          aoVoltar={() => setPacienteSelecionadoId(null)}
          aoMedicamentoAlterado={carregarPacientes}
        />
      );
    }
  }

  return (
    <main className="painel-cuidador">
      <header className="painel-cuidador__cabecalho">
        <div>
          <h1 className="painel-cuidador__titulo">Painel do Cuidador</h1>
          <p className="painel-cuidador__subtitulo">Gerencie seus pacientes e medicamentos</p>
        </div>
        <button type="button" className="painel-cuidador__botao-sair" onClick={aoSair} title="Sair">
          ↪
        </button>
      </header>

      <form onSubmit={handleAdicionarPaciente} className="painel-cuidador__form-adicionar">
        <label htmlFor="email-paciente" className="painel-cuidador__form-label">
          Adicionar paciente pelo e-mail
        </label>
        <div className="painel-cuidador__form-linha">
          <input
            id="email-paciente"
            type="email"
            placeholder="email@exemplo.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={enviandoVinculo}
            className="painel-cuidador__form-input"
          />
          <button
            type="submit"
            disabled={enviandoVinculo}
            className="painel-cuidador__form-botao"
          >
            {enviandoVinculo ? 'Adicionando...' : 'Adicionar Paciente'}
          </button>
        </div>
        {erroVinculo && (
          <p className="painel-cuidador__mensagem painel-cuidador__mensagem--erro" role="alert">
            {erroVinculo}
          </p>
        )}
        {sucessoVinculo && (
          <p className="painel-cuidador__mensagem painel-cuidador__mensagem--sucesso" role="status">
            {sucessoVinculo}
          </p>
        )}
      </form>

      <h2 className="painel-cuidador__secao-titulo">
        👥 Meus Pacientes ({pacientes.length})
      </h2>

      {carregando && <p className="painel-cuidador__mensagem">Carregando pacientes...</p>}
      {erro && (
        <p className="painel-cuidador__mensagem painel-cuidador__mensagem--erro" role="alert">
          {erro}
        </p>
      )}
      {!carregando && !erro && pacientes.length === 0 && (
        <p className="painel-cuidador__mensagem">
          Você ainda não tem nenhum paciente vinculado.
        </p>
      )}

      <div className="painel-cuidador__grade">
        {pacientes.map((paciente) => (
          <article key={paciente.id} className="cartao-paciente">
            <div className="cartao-paciente__topo">
              <h3 className="cartao-paciente__nome">{paciente.nome}</h3>
              <button
                type="button"
                className="cartao-paciente__seta"
                onClick={() => setPacienteSelecionadoId(paciente.id)}
                aria-label={`Ver detalhes de ${paciente.nome}`}
              >
                →
              </button>
            </div>
            <p className="cartao-paciente__linha">📞 {paciente.telefone ?? 'Não informado'}</p>
            <p className="cartao-paciente__linha">✉️ {paciente.email}</p>
            <div className="cartao-paciente__rodape">
              <span>💊 {paciente.quantidadeMedicamentos} medicamento(s)</span>
              <button
                type="button"
                className="cartao-paciente__gerenciar"
                onClick={() => setPacienteSelecionadoId(paciente.id)}
              >
                Gerenciar →
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}