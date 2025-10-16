import React from "react";
import { DRIVER_DATA } from "../../utils/f1Data";
import { TEAM_DATA } from "../../utils/f1Data";

export interface TimingTowerProps {
  drivers: Array<{
    name: string;
    position: number;
    lapTime: string;
    gap: string;
    isSelected?: boolean;
  }>;
}

const TimingTower: React.FC<TimingTowerProps> = ({ drivers }) => {

  // Helper: get team color, abbreviation, compound
  const getTeamColor = (name: string) => {
    const driverData = DRIVER_DATA[name];
    if (driverData) {
      const team = driverData.team;
      return TEAM_DATA[team]?.color || undefined;
    }
    return undefined;
  };

  const getTeamAbbr = (name: string) => {
    const driverData = DRIVER_DATA[name];
    if (!driverData) return "";
    const abbrs: Record<string, string> = {
      'Red Bull': 'RBR', 'Mercedes': 'MER', 'Ferrari': 'FER', 'McLaren': 'MCL', 'Alpine': 'ALP',
      'Aston Martin': 'AMR', 'Sauber': 'SAU', 'Haas': 'HAS', 'RB': 'RB', 'Williams': 'WIL'
    };
    return abbrs[driverData.team] || driverData.team.slice(0,3).toUpperCase();
  };

  const getCompoundColor = (compound: string) => {
    const map: Record<string, string> = {
      'SOFT': 'bg-red-500 text-white',
      'MEDIUM': 'bg-yellow-400 text-black',
      'HARD': 'bg-white text-black',
      'INTERMEDIATE': 'bg-green-500 text-white',
      'WET': 'bg-blue-500 text-white'
    };
    return map[compound] || 'bg-gray-500 text-white';
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-36 md:w-56 bg-black bg-opacity-90 shadow-lg flex flex-col items-center py-4 z-50">
      <h2 className="text-xs md:text-sm font-bold text-red-500 mb-2">Classement</h2>
      <ul className="w-full">
        {drivers.map((driver) => {
          const teamColor = getTeamColor(driver.name);
          const teamAbbr = getTeamAbbr(driver.name);
          // Get compound from driver object if available
          const compoundType = (driver as any).tyres?.compound || 'MEDIUM';
          return (
            <li
              key={driver.name}
              className={`flex items-center mb-2 px-2 py-1 rounded-lg bg-gray-900/60`}
              style={{ borderLeft: `6px solid ${teamColor || '#444'}` }}
            >
              <span className="text-xs md:text-sm font-bold mr-2" style={driver.isSelected ? { color: teamColor } : {}}>
                {driver.position}.
              </span>
              <span className="text-xs md:text-sm font-bold mr-2" style={{ color: teamColor }}>{teamAbbr}</span>
              <span className="text-xs md:text-sm font-bold truncate mr-2" style={driver.isSelected ? { color: teamColor } : {}}>
                {driver.name.split(' ')[driver.name.split(' ').length-1]}
              </span>
              <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${getCompoundColor(compoundType)}`}>{compoundType[0]}</span>
              <span className="ml-2 text-[10px] md:text-xs text-yellow-400 font-bold">{driver.gap}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default TimingTower;
