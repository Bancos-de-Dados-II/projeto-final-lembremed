import { useState } from 'react';
import { Login } from './components/Login';
import { Cadastro } from './components/Cadastro';
import { MeusRemedios } from './components/MeusRemedios';
import { Dashboard } from './components/Dashboard';
import { BotaoSOS } from './components/BotaoSOS';
import type { UsuarioLogado } from './services/api';
import './App.css';

function recuperarUsuarioSalvo(): UsuarioLogado | null {
  const bruto = localStorage.getItem('lembremed_usuario');
  return bruto ? JSON.parse(bruto) : null;
}

function App() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(recuperarUsuarioSalvo());
  const [tela, setTela] = useState<'login' | 'cadastro'>('login');

  // NOVO: Estado para saber qual card ele clicou
  const [papelCadastro, setPapelCadastro] = useState<'PACIENTE' | 'CUIDADOR'>('PACIENTE');

  function aoAutenticar(usuarioLogado: UsuarioLogado, token: string) {
    localStorage.setItem('lembremed_usuario', JSON.stringify(usuarioLogado));
    localStorage.setItem('lembremed_token', token);
    localStorage.setItem('lembremed_paciente_id', usuarioLogado.id);
    setUsuario(usuarioLogado);
  }

  function sair() {
    localStorage.removeItem('lembremed_usuario');
    localStorage.removeItem('lembremed_token');
    localStorage.removeItem('lembremed_paciente_id');
    setUsuario(null);
    setTela('login');
  }

  if (!usuario) {
    return tela === 'login' ? (
      <Login
        aoLogar={aoAutenticar}
        aoIrParaCadastro={(papelClicado) => {
          setPapelCadastro(papelClicado); // Salva qual card foi clicado
          setTela('cadastro'); // Muda para a tela de cadastro
        }}
      />
    ) : (
      <Cadastro
        papelInicial={papelCadastro} // Passa a informação para o formulário de cadastro
        aoCadastrar={aoAutenticar}
        aoVoltarParaLogin={() => setTela('login')}
      />
    );
  }

  return (
    <div className="app-shell">
      <nav style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
        <span>Olá, {usuario.nome}</span>
        <button type="button" onClick={sair}>Sair</button>
      </nav>

      {usuario.papel === 'CUIDADOR' ? <Dashboard /> : <MeusRemedios />}

      <BotaoSOS />
    </div>
  );
}

export default App;