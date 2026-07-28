import { useState, type FormEvent } from 'react';
import { login } from '../services/api';
import type { UsuarioLogado } from '../services/api';
import './Login.css';

interface LoginProps {
  aoLogar: (usuario: UsuarioLogado, token: string) => void;
  aoIrParaCadastro: () => void;
}

export function Login({ aoLogar, aoIrParaCadastro }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
        <button type="button" className="login__link" onClick={aoIrParaCadastro}>
          Não tenho conta, criar agora
        </button>
      </div>
    </main>
  );
}