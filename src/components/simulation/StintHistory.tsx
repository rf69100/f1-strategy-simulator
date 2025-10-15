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
  const stints: Stint[] = [];
  // Build a lap-by-lap compound history
  let compoundHistory: string[] = [];
  let currentCompound = driver.tyres.compound;
  if (driver.lapTimes.length > 0) {
    // Assume first lap is starting compound
    compoundHistory.push(currentCompound);
    for (let lap = 1; lap < driver.lapTimes.length; lap++) {
      // If tyre age == 0, compound changed this lap
      if (lap > 0 && driver.lapTimes[lap] && driver.tyres.age === 0 && driver.tyres.compound !== compoundHistory[compoundHistory.length - 1]) {
        compoundHistory.push(driver.tyres.compound);
      } else {
        compoundHistory.push(compoundHistory[compoundHistory.length - 1]);
      }
    }
  }
  // Build stints from compoundHistory
  let stintStart = 1;
  for (let lap = 1; lap <= compoundHistory.length; lap++) {
    if (lap === compoundHistory.length || compoundHistory[lap] !== compoundHistory[lap - 1]) {
      stints.push({
        compound: compoundHistory[lap - 1],
        startLap: stintStart,
        endLap: lap,
        laps: lap - stintStart + 1
      });
      stintStart = lap + 1;
    }
  }
  return stints;
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
