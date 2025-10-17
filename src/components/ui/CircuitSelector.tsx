import { useState } from 'react';
import { Card } from './Card';
import { MapPin, Clock, TrendingUp, Zap } from 'lucide-react';
import { CIRCUIT_DATA } from '../../utils/f1Data';
import { useSimulationStore } from '../../stores/simulationStore';

export const CircuitSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setCircuit, raceSettings } = useSimulationStore();

  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(raceSettings.circuitId || null);
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
          <div className="max-w-5xl w-full max-h-[80vh] overflow-y-auto">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">SÉLECTION DU CIRCUIT</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: liste circuits (nom uniquement) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {circuits.map(([id, circuit]) => {
                    const active = id === selectedCircuitId;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedCircuitId(id)}
                        className={`text-left rounded-lg p-3 transition-all border ${active ? 'ring-2 ring-blue-500 border-blue-600 bg-gray-900' : 'bg-gray-800 border-gray-600 hover:scale-105'}`}
                      >
                        <div className="flex items-center gap-3 mb-0">
                          <MapPin size={18} className="text-red-400" />
                          <h3 className={`text-md font-bold ${active ? 'text-blue-300' : 'text-white'}`}>{circuit.name}</h3>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right: détails sélection */}
                <div className="lg:col-span-1">
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Détails du circuit</h3>
                      {!selectedCircuitId && <p className="text-gray-400">Sélectionne un circuit à gauche pour voir les détails.</p>}
                      {selectedCircuitId && (() => {
                        const c = CIRCUIT_DATA[selectedCircuitId as keyof typeof CIRCUIT_DATA];
                        return (
                          <div className="text-sm text-gray-300 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Nom</span>
                              <span>{c.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Tours</span>
                              <span>{c.laps}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Distance / tour</span>
                              <span>{c.lapDistance} km</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Vitesse max</span>
                              <span>{c.topSpeed} km/h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Virages</span>
                              <span>{c.corners}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">DRS zones</span>
                              <span>{c.drsZones}</span>
                            </div>
                            <div className="pt-2">
                              <span className={`px-2 py-1 rounded-full text-white ${
                                c.tyreWear > 1.2 ? 'bg-red-500' : c.tyreWear > 0.9 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}>{c.tyreWear > 1.2 ? '🔄 Usure élevée' : c.tyreWear > 0.9 ? '⚠️ Usure moyenne' : '✅ Usure faible'}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mt-4">
                      <button
                        disabled={!selectedCircuitId}
                        onClick={() => {
                          if (selectedCircuitId) {
                            setCircuit(selectedCircuitId);
                            setIsOpen(false);
                          }
                        }}
                        className={`w-full py-2 rounded font-bold text-white ${selectedCircuitId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                      >
                        Valider le circuit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};