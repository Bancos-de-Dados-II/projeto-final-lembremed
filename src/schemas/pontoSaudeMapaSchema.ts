import { z } from 'zod';

// Validação para a criação de um ponto de saúde no mapa
export const criarPontoSaudeMapaSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),

    // Campo livre e expansível: ainda não há uma enum oficial definida nos requisitos
    tipo: z.string().min(1, 'O tipo é obrigatório'),

    endereco: z.string().min(5, 'O endereço deve ter no mínimo 5 caracteres'),

    // Latitude e longitude chegam separadas do frontend - o Service monta o GeoJSON
    latitude: z
        .number({ error: 'Latitude é obrigatória e deve ser um número.' })
        .min(-90, 'Latitude deve estar entre -90 e 90.')
        .max(90, 'Latitude deve estar entre -90 e 90.'),

    longitude: z
        .number({ error: 'Longitude é obrigatória e deve ser um número.' })
        .min(-180, 'Longitude deve estar entre -180 e 180.')
        .max(180, 'Longitude deve estar entre -180 e 180.'),
});

// Inferindo a tipagem do TypeScript direto no Zod
export type CriarPontoSaudeMapaDTO = z.infer<typeof criarPontoSaudeMapaSchema>;

// Validação para atualização - mesmos campos, porém opcionais
export const atualizarPontoSaudeMapaSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').optional(),

    tipo: z.string().min(1, 'O tipo é obrigatório').optional(),

    endereco: z
        .string()
        .min(5, 'O endereço deve ter no mínimo 5 caracteres')
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

export type AtualizarPontoSaudeMapaDTO = z.infer<
    typeof atualizarPontoSaudeMapaSchema
>;
