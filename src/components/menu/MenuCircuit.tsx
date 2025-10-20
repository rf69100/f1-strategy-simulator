import React, { useState } from "react";
import { Card } from "../ui/Card";
import { CIRCUIT_DATA } from "../../utils/f1Data";

export interface MenuCircuitProps {
  selectedCircuit?: string;
  onSelectCircuit: (circuit: string) => void;
}

const MenuCircuit: React.FC<MenuCircuitProps> = ({ selectedCircuit, onSelectCircuit }) => {
  const [localSelected, setLocalSelected] = useState<string | undefined>(selectedCircuit);
  const circuit = localSelected ? CIRCUIT_DATA[localSelected] : undefined;
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
      <Card className="p-4 sm:p-6 md:p-8 mb-4 md:mb-8 animate-fade-in text-center min-w-[220px] sm:min-w-[320px] md:min-w-[420px]">
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold mb-2 sm:mb-4 text-green-400">Sélection du circuit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {Object.entries(CIRCUIT_DATA).map(([id, c]) => {
            const isSelected = localSelected === id;
            return (
              <button
                key={id}
                className={`flex flex-col items-center p-2 sm:p-4 rounded-lg shadow-xl border-2 transition-colors focus:outline-none focus:ring-2 text-xs sm:text-sm md:text-base ${isSelected ? "border-green-500 bg-green-900/30 ring-green-400" : "border-gray-700 bg-gray-800 hover:border-green-400"}`}
                onClick={() => setLocalSelected(prev => prev === id ? undefined : id)}
                aria-pressed={isSelected}
              >
                <span className="font-bold text-base sm:text-lg mb-1">{c.name}</span>
                <span className="text-gray-400 text-xs sm:text-sm mb-1">{c.laps} tours &bull; {c.lapDistance} km/tour</span>
                <span className="text-xs text-gray-300">Virages: {c.corners} &bull; DRS: {c.drsZones}</span>
                {isSelected && <span className="mt-2 text-green-400 text-xs font-semibold">Sélectionné</span>}
              </button>
            );
          })}
        </div>
      </Card>
      {/* Affichage des infos détaillées du circuit sélectionné */}
      <div className="flex-1">
        {circuit ? (
          <Card className="p-4 sm:p-6 md:p-8 mb-4 md:mb-8 animate-fade-in">
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-blue-400 mb-2 sm:mb-4">{circuit.name}</h3>
            <ul className="text-xs sm:text-lg text-white mb-4 sm:mb-6 space-y-1 sm:space-y-2">
              <li><b>Distance au tour :</b> {circuit.lapDistance} km</li>
              <li><b>Nombre de tours :</b> {circuit.laps}</li>
              <li><b>Virages :</b> {circuit.corners}</li>
              <li><b>DRS Zones :</b> {circuit.drsZones}</li>
              <li><b>Vitesse max :</b> {circuit.topSpeed} km/h</li>
              <li><b>Vitesse moyenne :</b> {circuit.averageSpeed} km/h</li>
              <li><b>Usure pneus :</b> {circuit.tyreWear}</li>
              <li><b>Effet carburant :</b> {circuit.fuelEffect}</li>
              <li><b>Temps pole :</b> {circuit.poleTime}s</li>
            </ul>
            <button
              className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg text-base sm:text-lg transition mt-2"
              onClick={() => localSelected && onSelectCircuit(localSelected)}
              disabled={!localSelected}
            >
              Valider ce circuit
            </button>
          </Card>
        ) : (
          <Card className="p-4 sm:p-6 md:p-8 mb-4 md:mb-8 animate-fade-in text-center text-gray-400">
            <span className="text-xs sm:text-base">Sélectionnez un circuit pour voir ses détails.</span>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MenuCircuit;
