import { useState } from 'react';
import { MeusRemedios } from './components/MeusRemedios';
import { Dashboard } from './components/Dashboard';
import { BotaoSOS } from './components/BotaoSOS';
import './App.css';

function App() {
  const [tela, setTela] = useState<'paciente' | 'dashboard'>('paciente');

  return (
    <div className="app-shell">
      <nav style={{ display: 'flex', gap: 12, padding: 16 }}>
        <button type="button" onClick={() => setTela('paciente')}>
          Meus Remédios
        </button>
        <button type="button" onClick={() => setTela('dashboard')}>
          Dashboard
        </button>
      </nav>

      {tela === 'paciente' ? <MeusRemedios /> : <Dashboard />}

      <BotaoSOS />
    </div>
  );
}

export default App;
