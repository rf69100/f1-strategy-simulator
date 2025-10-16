import React from "react";
import { Card } from "../ui/Card";
import { CIRCUIT_DATA } from "../../utils/f1Data";

export interface MenuCircuitProps {
  selectedCircuit?: string;
  onSelectCircuit: (circuit: string) => void;
}

const MenuCircuit: React.FC<MenuCircuitProps> = ({ selectedCircuit, onSelectCircuit }) => {
  return (
    <>
      <Card className="p-8 mb-8 animate-fade-in text-center">
        <h2 className="text-2xl font-extrabold mb-4 text-green-400">Sélection du circuit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {Object.entries(CIRCUIT_DATA).map(([id, c]) => (
            <button
              key={id}
              className={`flex flex-col items-center p-4 rounded-lg shadow-xl border-2 transition-colors ${selectedCircuit === id ? "border-green-500 bg-green-900/30" : "border-gray-700 bg-gray-800 hover:border-green-400"}`}
              onClick={() => onSelectCircuit(id)}
            >
              <span className="font-bold text-lg mb-1">{c.name}</span>
              <span className="text-gray-400 text-sm mb-1">{c.laps} tours &bull; {c.lapDistance} km/tour</span>
              <span className="text-xs text-gray-300">Virages: {c.corners} &bull; DRS: {c.drsZones}</span>
            </button>
          ))}
        </div>
      </Card>
    </>
  );
};

export default MenuCircuit;
