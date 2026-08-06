import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const routesGlob = path
  .resolve(process.cwd(), 'src', 'routes', '*.ts')
  .replace(/\\/g, '/');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'LembreMed API',
    version: '1.0.0',
    description:
      'Documentação automática da API LembreMed para cadastro de usuários, vínculos, medicamentos, receitas médicas, alertas e registros de dose.',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Ambiente local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      UsuarioCriacao: {
        type: 'object',
        required: ['nome', 'email', 'senha', 'papel'],
        properties: {
          nome: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'maria@email.com' },
          senha: { type: 'string', minLength: 6, example: '123456' },
          papel: { type: 'string', enum: ['PACIENTE', 'CUIDADOR'], example: 'PACIENTE' },
          telefone: { type: 'string', example: '(11) 99999-9999' },
          foto_perfil_url: { type: 'string', format: 'uri', example: 'https://cdn.exemplo.com/foto.jpg' },
          latitude_atual: { type: 'number', example: -23.55052 },
          longitude_atual: { type: 'number', example: -46.633308 },
        },
      },
      UsuarioAtualizacao: {
        type: 'object',
        properties: {
          nome: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'maria@email.com' },
          senha: { type: 'string', minLength: 6, example: '123456' },
          papel: { type: 'string', enum: ['MEDICO', 'PACIENTE', 'ADMIN', 'CUIDADOR'], example: 'PACIENTE' },
          telefone: { type: 'string', example: '(11) 99999-9999' },
          foto_perfil_url: { type: 'string', format: 'uri', example: 'https://cdn.exemplo.com/foto.jpg' },
          latitude_atual: { type: 'number', example: -23.55052 },
          longitude_atual: { type: 'number', example: -46.633308 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'maria@email.com' },
          senha: { type: 'string', example: '123456' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              nome: { type: 'string', example: 'Maria Silva' },
              email: { type: 'string', format: 'email', example: 'maria@email.com' },
              papel: { type: 'string', example: 'PACIENTE' },
            },
          },
        },
      },
      VinculoCriacao: {
        type: 'object',
        required: ['emailPaciente'],
        properties: {
          emailPaciente: { type: 'string', format: 'email', example: 'paciente@email.com' },
        },
      },
      VinculoResponse: {
        type: 'object',
        properties: {
          mensagem: { type: 'string', example: 'Paciente vinculado com sucesso!' },
          vinculo: { type: 'object' },
        },
      },
      PacienteVinculado: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          telefone: { type: ['string', 'null'] },
          quantidadeMedicamentos: { type: 'number' },
        },
      },
      MedicamentoAtualizacao: {
        type: 'object',
        properties: {
          nome: { type: 'string', example: 'Dipirona' },
          dosagem: { type: 'string', example: '500mg' },
          horario: { type: 'string', example: '08:00', description: 'Formato HH:MM' },
          frequencia: { type: 'string', enum: ['DIARIA', 'SEMANAL'], example: 'DIARIA' },
          dias_semana: { type: 'string', example: 'SEGUNDA,QUARTA' },
          foto_url: { type: 'string', format: 'uri', example: 'https://localhost:3333/uploads/foto.jpg' },
        },
      },
      RegistroDoseStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['PENDENTE', 'TOMADO', 'ATRASADO'], example: 'TOMADO' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  definition: swaggerDefinition,
  apis: [routesGlob],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
