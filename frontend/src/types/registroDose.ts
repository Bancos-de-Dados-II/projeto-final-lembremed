export interface Medicamento {
  id: string;
  nome: string;
  dosagem?: string;
  horario: string;
  foto_url?: string;
}

export interface RegistroDose {
  id: string;
  status: 'PENDENTE' | 'TOMADO' | 'ATRASADO';
  horario_confirmado?: string | null;
  medicamento: Medicamento;
}