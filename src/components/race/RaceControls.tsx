import { Card } from '../ui/Card';
import { Cloud, CloudRain, Sun, Shield, Gauge, RotateCcw } from 'lucide-react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useSimulation } from '../../hooks/useSimulation';

export const RaceControls = () => {
  const { 
    weather, 
    setWeather, 
    safetyCar, 
    toggleSafetyCar,
    resetRace
  } = useSimulationStore();
  
  const {
    simulationSpeed,
    speedUp,
    slowDown,
    isRaceRunning
  } = useSimulation();

  const weatherOptions = [
    { value: 'DRY' as const, label: 'Sec', icon: Sun, color: 'text-yellow-400' },
    { value: 'DRIZZLE' as const, label: 'Pluie fine', icon: CloudRain, color: 'text-blue-400' },
    { value: 'WET' as const, label: 'Pluie', icon: Cloud, color: 'text-gray-400' }
  ];

  const speedLabels: Record<number, string> = {
    300: '3x',
    450: '2x', 
    900: '1x',
    1500: '0.5x',
    3000: '0.25x'
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Gauge size={20} className="text-red-400" />
        CONTRÔLES COURSE
      </h3>

      {/* Contrôle Vitesse */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Vitesse simulation</span>
          <span className="text-white font-bold">
            {speedLabels[simulationSpeed] || '1x'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={slowDown}
            disabled={simulationSpeed >= 3000}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white flex-1 py-2 text-xs rounded transition-colors"
          >
            ◀️ Ralentir
          </button>
          <button
            onClick={speedUp}
            disabled={simulationSpeed <= 300}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white flex-1 py-2 text-xs rounded transition-colors"
          >
            Accélérer ▶️
          </button>
        </div>
      </div>

      {/* Contrôle Météo */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Météo</label>
        <div className="grid grid-cols-3 gap-2">
          {weatherOptions.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => setWeather(value)}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                weather === value 
                  ? 'bg-blue-600 text-white scale-105' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={16} className={`mx-auto mb-1 ${color}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Car */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Safety Car</label>
        <button
          onClick={toggleSafetyCar}
          className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
            safetyCar === 'SC' 
              ? 'bg-yellow-600 text-white animate-pulse' 
              : safetyCar === 'VSC'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Shield size={16} className="inline mr-2" />
          {safetyCar === 'SC' ? 'SAFETY CAR' : 
           safetyCar === 'VSC' ? 'VSC' : 'Course normale'}
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={resetRace}
        disabled={isRaceRunning}
        className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-2 text-sm rounded flex items-center justify-center gap-2 transition-colors"
      >
        <RotateCcw size={16} />
        Reset Course
      </button>
    </Card>
  );
};