import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const usuarioRoutes = Router();

// Rota para cadastrar
usuarioRoutes.post('/', UsuarioController.criar);

// Rota NOVA para fazer o login
usuarioRoutes.post('/login', UsuarioController.login); 

export { usuarioRoutes };