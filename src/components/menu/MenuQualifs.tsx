
import React, { useMemo } from "react";
import { Card } from "../ui/Card";
import { TEAM_DATA } from "../../utils/f1Data";
import { simulateQualifying } from "../../stores/simulationStore";
import { useSimulationStore } from "../../stores/simulationStore";

export interface MenuQualifsProps {
  onNext: () => void;
}


const MenuQualifs: React.FC<MenuQualifsProps> = ({ onNext }) => {
  const drivers = useSimulationStore(state => state.drivers);
  const circuitId = useSimulationStore(state => state.raceSettings.circuitId);
  const setStartingGrid = useSimulationStore(state => state.setStartingGrid);
  const setQualifyingGrid = useSimulationStore(state => state.setQualifyingGrid);

  // Simule les qualifs une seule fois et sauvegarde le classement Q3 dans le store
  const qualifResults = useMemo(() => {
  const results = simulateQualifying(drivers, circuitId);
  // Helper pour générer l'ID cohérent
  const getId = (driver: any) => driver.name.toLowerCase().replace(/ /g, '-');
  // Q3: pilotes non éliminés
  const q3Grid = results.stages[2]?.ranking.map(r => getId(r.driver)) || [];
  // Q2: pilotes éliminés en Q2
  const q2Elim = results.stages[1]?.ranking.filter(r => r.eliminated).map(r => getId(r.driver)) || [];
  // Q1: pilotes éliminés en Q1
  const q1Elim = results.stages[0]?.ranking.filter(r => r.eliminated).map(r => getId(r.driver)) || [];
  // Grille finale = Q3 + Q2 éliminés + Q1 éliminés
  const fullGrid = [...q3Grid, ...q2Elim, ...q1Elim];
  setQualifyingGrid(fullGrid);
  return results;
  }, [drivers, circuitId]);

  // On récupère le classement Q3 sauvegardé
  const qualifyingGrid = useSimulationStore(state => state.qualifyingGrid);
  // On passe le classement Q3 à la grille de départ au démarrage de la course
  const handleStart = () => {
    if (qualifyingGrid && qualifyingGrid.length > 0) {
      setStartingGrid(qualifyingGrid);
    }
    if (onNext) onNext();
  };

  return (
    <Card className="p-8 mb-8 animate-fade-in text-center">
      <h2 className="text-2xl font-extrabold mb-4 text-purple-400">Qualifications F1</h2>
      <p className="mb-6 text-lg text-gray-200">Classement instantané des pilotes pour chaque étape : Q1, Q2, Q3. Les éliminés sont grisés.</p>
      {qualifResults.stages.map((stage) => (
        <div key={stage.name} className="mb-8">
          <h3 className="text-xl font-bold mb-2 text-yellow-400">{stage.name}</h3>
          <ul className="w-full">
            {stage.ranking.map(({ driver, time, eliminated }, i) => {
              const teamColor = TEAM_DATA[driver.team]?.color || '#444';
              const teamAbbr = driver.team.slice(0,3).toUpperCase();
              return (
                <li
                  key={driver.name}
                  className={`flex items-center mb-2 px-2 py-1 rounded-lg bg-gray-900/60 ${eliminated ? 'opacity-50 grayscale' : ''}`}
                  style={{ borderLeft: `6px solid ${teamColor}` }}
                >
                  <span className="text-xs md:text-sm font-bold mr-2" style={{ color: teamColor }}>{i + 1}.</span>
                  <span className="text-xs md:text-sm font-bold mr-2" style={{ color: teamColor }}>{teamAbbr}</span>
                  <span className="text-xs md:text-sm font-bold truncate mr-2" style={{ color: teamColor }}>{driver.name.split(' ')[driver.name.split(' ').length-1]}</span>
                  <span className="ml-2 text-[10px] md:text-xs text-yellow-400 font-bold">{time.toFixed(3)}s</span>
                  {eliminated && <span className="ml-2 text-xs text-red-400">Éliminé</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <button
        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full shadow-xl text-lg animate-pulse"
        onClick={handleStart}
      >
        Démarrer la course
      </button>
    </Card>
  );
};

export default MenuQualifs;
