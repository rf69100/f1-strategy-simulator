import { useState, useEffect } from 'react';
import { Play, Square, SkipForward, Settings } from 'lucide-react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useSimulation } from '../../hooks/useSimulation';
import { Card } from '../ui/Card';
import { DriverCard } from '../simulation/DriverCard';
import TimingTower from '../simulation/TimingTower';
import { CircuitSelector } from '../ui/CircuitSelector';
import { RaceControls } from '../race/RaceControls';
import { StrategyModal } from '../simulation/StrategyModal';

export const PitWall = ({ menuChoices }: { menuChoices?: any }) => {
  // Find selected drivers from menuChoices
  const selectedDrivers = menuChoices && menuChoices.driver1 && menuChoices.driver2 ? [menuChoices.driver1, menuChoices.driver2] : [];
  // ...existing code...
  // All hooks and store variables are now initialized
  // ...existing code...

  const { 
    isRaceRunning, 
    currentLap, 
    totalLaps,
    drivers,
    safetyCar,
    startRace, 
    stopRace, 
    advanceLap,
    manualPit,
    pitConfig,
    setDrivers,
    setCircuit,
    setTeam
  } = useSimulationStore();

  // Appliquer les choix du menu à la simulation dès le début
  useEffect(() => {
    if (menuChoices) {
      if (menuChoices.circuit) setCircuit(menuChoices.circuit);
      if (menuChoices.team) setTeam(menuChoices.team);
      if (menuChoices.driver1 && menuChoices.driver2) setDrivers([menuChoices.driver1, menuChoices.driver2]);
      // ... autres paramètres
    }
  }, [menuChoices]);

  const { getLeader } = useSimulation();
  const [selectedDriverForStrategy, setSelectedDriverForStrategy] = useState<string | null>(null);
  const [showRaceControls, setShowRaceControls] = useState(false);

  const progress = (currentLap / totalLaps) * 100;
  const leader = getLeader();
  // Trouver le pilote ayant fait le meilleur tour
  type BestLapDriver = { name: string; bestLap: number } | null;
  const bestLapDriver: BestLapDriver = (() => {
    let best: BestLapDriver = null;
    drivers.forEach(d => {
      if (d.lapTimes && d.lapTimes.length > 0) {
        const minLap = Math.min(...d.lapTimes);
        if (!best || minLap < best.bestLap) {
          best = { name: d.name, bestLap: minLap };
        }
      }
    });
    return best;
  })();

  // Build timing data for tower after all variables are initialized
  const timingDrivers = drivers
    .slice() // avoid mutating original array
    .sort((a, b) => a.position - b.position)
    .map((d, idx) => ({
      name: d.name,
      position: d.position,
      lapTime: d.lapTimes?.[d.lapTimes.length - 1]?.toFixed(3) + 's' || '--',
      gap: idx === 0 ? '+0.000s' : (d.totalTime - drivers[0].totalTime).toFixed(3) + 's',
      isSelected: selectedDrivers.includes(d.name)
    }));

  return (
  <div className="w-full px-2 md:px-8 pt-10 pb-20 bg-gradient-to-br from-black via-gray-900 to-red-900 min-h-screen flex flex-col items-center relative">
    {/* F1 Timing Tower Sidebar */}
    <TimingTower drivers={timingDrivers} />
  <div className="w-full max-w-8xl mx-auto flex flex-col items-center">
        
        {/* HEADER AMÉLIORÉ */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-10 w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            
            {/* Titre et Circuit */}
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-2">
                🏎️ F1 STRATEGY SIMULATOR 2026
              </h1>
              <div className="flex flex-col xs:flex-row items-center gap-3 text-sm xs:text-base">
                <CircuitSelector />
                <div className="flex items-center gap-4">
                  <div className="text-white bg-black/30 px-3 py-1 rounded-lg">
                    Tour: <span className="text-red-400 font-bold">{currentLap}</span> / {totalLaps}
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${
                    isRaceRunning ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {isRaceRunning ? '🟢 EN COURS' : '🔴 ARRÊTÉ'}
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${
                    safetyCar !== 'NONE' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-900/50 text-blue-400'
                  }`}>
                    {safetyCar !== 'NONE' ? '🚨 SAFETY CAR' : '✅ GREEN FLAG'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Barre de Progression et Leader */}
              <div className="w-full lg:w-80 flex flex-col lg:flex-row gap-3">
                <div className="space-y-3 flex-1">
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progression</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-500 shadow-lg shadow-red-500/20"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  {leader && (
                    <div className="bg-black/30 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400">LEADER</div>
                      <div className="text-white font-bold text-lg">{leader.name}</div>
                      <div className="text-red-400 text-sm">P1 • +0.000s</div>
                    </div>
                  )}
                </div>
                {/* Encadré meilleur tour */}
                {bestLapDriver ? (
                  <div className="bg-black/30 rounded-lg p-3 text-center flex-1">
                    <div className="text-xs text-gray-400">MEILLEUR TOUR</div>
                    <div className="text-white font-bold text-lg">{(bestLapDriver as { name: string; bestLap: number }).name}</div>
                    <div className="text-green-400 text-sm">{(bestLapDriver as { name: string; bestLap: number }).bestLap.toFixed(3)}s</div>
                  </div>
                ) : null}
              </div>
            
            {/* Contrôles Principaux */}
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={startRace}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 text-sm rounded transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isRaceRunning}
              >
                <Play size={16} />
                <span className="hidden xs:inline">Start</span>
              </button>
              
              <button 
                onClick={stopRace}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 py-2 text-sm rounded transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={!isRaceRunning}
              >
                <Square size={16} />
                <span className="hidden xs:inline">Stop</span>
              </button>
              
              <button 
                onClick={advanceLap}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-2 text-sm rounded transition-colors"
              >
                <SkipForward size={16} />
                <span className="hidden xs:inline">+1 Lap</span>
              </button>
              
              <button 
                onClick={() => setShowRaceControls(!showRaceControls)}
                className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2 px-4 py-2 text-sm rounded transition-colors"
              >
                <Settings size={16} />
                <span className="hidden xs:inline">Contrôles</span>
              </button>
            </div>
          </div>
        </div>

        {/* PANEL CONTRÔLES AVANCÉS */}
        {showRaceControls && (
          <div className="mb-6">
            <RaceControls />
          </div>
        )}

        {/* GRILLE DES 20 PILOTES CORRIGÉE */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 xs:gap-10 py-6 w-full max-w-7xl mx-auto justify-center">
          {drivers.map((driver) => (
            <DriverCard 
              key={driver.id} 
              driver={driver}
              leaderTime={leader?.totalTime}
              onStrategyClick={() => setSelectedDriverForStrategy(driver.id)}
            />
          ))}
        </div>

        {/* STATISTIQUES DE COURSE */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Card className="p-3">
            <div className="text-gray-400 text-sm">Pilotes en course</div>
            <div className="text-white font-bold text-xl">
              {drivers.filter(d => d.status === 'RUNNING').length}/{drivers.length}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-gray-400 text-sm">Arrêts au total</div>
            <div className="text-white font-bold text-xl">
              {drivers.reduce((sum, d) => sum + d.pitStops, 0)}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-gray-400 text-sm">Temps écoulé</div>
            <div className="text-white font-bold text-xl">
              {Math.floor(currentLap * 1.5)}min
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-gray-400 text-sm">Tours restants</div>
            <div className="text-white font-bold text-xl">
              {totalLaps - currentLap}
            </div>
          </Card>
        </div>

        {/* MODAL STRATÉGIE */}
        {selectedDriverForStrategy && (
          <StrategyModal 
            isOpen={!!selectedDriverForStrategy}
            onClose={() => setSelectedDriverForStrategy(null)}
            driverId={selectedDriverForStrategy}
            manualPit={manualPit}
            pitConfig={pitConfig}
          />
        )}

        {/* BANDEAU MOBILE AMÉLIORÉ */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-gradient-to-r from-red-600 to-red-700 p-3 backdrop-blur-sm">
          <div className="flex justify-between items-center text-white text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold">Tour {currentLap}</span>
              <span className="text-xs bg-black/30 px-2 py-1 rounded">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>{isRaceRunning ? '🏁' : '⏸️'}</span>
              <span>{safetyCar !== 'NONE' ? '🚨' : '✅'}</span>
              <button 
                onClick={() => setShowRaceControls(!showRaceControls)}
                className="bg-white/20 p-1 rounded"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};