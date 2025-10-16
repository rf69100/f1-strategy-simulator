import React from "react";
import { Card } from "../ui/Card";
import { DRIVER_DATA } from "../../utils/f1Data";

export interface MenuDriversProps {
  team: string;
  onSelectDriver1: (driver: string) => void;
  onSelectDriver2: (driver: string) => void;
  selectedDriver1?: string;
  selectedDriver2?: string;
}

const MenuDrivers: React.FC<MenuDriversProps> = ({ team, onSelectDriver1, onSelectDriver2, selectedDriver1, selectedDriver2 }) => {
  const drivers = Object.entries(DRIVER_DATA).filter(([_, d]) => d.team === team);

  // Helper to handle selection/deselection
  const handleDriverClick = (name: string) => {
    if (selectedDriver1 === name) {
      onSelectDriver1(""); // Deselect driver 1
    } else if (selectedDriver2 === name) {
      onSelectDriver2(""); // Deselect driver 2
    } else if (!selectedDriver1) {
      onSelectDriver1(name);
    } else if (!selectedDriver2) {
      onSelectDriver2(name);
    }
  };

  return (
    <>
      <Card className="p-8 mb-8 animate-fade-in text-center">
        <h2 className="text-2xl font-extrabold mb-4 text-green-400">Sélectionnez vos pilotes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {drivers.map(([name, d]) => {
            const isSelected = selectedDriver1 === name || selectedDriver2 === name;
            return (
              <button
                key={name}
                className={`flex flex-col items-center p-4 rounded-lg shadow-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ${isSelected ? "border-red-500 bg-red-900/30" : "border-gray-700 bg-gray-800 hover:border-red-400"}`}
                onClick={() => handleDriverClick(name)}
                aria-pressed={isSelected}
              >
                <img src={d.photo} alt={name} className="w-20 h-20 rounded-full mb-2 border-2 border-gray-700 object-cover" />
                <span className="font-bold text-lg mb-1">{name}</span>
                <span className="text-gray-400 text-sm mb-1">{d.nationality} &bull; {d.team}</span>
                {isSelected && (
                  <span className="mt-2 text-red-400 text-xs font-semibold">Sélectionné</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </>
  );
};

export default MenuDrivers;
