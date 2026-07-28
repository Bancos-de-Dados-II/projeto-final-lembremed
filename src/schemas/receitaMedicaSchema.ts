import { z } from 'zod';

export const criarReceitaMedicaSchema = z.object({
  pacienteId: z.uuid({ error: 'ID do paciente deve ser um UUID válido.' }),
  medicoId: z.uuid({ error: 'ID do médico deve ser um UUID válido.' }),
  arquivo_url: z.string().url({ message: 'Formato de URL do arquivo inválido.' }),
  observacoes: z.string().optional(),
  dataEmissao: z.coerce.date().optional(),
});

export type CriarReceitaMedicaDTO = z.infer<typeof criarReceitaMedicaSchema>;

export const atualizarReceitaMedicaSchema = z.object({
  arquivo_url: z.string().url({ message: 'Formato de URL do arquivo inválido.' }).optional(),
  observacoes: z.string().optional(),
  dataEmissao: z.coerce.date().optional(),
});

export type AtualizarReceitaMedicaDTO = z.infer<typeof atualizarReceitaMedicaSchema>;