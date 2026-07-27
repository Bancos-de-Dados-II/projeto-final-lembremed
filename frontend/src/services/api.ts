import type { PontoSaudeMapa } from '../types/pontoSaudeMapa';
import type { Medicamento, RegistroDose } from '../types/registroDose';

// URL base da API do backend LembreMed (configurada em .env como VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL as string;

// Todas as rotas de Ponto_Saude_Mapa exigem token JWT (verifyToken no backend).
// Enquanto a tela de login do time não estiver pronta, o token pode ser colado
// manualmente no localStorage do navegador (chave "lembremed_token"), copiando
// o token retornado pelo POST /usuarios/login no Insomnia.
function obterHeadersAutenticacao(): HeadersInit {
  const token = localStorage.getItem('lembremed_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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