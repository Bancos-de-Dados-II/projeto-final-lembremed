import { MeusRemedios } from './components/MeusRemedios';
import { MapaFarmacias } from './components/MapaFarmacias';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <MeusRemedios />
      <MapaFarmacias />
    </div>
  );
}

export default App;