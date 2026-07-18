import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { verifyToken } from '../middlewares/verifyToken'; // <-- Middleware importado aqui

const usuarioRoutes = Router();

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