import { useEffect, useState } from 'react';
import { buscarMedicamentosPorPaciente, buscarRegistrosDoDia } from '../services/api';
import type { Medicamento, RegistroDose } from '../types/registroDose';
import './Dashboard.css';

const DIAS_DE_HISTORICO = 7;

interface AdesaoDoDia {
  data: string;
  totalDoses: number;
  dosesTomadas: number;
  percentual: number;
}

function obterPacienteId(): string | null {
  return localStorage.getItem('lembremed_paciente_id');
}

function formatarDataParaApi(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function formatarDataCurta(dataIso: string): string {
  const [, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}`;
}

export function Dashboard() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [adesaoPorDia, setAdesaoPorDia] = useState<AdesaoDoDia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const pacienteId = obterPacienteId();

  useEffect(() => {
    if (!pacienteId) {
      setErro(
        'Nenhum paciente configurado. Salve o pacienteId em localStorage ("lembremed_paciente_id") para testar.'
      );
      setCarregando(false);
      return;
    }

    async function carregarDados(idPaciente: string) {
      try {
        const listaMedicamentos = await buscarMedicamentosPorPaciente(idPaciente);
        setMedicamentos(listaMedicamentos);

        const hoje = new Date();
        const diasParaBuscar: Date[] = [];

        for (let i = DIAS_DE_HISTORICO - 1; i >= 0; i--) {
          const data = new Date(hoje);
          data.setDate(hoje.getDate() - i);
          diasParaBuscar.push(data);
        }

        const resultadosPorDia = await Promise.all(
          diasParaBuscar.map(async (data) => {
            const dataFormatada = formatarDataParaApi(data);
            const registros: RegistroDose[] = await buscarRegistrosDoDia(
              idPaciente,
              dataFormatada
            );

            const totalDoses = registros.length;
            const dosesTomadas = registros.filter(
              (registro) => registro.status === 'TOMADO'
            ).length;

            return {
              data: dataFormatada,
              totalDoses,
              dosesTomadas,
              percentual:
                totalDoses > 0 ? Math.round((dosesTomadas / totalDoses) * 100) : 0,
            };
          })
        );

        setAdesaoPorDia(resultadosPorDia);
      } catch (erroCapturado) {
        setErro((erroCapturado as Error).message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados(pacienteId);
  }, [pacienteId]);

  const percentualGeral =
    adesaoPorDia.length > 0
      ? Math.round(
          adesaoPorDia.reduce((soma, dia) => soma + dia.percentual, 0) /
            adesaoPorDia.length
        )
      : 0;

  if (carregando) {
    return <p className="dashboard__carregando">Carregando dashboard...</p>;
  }

  return (
    <main className="dashboard">
      <header className="dashboard__cabecalho">
        <h1 className="dashboard__titulo">Painel Administrativo</h1>
        <p className="dashboard__subtitulo">
          Visão geral de medicamentos e adesão ao tratamento
        </p>
      </header>

      {erro && (
        <p className="dashboard__erro" role="alert">
          {erro}
        </p>
      )}

      <section aria-labelledby="grade-titulo" className="dashboard__secao">
        <h2 id="grade-titulo" className="dashboard__subtitulo-secao">
          🕐 Grade Horária
        </h2>

        {medicamentos.length === 0 ? (
          <p className="dashboard__vazio">Nenhum medicamento cadastrado.</p>
        ) : (
          <table className="dashboard__tabela">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Dosagem</th>
                <th>Horário</th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.map((medicamento) => (
                <tr key={medicamento.id}>
                  <td>{medicamento.nome}</td>
                  <td>{medicamento.dosagem ?? '-'}</td>
                  <td>{medicamento.horario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="adesao-titulo" className="dashboard__secao">
        <h2 id="adesao-titulo" className="dashboard__subtitulo-secao">
          📊 Adesão ao Tratamento (últimos {DIAS_DE_HISTORICO} dias)
        </h2>

        <p className="dashboard__percentual-geral">
          Média geral: <strong>{percentualGeral}%</strong>
        </p>

        <div className="dashboard__grafico">
          {adesaoPorDia.map((dia) => (
            <div key={dia.data} className="dashboard__barra-container">
              <div
                className="dashboard__barra"
                style={{ height: `${dia.percentual}%` }}
                title={`${dia.dosesTomadas}/${dia.totalDoses} doses tomadas`}
              />
              <span className="dashboard__barra-percentual">{dia.percentual}%</span>
              <span className="dashboard__barra-data">{formatarDataCurta(dia.data)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}