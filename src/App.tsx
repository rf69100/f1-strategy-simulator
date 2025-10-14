import { PitWall } from './components/layout/PitWall';
import { useSimulation } from './hooks/useSimulation';

function App() {
  const { isRaceRunning } = useSimulation();

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