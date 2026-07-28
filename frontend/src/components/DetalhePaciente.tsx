import { useEffect, useState } from 'react';
import {
  buscarMedicamentosPorPaciente,
  deletarMedicamento,
} from '../services/api';
import type { PacienteVinculado } from '../services/api';
import type { Medicamento } from '../types/registroDose';
import { ModalAdicionarMedicamento } from './ModalAdicionarMedicamento';
import './DetalhePaciente.css';

interface DetalhePacienteProps {
  paciente: PacienteVinculado;
  aoVoltar: () => void;
  aoMedicamentoAlterado: () => void;
}

export function DetalhePaciente({
  paciente,
  aoVoltar,
  aoMedicamentoAlterado,
}: DetalhePacienteProps) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  async function carregarMedicamentos() {
    try {
      setCarregando(true);
      const lista = await buscarMedicamentosPorPaciente(paciente.id);
      setMedicamentos(lista);
      setErro(null);
    } catch (erroCapturado) {
      setErro((erroCapturado as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMedicamentos();
  }, [paciente.id]);

  async function aoRemover(id: string) {
    const confirmou = window.confirm('Remover este medicamento?');
    if (!confirmou) return;

    try {
      await deletarMedicamento(id);
      await carregarMedicamentos();
      aoMedicamentoAlterado();
    } catch (erroCapturado) {
      alert((erroCapturado as Error).message);
    }
  }

  return (
    <main className="detalhe-paciente">
      <button type="button" className="detalhe-paciente__voltar" onClick={aoVoltar}>
        ← Voltar para Pacientes
      </button>

      <section className="detalhe-paciente__cartao-info">
        <h1 className="detalhe-paciente__nome">{paciente.nome}</h1>
        <div className="detalhe-paciente__info-grade">
          <div>
            <span className="detalhe-paciente__label">Telefone</span>
            <p>{paciente.telefone ?? 'Não informado'}</p>
          </div>
          <div>
            <span className="detalhe-paciente__label">Email</span>
            <p>{paciente.email}</p>
          </div>
        </div>
      </section>

      <div className="detalhe-paciente__cabecalho-medicamentos">
        <h2>💊 Medicamentos do Paciente</h2>
        <button
          type="button"
          className="detalhe-paciente__botao-adicionar"
          onClick={() => setModalAberto(true)}
        >
          + Adicionar Medicamento
        </button>
      </div>

      {carregando && <p>Carregando medicamentos...</p>}
      {erro && <p className="detalhe-paciente__erro">{erro}</p>}

      {!carregando && !erro && medicamentos.length === 0 && (
        <p>Nenhum medicamento cadastrado ainda.</p>
      )}

      <div className="detalhe-paciente__grade-medicamentos">
        {medicamentos.map((medicamento) => (
          <article key={medicamento.id} className="cartao-medicamento">
            {medicamento.foto_url ? (
              <img
                src={medicamento.foto_url}
                alt={medicamento.nome}
                className="cartao-medicamento__foto"
              />
            ) : (
              <div className="cartao-medicamento__foto cartao-medicamento__foto--vazia">
                💊
              </div>
            )}

            <h3 className="cartao-medicamento__nome">{medicamento.nome}</h3>
            <p className="cartao-medicamento__linha">🕐 {medicamento.horario}</p>
            {medicamento.dosagem && (
              <p className="cartao-medicamento__linha">{medicamento.dosagem}</p>
            )}

            <button
              type="button"
              className="cartao-medicamento__remover"
              onClick={() => aoRemover(medicamento.id)}
            >
              🗑 Remover Medicamento
            </button>
          </article>
        ))}
      </div>

      {modalAberto && (
        <ModalAdicionarMedicamento
          pacienteId={paciente.id}
          aoFechar={() => setModalAberto(false)}
          aoSalvar={carregarMedicamentos}
        />
      )}
    </main>
  );
}