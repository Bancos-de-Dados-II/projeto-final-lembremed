import { useState, type FormEvent } from 'react';
import { cadastrar, login } from '../services/api';
import type { UsuarioLogado } from '../services/api';
import './Login.css';

interface CadastroProps {
  aoCadastrar: (usuario: UsuarioLogado, token: string) => void;
  aoVoltarParaLogin: () => void;
}

export function Cadastro({ aoCadastrar, aoVoltarParaLogin }: CadastroProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState<'PACIENTE' | 'CUIDADOR'>('PACIENTE');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      await cadastrar({ nome, email, senha, papel });
      // após cadastrar, já loga automaticamente pra não precisar digitar tudo de novo
      const resultado = await login(email, senha);
      aoCadastrar(resultado.usuario, resultado.token);
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
        <p className="login__subtitulo">Criar conta</p>

        <form className="login__form" onSubmit={aoEnviar}>
          <label className="login__campo">
            Nome
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </label>

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
              minLength={6}
            />
          </label>

          <div className="login__campo">
            Eu sou:
            <div className="login__papel-opcoes">
              <label className="login__papel-opcao">
                <input
                  type="radio"
                  name="papel"
                  value="PACIENTE"
                  checked={papel === 'PACIENTE'}
                  onChange={() => setPapel('PACIENTE')}
                />
                Paciente
              </label>

              <label className="login__papel-opcao">
                <input
                  type="radio"
                  name="papel"
                  value="CUIDADOR"
                  checked={papel === 'CUIDADOR'}
                  onChange={() => setPapel('CUIDADOR')}
                />
                Cuidador
              </label>
            </div>
          </div>

          {erro && (
            <p className="login__erro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" className="login__botao" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <button type="button" className="login__link" onClick={aoVoltarParaLogin}>
          Já tenho conta, entrar
        </button>
      </div>
    </main>
  );
}