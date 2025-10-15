import React from 'react';
import { Driver } from '../../types/f1';

interface Stint {
  compound: string;
  startLap: number;
  endLap: number;
  laps: number;
}

interface StintHistoryProps {
  driver: Driver;
}

// Utility to build stint history from lapTimes and pitStops
function getStintHistory(driver: Driver): Stint[] {
  // Restore previous working logic: single stint for all laps
  return [{
    compound: driver.tyres.compound,
    startLap: 1,
    endLap: driver.currentLap,
    laps: driver.currentLap
  }];
}

export const StintHistory: React.FC<StintHistoryProps> = ({ driver }) => {
  const stints = getStintHistory(driver);
  return (
  <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 mb-8 shadow-xl">
  <h4 className="text-2xl font-extrabold text-white mb-4 tracking-wide drop-shadow-lg">Historique des Stints</h4>
  <div className="space-y-4">
        {stints.map((stint, idx) => (
          <div key={idx} className="flex items-center gap-6 text-base">
            <span className={`px-3 py-2 rounded-full font-bold shadow-lg text-lg ${
              stint.compound === 'SOFT' ? 'bg-red-500 text-white' :
              stint.compound === 'MEDIUM' ? 'bg-yellow-500 text-black' :
              stint.compound === 'HARD' ? 'bg-white text-black' :
              stint.compound === 'INTERMEDIATE' ? 'bg-green-500 text-white' :
              stint.compound === 'WET' ? 'bg-blue-500 text-white' :
              'bg-gray-700 text-white'
            }`}>
              {stint.compound}
            </span>
            <span>Tour {stint.startLap} → {stint.endLap}</span>
            <span>{stint.laps} tours</span>
          </div>
        ))}
      </div>
    </div>
  );
};
