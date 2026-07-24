import { z } from 'zod';

// Validação para o acionamento (criação) de um novo Alerta de Emergência
export const criarAlertaEmergenciaSchema = z.object({
    // Segue o mesmo padrão de nomenclatura usado em vinculoSchema.ts (pacienteId, cuidadorId)
    pacienteId: z.uuid({ error: 'ID do paciente deve ser um UUID válido.'}),


    status: z
        .enum(['ativo', 'resolvido'], {
            message: 'O status deve ser "ativo" ou "resolvido".',
        })
        .optional(),

    // Latitude e longitude chegam separadas no frontend - o Service monta o GeoJSON
    latitude: z
        .number({ error: 'Latitude é obrigatória e deve ser um número.' })
        .min(-90, 'Latitude deve estar entre -90 e 90.')
        .max(90, 'Latitude deve estar entre -90 e 90.'),

    longitude: z
        .number({ error: 'Longitude é obrigatória e deve ser um número.' })
        .min(-180, 'Longitude deve estar entre -180 e 180.')
        .max(180, 'Longitude deve estar entre -180 e 180.'),
});

// Inferindo a tipagem do TypeScript direto do Zod
export type CriarAlertaEmergenciaDTO = z.infer<
  typeof criarAlertaEmergenciaSchema
>;

// Validação para atualização — usada, por exemplo, para marcar o alerta como "resolvido"
export const atualizarAlertaEmergenciaSchema = z.object({
  status: z
    .enum(['ativo', 'resolvido'], {
      message: 'O status deve ser "ativo" ou "resolvido".',
    })
    .optional(),

  latitude: z
    .number({ error: 'Latitude deve ser um número.' })
    .min(-90, 'Latitude deve estar entre -90 e 90.')
    .max(90, 'Latitude deve estar entre -90 e 90.')
    .optional(),

  longitude: z
    .number({ error: 'Longitude deve ser um número.' })
    .min(-180, 'Longitude deve estar entre -180 e 180.')
    .max(180, 'Longitude deve estar entre -180 e 180.')
    .optional(),
});

export type AtualizarAlertaEmergenciaDTO = z.infer<
  typeof atualizarAlertaEmergenciaSchema
>;
 