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
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-4">
      <h4 className="text-lg font-bold text-white mb-2">Historique des Stints</h4>
      <div className="space-y-2">
        {stints.map((stint, idx) => (
          <div key={idx} className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-1 rounded font-bold ${
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
