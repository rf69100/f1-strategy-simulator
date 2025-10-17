import React from "react";
import { Card } from "../ui/Card";
import { TEAM_DATA, DRIVER_DATA } from "../../utils/f1Data";
import { useState } from "react";
import { useSimulationStore } from '../../stores/simulationStore';
import { TyreCompound } from '../../types/f1';
import { TeamName } from "../../types/f1";

export interface MenuConfirmProps {
  team: string;
  driver1: string;
  driver2?: string;
  onConfirm: () => void;
}

const MenuConfirm: React.FC<MenuConfirmProps> = ({ team, driver1, driver2, onConfirm }) => {
  const [fuelPct, setFuelPct] = useState<number>(95);
  const [tyre, setTyre] = useState<TyreCompound>('MEDIUM');
  const setRaceSettings = useSimulationStore(state => state.setRaceSettings);
  return (
    <>
      <Card className="p-8 mb-8 animate-fade-in text-center">
        <h2 className="text-2xl font-extrabold mb-4 text-yellow-400">Confirmation de votre choix</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold mb-2">Pilotes sélectionnés</span>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <img src={DRIVER_DATA[driver1].photo} alt={driver1} className="w-20 h-20 rounded-full mb-2 border-2 border-gray-700 object-cover" />
                <span className="font-bold text-md mb-1">{driver1}</span>
                <span className="text-gray-400 text-xs mb-1">{DRIVER_DATA[driver1].nationality}</span>
              </div>
              {driver2 && (
                <div className="flex flex-col items-center">
                  <img src={DRIVER_DATA[driver2].photo} alt={driver2} className="w-20 h-20 rounded-full mb-2 border-2 border-gray-700 object-cover" />
                  <span className="font-bold text-md mb-1">{driver2}</span>
                  <span className="text-gray-400 text-xs mb-1">{DRIVER_DATA[driver2].nationality}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold mb-2">Écurie sélectionnée</span>
            <span className="text-2xl font-extrabold mb-2" style={{color: TEAM_DATA[team as TeamName].color}}>{team}</span>
            <div className="w-16 h-16 rounded-full mb-2" style={{backgroundColor: TEAM_DATA[team as TeamName].color}}></div>
            <div className="text-xs text-gray-300 mb-1">
              <span>Performance: <span className="font-bold text-green-400">{Math.round(TEAM_DATA[team as TeamName].performance * 100)}%</span></span><br/>
              <span>Fiabilité: <span className="font-bold text-blue-400">{Math.round(TEAM_DATA[team as TeamName].reliability * 100)}%</span></span><br/>
              <span>Pitstop: <span className="font-bold text-yellow-400">{TEAM_DATA[team as TeamName].pitstop}s</span></span>
            </div>
          </div>
        </div>
        {/* Choix carburant & pneus au départ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-left">
            <label className="text-sm text-gray-300">Carburant initial (%)</label>
            <input type="range" min={50} max={100} value={fuelPct} onChange={(e) => setFuelPct(Number(e.target.value))} className="w-full" />
            <div className="text-sm text-gray-200">{fuelPct}%</div>
          </div>
          <div className="text-left">
            <label className="text-sm text-gray-300">Pneus au départ</label>
            <div className="flex gap-2 mt-2">
              {(['SOFT','MEDIUM','HARD','INTERMEDIATE','WET'] as TyreCompound[]).map(t => (
                <button key={t} onClick={() => setTyre(t)} className={`px-3 py-2 rounded ${tyre === t ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <button
          className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full shadow-xl text-lg animate-pulse"
          onClick={() => {
            setRaceSettings({ initialFuelPct: fuelPct, initialTyreCompound: tyre });
            onConfirm();
          }}
        >
          Valider et continuer
        </button>
      </Card>
    </>
  );
};

export default MenuConfirm;
