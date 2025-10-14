import { useState } from 'react';
import { Card } from './Card';
import { MapPin, Clock, TrendingUp, Zap } from 'lucide-react';
import { CIRCUIT_DATA } from '../../utils/f1Data';
import { useSimulationStore } from '../../stores/simulationStore';

export const CircuitSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setCircuit, raceSettings } = useSimulationStore();
  
  const circuits = Object.entries(CIRCUIT_DATA);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
      >
        <MapPin size={16} />
        {raceSettings.trackName}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  SÉLECTION DU CIRCUIT
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {circuits.map(([id, circuit]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setCircuit(id);
                      setIsOpen(false);
                    }}
                    className="bg-gray-800 rounded-lg p-4 text-left hover:scale-105 transition-all duration-300 group border border-gray-600"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin size={20} className="text-red-400" />
                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                        {circuit.name}
                      </h3>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{circuit.laps} tours • {circuit.lapDistance}km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} />
                        <span>Vitesse max: {circuit.topSpeed}km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={14} />
                        <span>Usure pneus: {circuit.tyreWear > 1.2 ? 'Élevée' : circuit.tyreWear > 0.9 ? 'Moyenne' : 'Faible'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Zones DRS: {circuit.drsZones}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Virages: {circuit.corners}</span>
                        <span className={`px-2 py-1 rounded-full text-white ${
                          circuit.tyreWear > 1.2 ? 'bg-red-500' :
                          circuit.tyreWear > 0.9 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}>
                          {circuit.tyreWear > 1.2 ? '🔄 Usure élevée' :
                           circuit.tyreWear > 0.9 ? '⚠️ Usure moyenne' : '✅ Usure faible'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};