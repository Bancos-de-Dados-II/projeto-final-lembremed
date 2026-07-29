import { useState } from 'react';
import { Login } from './components/Login';
import { Cadastro } from './components/Cadastro';
import { MeusRemedios } from './components/MeusRemedios';
import { PainelCuidador } from './components/PainelCuidador';
import type { UsuarioLogado } from './services/api';
import './App.css';

function recuperarUsuarioSalvo(): UsuarioLogado | null {
  const bruto = localStorage.getItem('lembremed_usuario');
  return bruto ? JSON.parse(bruto) : null;
}

function App() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(recuperarUsuarioSalvo());
  const [tela, setTela] = useState<'login' | 'cadastro'>('login');
  const [papelCadastro, setPapelCadastro] = useState<'PACIENTE' | 'CUIDADOR'>('PACIENTE');

  function aoAutenticar(usuarioLogado: UsuarioLogado, token: string) {
    localStorage.setItem('lembremed_usuario', JSON.stringify(usuarioLogado));
    localStorage.setItem('lembremed_token', token);

    // Só salva pacienteId quando quem logou É o paciente.
    // Cuidador não tem medicamentos próprios — ele escolhe o paciente
    // dentro do Painel do Cuidador.
    if (usuarioLogado.papel === 'PACIENTE') {
      localStorage.setItem('lembremed_paciente_id', usuarioLogado.id);
    } else {
      localStorage.removeItem('lembremed_paciente_id');
    }

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
          setPapelCadastro(papelClicado);
          setTela('cadastro');
        }}
      />
    ) : (
      <Cadastro
        papelInicial={papelCadastro}
        aoCadastrar={aoAutenticar}
        aoVoltarParaLogin={() => setTela('login')}
      />
    );
  }

  return (
    <div className="app-shell">
      {usuario.papel === 'CUIDADOR' ? (
        <PainelCuidador aoSair={sair} />
      ) : (
        <MeusRemedios usuario={usuario} aoSair={sair} />
      )}
    </div>
  );
}

export default App;