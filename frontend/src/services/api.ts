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

// Todas as rotas de Ponto_Saude_Mapa exigem token JWT (verifyToken no backend).
// Enquanto a tela de login do time não estiver pronta, o token pode ser colado
// manualmente no localStorage do navegador (chave "lembremed_token"), copiando
// o token retornado pelo POST /usuarios/login no Insomnia.
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