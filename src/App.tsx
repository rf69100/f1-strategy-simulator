import { PitWall } from './components/layout/PitWall';
import { useSimulation } from './hooks/useSimulation';
import { useSimulationStore } from './stores/simulationStore';
import Home from './components/Home';
import MenuFlow from './components/MenuFlow';
import { useState } from 'react';

function App() {
  const { isRaceRunning } = useSimulation();
  const simulationStore = useSimulationStore();
  const [showHome, setShowHome] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [menuDone, setMenuDone] = useState(false);


  // Callback pour la fin du menu
  const handleMenuDone = (choices: any) => {
  console.log('[DEBUG] handleMenuDone called with:', choices);
  if (choices.circuit) simulationStore.setCircuit(choices.circuit);
  if (choices.team) simulationStore.setTeam(choices.team);
  if (choices.driver1 && choices.driver2) simulationStore.setDrivers([choices.driver1, choices.driver2]);
  // NE PAS démarrer la course automatiquement
  setMenuDone(true);
  setShowMenu(false);
  };

  // Lancement du flow : Home -> Menu -> Simulation
  if (showHome) {
    return <Home onPlay={() => { setShowHome(false); setShowMenu(true); }} />;
  }
  if (showMenu && !menuDone) {
    return <MenuFlow onDone={handleMenuDone} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isRaceRunning ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gray-900'}`}>
      <PitWall />
      {/* Overlay d'effet de vitesse pendant la course */}
      {isRaceRunning && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

export default App;