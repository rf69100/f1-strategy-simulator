import React from "react";
import { Card } from "../ui/Card";

export interface MenuDifficultyProps {
  difficulty: { ai: string; weather: string; incidents: string };
  onChange: (field: "ai" | "weather" | "incidents", value: string) => void;
  onNext: () => void;
}

const MenuDifficulty: React.FC<MenuDifficultyProps> = ({ difficulty, onChange, onNext }) => {
  return (
    <>
      <Card className="p-8 mb-8 animate-fade-in text-center">
        <h2 className="text-2xl font-extrabold mb-4 text-blue-400">Réglage de la difficulté</h2>
        <div className="flex flex-col gap-6 mb-6">
          <div>
            <span className="font-bold">Niveau IA :</span>
            <div className="flex gap-4 mt-2 justify-center">
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.ai === "facile" ? "bg-green-600" : "bg-gray-700"}`} onClick={() => onChange("ai", "facile")}>Facile</button>
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.ai === "normal" ? "bg-blue-600" : "bg-gray-700"}`} onClick={() => onChange("ai", "normal")}>Normal</button>
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.ai === "difficile" ? "bg-red-600" : "bg-gray-700"}`} onClick={() => onChange("ai", "difficile")}>Difficile</button>
            </div>
          </div>
          <div>
            <span className="font-bold">Météo :</span>
            <div className="flex gap-4 mt-2 justify-center">
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.weather === "auto" ? "bg-blue-600" : "bg-gray-700"}`} onClick={() => onChange("weather", "auto")}>Automatique</button>
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.weather === "sec" ? "bg-yellow-600" : "bg-gray-700"}`} onClick={() => onChange("weather", "sec")}>Sec</button>
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.weather === "pluie" ? "bg-indigo-600" : "bg-gray-700"}`} onClick={() => onChange("weather", "pluie")}>Pluie</button>
            </div>
          </div>
          <div>
            <span className="font-bold">Incidents :</span>
            <div className="flex gap-4 mt-2 justify-center">
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.incidents === "peu" ? "bg-green-600" : "bg-gray-700"}`} onClick={() => onChange("incidents", "peu")}>Peu</button>
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.incidents === "normal" ? "bg-blue-600" : "bg-gray-700"}`} onClick={() => onChange("incidents", "normal")}>Normal</button>
              <button className={`py-2 px-4 rounded-lg font-bold ${difficulty.incidents === "beaucoup" ? "bg-red-600" : "bg-gray-700"}`} onClick={() => onChange("incidents", "beaucoup")}>Beaucoup</button>
            </div>
          </div>
        </div>
        <button
          className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full shadow-xl text-lg animate-pulse"
          onClick={onNext}
        >
          Continuer
        </button>
      </Card>
    </>
  );
};

export default MenuDifficulty;
