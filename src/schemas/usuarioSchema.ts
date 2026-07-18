import { z } from 'zod';

// Validação para a criação de um novo usuário
export const criarUsuarioSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.email('Formato de e-mail inválido.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  
  // A versão mais recente do Zod aceita a mensagem diretamente assim:
  papel: z.enum(['PACIENTE', 'CUIDADOR'], {
    message: 'O papel deve ser PACIENTE ou CUIDADOR',
  }),
});

// Inferindo a tipagem do TypeScript direto do Zod
export type CriarUsuarioDTO = z.infer<typeof criarUsuarioSchema>;

export const loginSchema = z.object({
  email: z.email('Formato de e-mail inválido.'),
  senha: z.string().min(1, 'A senha é obrigatória.'),
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const atualizarUsuarioSchema = z.object({
  nome: z.string().min(3, 'O nome precisa ter pelo menos 3 letras.').optional(),
  email: z.email('Formato de e-mail inválido.').optional(),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.').optional(),
  papel: z.enum(['MEDICO', 'PACIENTE', 'ADMIN']).optional(),
});