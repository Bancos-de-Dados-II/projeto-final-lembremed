import { MapaFarmacias } from './components/MapaFarmacias';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>LembreMed</h1>
        <p>Módulo de Geolocalização — pontos de saúde renderizados via API</p>
      </header>

      <main className="app-main">
        <MapaFarmacias />
      </main>
    </div>
  );
}

export default App;
