import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; // <-- Importação do novo Adaptador
import { AuthService } from './AuthService';
import { CriarUsuarioDTO, LoginDTO } from '../schemas/usuarioSchema';

// 1. Cria a configuração de conexão usando a sua URL do .env
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

// 2. Inicializa o Prisma passando o adaptador oficial
const prisma = new PrismaClient({ adapter });

export class UsuarioService {
  static async criarUsuario(dados: CriarUsuarioDTO) {
    // 1. Verifica se o e-mail já está cadastrado no sistema
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (usuarioExistente) {
      // Se já existir, disparamos um erro que o Controller vai capturar
      throw new Error('Este e-mail já está em uso.');
    }

    // 2. Criptografa a senha usando o serviço que criamos no Passo 4
    const senhaCriptografada = await AuthService.hashPassword(dados.senha);

    // 3. Salva o usuário no banco de dados (sem salvar a senha em texto limpo!)
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaCriptografada,
        papel: dados.papel,
        telefone: dados.telefone,
        foto_perfil_url: dados.foto_perfil_url,
        latitude_atual: dados.latitude_atual,
        longitude_atual: dados.longitude_atual,
      },
    });

    // 4. Remove a senha do objeto antes de retornar para não vazar dados
    const { senha, ...usuarioSemSenha } = novoUsuario;
    
    return usuarioSemSenha;
  }

  static async login(dados: LoginDTO) {
    // 1. Busca o usuário no banco pelo e-mail
    const usuario = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (!usuario) {
      throw new Error('Credenciais inválidas.');
    }

    // 2. Compara as senhas
    const senhaValida = await AuthService.comparePassword(dados.senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas.');
    }

    // 3. Gera o Token! (AQUI ESTÁ A VÍRGULA SEPARANDO OS PARÂMETROS)
    const token = AuthService.generateToken(usuario.id, usuario.papel);

    // 4. Retorna o token e os dados básicos
    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel
      }
    };
  }

  // Lista todos os usuários
  static async listarUsuarios() {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        createdAt: true,
        telefone: true,            
        foto_perfil_url: true,     
        latitude_atual: true,      
        longitude_atual: true
      }
    });
    
    return usuarios;
  }

  // Atualiza os dados de um usuário pelo ID
  static async atualizarUsuario(id: string, dados: any) {
    // 1. Verifica se o usuário existe no banco
    const usuarioExiste = await prisma.usuario.findUnique({ where: { id } });
    
    if (!usuarioExiste) {
      throw new Error('Usuário não encontrado.');
    }

    // 2. Se ele mandou uma senha nova, precisa criptografar de novo
    if (dados.senha) {
      const bcrypt = require('bcryptjs');
      dados.senha = await bcrypt.hash(dados.senha, 10);
    }

    // 3. Salva no banco e devolve sem a senha
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dados,
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        papel: true,
        telefone: true,
        foto_perfil_url: true,
        latitude_atual: true,
        longitude_atual: true 
        }
    });

    return usuarioAtualizado;
  }

  // Deleta um usuário pelo ID
  static async deletarUsuario(id: string) {
    // 1. Verifica se o usuário existe antes de tentar deletar
    const usuarioExiste = await prisma.usuario.findUnique({ where: { id } });
    
    if (!usuarioExiste) {
      throw new Error('Usuário não encontrado.');
    }

    // 2. Apaga o registro do banco de dados
    await prisma.usuario.delete({
      where: { id }
    });

    return true; // Retornamos true só para sinalizar que deu certo
  }
}