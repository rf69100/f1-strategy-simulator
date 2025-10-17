import { useState, useEffect } from 'react';
import type { Driver } from '../../types/f1';
import { useSimulationStore } from '../../stores/simulationStore';
import { useSimulation } from '../../hooks/useSimulation';
import { Card } from '../ui/Card';
import { DriverCard } from '../simulation/DriverCard';
import TimingTower from '../simulation/TimingTower';
import { StrategyModal } from '../simulation/StrategyModal';

export const PitWall = ({ menuChoices }: { menuChoices?: any }) => {
  // Ajout navigation retour menu
  const [goToMenu, setGoToMenu] = useState(false);
  if (goToMenu) {
    window.location.href = '/'; // ou navigation React si disponible
    return null;
  }
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
    qualifyingGrid,
    safetyCar,
  // startRace, stopRace, advanceLap, // removed unused controls
    manualPit,
    pitConfig,
    setDrivers,
    setCircuit,
    setTeam
  } = useSimulationStore();

  // Appliquer les choix du menu à la simulation dès le début
  // Initialisation unique des paramètres de course depuis le menu
  useEffect(() => {
    // Toujours initialiser drivers/circuit si menuChoices existe.
    if (!menuChoices) return;
    if (drivers.length === 0) {
      if (menuChoices.circuit) setCircuit(menuChoices.circuit);
      if (menuChoices.team) setTeam(menuChoices.team);
      if (menuChoices.driver1 && menuChoices.driver2) setDrivers([menuChoices.driver1, menuChoices.driver2]);
      return;
    }
    // Si les drivers existent déjà mais aucun n'est marqué comme user-controlled, appliquer les sélections du menu
    const anyUserControlled = drivers.some(d => d.isUserControlled);
    if (!anyUserControlled && menuChoices.driver1 && menuChoices.driver2) {
      setDrivers([menuChoices.driver1, menuChoices.driver2]);
      if (menuChoices.circuit) setCircuit(menuChoices.circuit);
      if (menuChoices.team) setTeam(menuChoices.team);
    }
  }, [menuChoices, drivers.length]);

  const { getLeader } = useSimulation();
  // Gestion du modal stratégie pour pilotes utilisateur
  const [showRaceControls, setShowRaceControls] = useState(false);
  const [selectedDriverForStrategy, setSelectedDriverForStrategy] = useState<string | null>(null);

  const progress = (currentLap / totalLaps) * 100;
  const leader = getLeader();
  // Trouver le pilote ayant fait le meilleur tour
  function getBestLapDriver(drivers: Driver[]): { name: string; bestLap: number } | null {
    let best: { name: string; bestLap: number } | null = null;
    for (const d of drivers) {
      if (d.lapTimes && d.lapTimes.length > 0) {
        const minLap = Math.min(...d.lapTimes);
        if (!best || minLap < best.bestLap) {
          best = { name: d.name, bestLap: minLap };
        }
      }
    }
    return best;
  }
  const bestLapDriver = getBestLapDriver(drivers);

  // Utilise l'ordre de la grille de départ (qualifyingGrid) si disponible
  const orderedDrivers = qualifyingGrid && qualifyingGrid.length > 0
    ? qualifyingGrid.map(id => drivers.find(d => d.id === id)).filter((d): d is Driver => !!d)
    : drivers.slice().sort((a, b) => a.position - b.position);

    // DEBUG: Show grid info for diagnosis
    const debugGridInfo = (
      <div style={{position: 'absolute', top: 0, left: 0, background: '#222', color: 'yellow', zIndex: 9999, padding: '8px', fontSize: '12px'}}>
        <div>DEBUG GRID:</div>
        <div>qualifyingGrid: {JSON.stringify(qualifyingGrid)}</div>
        <div>drivers: {drivers.map(d => d.id + ':' + d.position).join(', ')}</div>
        <div>orderedDrivers: {orderedDrivers.map(d => d.id).join(', ')}</div>
      </div>
    );
  // Build timing data for tower after all variables are initialized
  const timingDrivers = orderedDrivers
    // Correction : classement F1, positions fixes 1 à 20
    .map((d, idx) => {
      if (!d) return {
        name: `Position ${idx+1} vide`,
        position: idx+1,
        lapTime: '--',
        gap: '--',
        isSelected: false
      };
      return {
        name: d.name,
        position: idx+1,
        lapTime: d.lapTimes?.[d.lapTimes.length - 1]?.toFixed(3) + 's' || '--',
        gap: idx === 0 ? '+0.000s' : (d.totalTime - orderedDrivers[0].totalTime).toFixed(3) + 's',
        isSelected: selectedDrivers.includes(d.name)
      };
    });

  return (
    <div className="w-full px-2 md:px-8 pt-10 pb-20 bg-gradient-to-br from-black via-gray-900 to-red-900 min-h-screen flex flex-col items-center relative">
  {/* Bloc bouton 'Apparition magique des pilotes' supprimé définitivement */}
      {debugGridInfo}
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
              <span className="text-blue-400 font-bold text-lg">{useSimulationStore.getState().raceSettings.trackName}</span>
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
                {/* Boutons course */}
                <button
                  className="ml-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold"
                  onClick={() => useSimulationStore.setState({ isRaceRunning: true })}
                  disabled={isRaceRunning}
                >
                  Démarrer la course
                </button>
                <button
                  className="ml-2 px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
                  onClick={() => useSimulationStore.setState({ isRaceRunning: false })}
                  disabled={!isRaceRunning}
                >
                  Pause
                </button>
                <button
                  className="ml-2 px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white font-bold"
                  onClick={() => setGoToMenu(true)}
                >
                  Retour au menu
                </button>
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
                <div className="text-white font-bold text-lg">{bestLapDriver.name}</div>
                <div className="text-green-400 text-sm">{bestLapDriver.bestLap.toFixed(3)}s</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

        {/* GRILLE DES 20 PILOTES CORRIGÉE */}
        {/* Bouton pour forcer l'apparition des pilotes si besoin */}
        {/* Bloc bouton supprimé */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 xs:gap-10 py-6 w-full max-w-7xl mx-auto justify-center">
          {[...Array(20)].map((_, i) => {
            const driver = orderedDrivers[i];
            return driver ? (
              <DriverCard
                key={driver.id}
                driver={{ ...driver, position: i + 1 }}
                leaderTime={leader?.totalTime}
                onStrategyClick={() => {
                  if (driver.isUserControlled) setSelectedDriverForStrategy(driver.id);
                }}
              />
            ) : (
              <div key={i} className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">Position P{i+1} vide</div>
            );
          })}
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