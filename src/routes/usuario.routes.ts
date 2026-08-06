import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { verifyToken } from '../middlewares/verifyToken'; // <-- Middleware importado aqui

const usuarioRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Cadastro, login e gerenciamento de usuários.
 * /usuarios:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCriacao'
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso.
 *       400:
 *         description: Erro de validação.
 *   get:
 *     summary: Lista os usuários cadastrados
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *       401:
 *         description: Token ausente ou inválido.
 * /usuarios/login:
 *   post:
 *     summary: Realiza login e retorna token JWT
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Credenciais inválidas.
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioAtualizacao'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *       400:
 *         description: Erro de validação.
 *       404:
 *         description: Usuário não encontrado.
 *   delete:
 *     summary: Remove um usuário pelo ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 */

// Rota para cadastrar
usuarioRoutes.post('/', UsuarioController.criar);

// Rota para fazer o login
usuarioRoutes.post('/login', UsuarioController.login); 

// Rota PROTEGIDA para listar usuários (O verifyToken é o cadeado!)
usuarioRoutes.get('/', verifyToken, UsuarioController.listar); 

// Rota PROTEGIDA para atualizar usuário
usuarioRoutes.put('/:id', verifyToken, UsuarioController.atualizar);

// Rota PROTEGIDA para deletar usuário
usuarioRoutes.delete('/:id', verifyToken, UsuarioController.deletar);

export { usuarioRoutes };