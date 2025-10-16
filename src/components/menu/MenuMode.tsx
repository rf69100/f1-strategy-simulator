import React from "react";
import { Card } from "../ui/Card";

export interface MenuModeProps {
  onSelectMode: (mode: "gp" | "race") => void;
}

const MenuMode: React.FC<MenuModeProps> = ({ onSelectMode }) => {
  return (
    <>
      <Card className="p-8 mb-8 animate-fade-in text-center">
        <h2 className="text-2xl font-extrabold mb-4 text-red-500">Choisissez votre mode</h2>
        <div className="flex flex-col gap-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full shadow-xl text-lg"
            onClick={() => onSelectMode("gp")}
          >
            Grand Prix complet (Essais + Qualifs + Course)
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full shadow-xl text-lg"
            onClick={() => onSelectMode("race")}
          >
            Course simple (Simu rapide)
          </button>
        </div>
      </Card>
    </>
  );
};

export default MenuMode;
