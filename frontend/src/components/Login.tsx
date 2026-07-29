import { useState, type FormEvent } from 'react';
import { login } from '../services/api';
import type { UsuarioLogado } from '../services/api';
import './Login.css';

interface LoginProps {
  aoLogar: (usuario: UsuarioLogado, token: string) => void;
  // Agora ele avisa qual papel foi escolhido
  aoIrParaCadastro: (papel: 'PACIENTE' | 'CUIDADOR') => void; 
}

export function Login({ aoLogar, aoIrParaCadastro }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Novo estado para controlar qual tela exibir
  const [escolhendoPerfil, setEscolhendoPerfil] = useState(false);

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resultado = await login(email, senha);
      aoLogar(resultado.usuario, resultado.token);
    } catch (erroCapturado) {
      setErro((erroCapturado as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  // Se o usuário clicou em "criar conta", renderiza a tela de cards
  if (escolhendoPerfil) {
    return (
      <main className="cadastro-container">
        <div className="cards-wrapper">
          
          {/* Card Paciente */}
          <div className="card card-pessoal">
            <div className="icon-wrapper blue-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2>Uso Pessoal</h2>
            <p className="subtitle">Acesso para gerenciar seus próprios medicamentos e horários</p>
            
            <div className="features-list list-blue">
              <ul>
                <li><span>✓</span> Ver horários dos remédios</li>
                <li><span>✓</span> Marcar medicação tomada</li>
                <li><span>✓</span> Botão de emergência SOS</li>
                <li><span>✓</span> Localizar farmácias próximas</li>
              </ul>
            </div>
            
            <button className="btn btn-blue" onClick={() => aoIrParaCadastro('PACIENTE')}>
                Acessar Meus Remédios
            </button>
          </div>

          {/* Card Cuidador */}
          <div className="card card-profissional">
            <div className="icon-wrapper purple-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2>Uso Profissional</h2>
            <p className="subtitle">Acesso para cuidadores gerenciarem pacientes</p>
            
            <div className="features-list list-purple">
              <ul>
                <li><span>✓</span> Gerenciar múltiplos pacientes</li>
                <li><span>✓</span> Cadastrar medicamentos e fotos</li>
                <li><span>✓</span> Anexar receitas médicas</li>
                <li><span>✓</span> Monitorar adesão ao tratamento</li>
              </ul>
            </div>
            
            <button className="btn btn-purple" onClick={() => aoIrParaCadastro('CUIDADOR')}>
                Acessar Painel do Cuidador
            </button>
          </div>

        </div>
        
        <p className="footer-text">Sistema desenvolvido para melhorar a qualidade de vida e segurança no tratamento medicamentoso</p>
        
        {/* Botão para voltar ao Login caso o usuário desista */}
        <button className="login__link" style={{marginTop: '1rem'}} onClick={() => setEscolhendoPerfil(false)}>
          Voltar para o login
        </button>
      </main>
    );
  }

  // Se não estiver escolhendo perfil, renderiza o Login padrão
  return (
    <main className="login">
      <div className="login__card">
        <h1 className="login__titulo">LembreMed</h1>
        <p className="login__subtitulo">Entre com sua conta</p>

        <form className="login__form" onSubmit={aoEnviar}>
          <label className="login__campo">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login__campo">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>

          {erro && (
            <p className="login__erro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" className="login__botao" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        {/* Aqui está o pulo do gato: em vez de chamar aoIrParaCadastro, mudamos o estado */}
        <button type="button" className="login__link" onClick={() => setEscolhendoPerfil(true)}>
          Não tenho conta, criar agora
        </button>
      </div>
    </main>
  );
}