import { useState, type FormEvent } from 'react';
import { cadastrar, login } from '../services/api';
import type { UsuarioLogado } from '../services/api';
import './Login.css';

interface CadastroProps {
  aoCadastrar: (usuario: UsuarioLogado, token: string) => void;
  aoVoltarParaLogin: () => void;
  papelInicial: 'PACIENTE' | 'CUIDADOR'; 
}

// 1. Recebemos o papelInicial aqui nas propriedades
export function Cadastro({ aoCadastrar, aoVoltarParaLogin, papelInicial }: CadastroProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  // 2. O useState de 'papel' foi removido, pois a escolha já foi feita na tela anterior
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      // 3. Passamos o papelInicial direto para a função de cadastro da API
      await cadastrar({ nome, email, senha, papel: papelInicial });
      
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
        
        {/* 4. Subtítulo dinâmico para dar feedback visual ao usuário */}
        <p className="login__subtitulo">
          Criar conta de {papelInicial === 'PACIENTE' ? 'Paciente' : 'Cuidador'}
        </p>

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

          {/* O bloco "Eu sou: Paciente / Cuidador" foi completamente removido daqui! */}

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