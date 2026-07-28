import { z } from 'zod';

// Validação para o cadastro de um novo medicamento
export const criarMedicamentoSchema = z.object({
  pacienteId: z.uuid({ error: 'ID do paciente deve ser um UUID válido.' }),
  nome: z.string().min(2, 'O nome do medicamento deve ter no mínimo 2 caracteres'),
  dosagem: z.string().optional(),
  foto_url: z.string().url({ message: 'Formato de URL da foto inválido.' }).optional(),

  // Formato HH:MM (ex: "08:00")
  horario: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário deve estar no formato HH:MM'),

  frequencia: z.enum(['DIARIA', 'SEMANAL']).default('DIARIA'),

  // Só é obrigatório quando frequencia = SEMANAL (ex: "SEGUNDA,QUARTA")
  dias_semana: z.string().optional(),
});

export type CriarMedicamentoDTO = z.infer<typeof criarMedicamentoSchema>;

// Validação para atualização (todos os campos viram opcionais)
export const atualizarMedicamentoSchema = z.object({
  nome: z.string().min(2, 'O nome do medicamento deve ter no mínimo 2 caracteres').optional(),
  dosagem: z.string().optional(),
  foto_url: z.string().url({ message: 'Formato de URL da foto inválido.' }).optional(),
  horario: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário deve estar no formato HH:MM').optional(),
  frequencia: z.enum(['DIARIA', 'SEMANAL']).optional(),
  dias_semana: z.string().optional(),
});

export type AtualizarMedicamentoDTO = z.infer<typeof atualizarMedicamentoSchema>;