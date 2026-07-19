import { z } from 'zod';

export const criarVinculoSchema = z.object({
  pacienteId: z.uuid({ error: 'ID do paciente deve ser um UUID válido.' }),
  cuidadorId: z.uuid({ error: 'ID do cuidador deve ser um UUID válido.' })
});