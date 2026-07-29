import type { PontoSaudeMapa } from '../types/pontoSaudeMapa';
import type { Medicamento, RegistroDose } from '../types/registroDose';

// URL base da API do backend LembreMed (configurada em .env como VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL as string;

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  papel: 'PACIENTE' | 'CUIDADOR' | 'MEDICO' | 'ADMIN';
}

interface RespostaLogin {
  token: string;
  usuario: UsuarioLogado;
}

// Todas as rotas protegidas exigem token JWT (verifyToken no backend).
function obterHeadersAutenticacao(): HeadersInit {
  const token = localStorage.getItem('lembremed_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, senha: string): Promise<RespostaLogin> {
  const resposta = await fetch(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro ?? 'Não foi possível fazer login.');
  }

  return dados as RespostaLogin;
}

export interface CadastroDTO {
  nome: string;
  email: string;
  senha: string;
  papel: 'PACIENTE' | 'CUIDADOR';
}

export async function cadastrar(dados: CadastroDTO): Promise<UsuarioLogado> {
  const resposta = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  const corpo = await resposta.json();

  if (!resposta.ok) {
    const mensagem = corpo.erros_de_validacao
      ? corpo.erros_de_validacao.map((e: { message: string }) => e.message).join(', ')
      : corpo.erro ?? 'Não foi possível cadastrar.';
    throw new Error(mensagem);
  }

  return corpo.usuario as UsuarioLogado;
}

export async function buscarPontosSaudeMapa(): Promise<PontoSaudeMapa[]> {
  const resposta = await fetch(`${API_URL}/pontos-saude-mapa`, {
    headers: {
      'Content-Type': 'application/json',
      ...obterHeadersAutenticacao(),
    },
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(
      corpoErro?.erro ?? 'Não foi possível carregar os pontos de saúde.'
    );
  }

  return resposta.json();
}

export async function buscarRegistrosDoDia(
  pacienteId: string,
  data: string
): Promise<RegistroDose[]> {
  const resposta = await fetch(
    `${API_URL}/registros-dose?pacienteId=${pacienteId}&data=${data}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...obterHeadersAutenticacao(),
      },
    }
  );

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(
      corpoErro?.erro ?? 'Não foi possível carregar os remédios de hoje.'
    );
  }
  return resposta.json();
}

export async function confirmarDose(registroId: string): Promise<RegistroDose> {
  const resposta = await fetch(
    `${API_URL}/registros-dose/${registroId}/confirmar`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...obterHeadersAutenticacao(),
      },
    }
  );

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(corpoErro?.erro ?? 'Não foi possível confirmar a dose.');
  }
  return resposta.json();
}

export async function buscarMedicamentosPorPaciente(
  pacienteId: string
): Promise<Medicamento[]> {
  const resposta = await fetch(`${API_URL}/medicamentos?pacienteId=${pacienteId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...obterHeadersAutenticacao(),
    },
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(corpoErro?.erro ?? 'Não foi possível carregar os medicamentos.');
  }

  return resposta.json();
}

// Aciona o Botão SOS: registra um novo Alerta_Emergencia no backend.
// Retorna apenas void — o BotaoSOS só precisa saber se deu certo ou não,
// não usa nenhum dado do alerta criado.
export async function criarAlertaEmergencia(
  pacienteId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  const resposta = await fetch(`${API_URL}/alertas-emergencia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...obterHeadersAutenticacao(),
    },
    body: JSON.stringify({ pacienteId, latitude, longitude }),
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(
      corpoErro?.erro ?? 'Não foi possível enviar o alerta de emergência.'
    );
  }

  await resposta.json().catch(() => null);
}


export interface PacienteVinculado {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  quantidadeMedicamentos: number;
}

export async function buscarMeusPacientes(): Promise<PacienteVinculado[]> {
  const resposta = await fetch(`${API_URL}/vinculos/meus-pacientes`, {
    headers: {
      'Content-Type': 'application/json',
      ...obterHeadersAutenticacao(),
    },
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(corpoErro?.erro ?? 'Não foi possível carregar seus pacientes.');
  }

  return resposta.json();
}

export async function vincularPaciente(emailPaciente: string): Promise<void> {
  const resposta = await fetch(`${API_URL}/vinculos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...obterHeadersAutenticacao(),
    },
    body: JSON.stringify({ emailPaciente }),
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(corpoErro?.erro ?? 'Não foi possível vincular o paciente.');
  }

  await resposta.json().catch(() => null);
}

export interface NovoMedicamentoDTO {
  pacienteId: string;
  nome: string;
  dosagem?: string;
  horario: string;
  frequencia?: 'DIARIA' | 'SEMANAL';
  foto?: File | null;
}

export async function desvincularPaciente(pacienteId: string): Promise<void> {
  const resposta = await fetch(`${API_URL}/vinculos/${pacienteId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...obterHeadersAutenticacao(), 
    },
  });

  if (!resposta.ok) {
    throw new Error('Erro ao remover paciente.');
  }
}

// Usa FormData (não JSON) porque a rota aceita upload de foto (multipart/form-data)
export async function criarMedicamento(dados: NovoMedicamentoDTO): Promise<Medicamento> {
  const formData = new FormData();
  formData.append('pacienteId', dados.pacienteId);
  formData.append('nome', dados.nome);
  formData.append('horario', dados.horario);
  if (dados.dosagem) formData.append('dosagem', dados.dosagem);
  if (dados.frequencia) formData.append('frequencia', dados.frequencia);
  if (dados.foto) formData.append('foto', dados.foto);

  const resposta = await fetch(`${API_URL}/medicamentos`, {
    method: 'POST',
    headers: {
      // Não define Content-Type manualmente: o navegador precisa gerar
      // o boundary do multipart/form-data sozinho.
      ...obterHeadersAutenticacao(),
    },
    body: formData,
  });

  const corpo = await resposta.json();

  if (!resposta.ok) {
    const mensagem = corpo.erros_de_validacao
      ? corpo.erros_de_validacao.map((e: { message: string }) => e.message).join(', ')
      : corpo.erro ?? 'Não foi possível cadastrar o medicamento.';
    throw new Error(mensagem);
  }

  return corpo.medicamento as Medicamento;
}

export async function deletarMedicamento(id: string): Promise<void> {
  const resposta = await fetch(`${API_URL}/medicamentos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...obterHeadersAutenticacao(),
    },
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.json().catch(() => null);
    throw new Error(corpoErro?.erro ?? 'Não foi possível remover o medicamento.');
  }

  await resposta.json().catch(() => null);
}