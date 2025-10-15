import { PitWall } from './components/layout/PitWall';
import { useSimulation } from './hooks/useSimulation';
import Home from './components/Home';
import { useState } from 'react';

function App() {
  const { isRaceRunning } = useSimulation();
  const [showHome, setShowHome] = useState(true);

  if (showHome) {
    return <Home onPlay={() => setShowHome(false)} />;
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