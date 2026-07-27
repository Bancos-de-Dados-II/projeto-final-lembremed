import { MeusRemedios } from './components/MeusRemedios';
import { MapaFarmacias } from './components/MapaFarmacias';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <MeusRemedios />
      <div className="secao-mapa">
        <MapaFarmacias />
      </div>
    </div>
  );
}

export default App;